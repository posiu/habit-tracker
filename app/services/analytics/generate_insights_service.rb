module Analytics
  # Turns the statistics into short, human readable observations.
  # Each insight is { type: :positive | :warning | :info, message: String }.
  class GenerateInsightsService < BaseService
    MIN_COMPLETIONS = 5

    def initialize(stats)
      @stats = stats || {}
    end

    def call
      success(
        [trend_insight, consistency_insight, weekday_insight, habit_insights, goal_insights]
          .flatten.compact
      )
    end

    private

    attr_reader :stats

    def summary
      stats[:summary] || {}
    end

    def trend_insight
      change = summary[:change_percent]
      return nil if change.nil?

      if change >= 10
        insight(:positive, "Completions are up #{change}% compared with the previous period.")
      elsif change <= -10
        insight(:warning, "Completions are down #{change.abs}% compared with the previous period.")
      end
    end

    def consistency_insight
      rate = summary[:active_day_rate]
      return nil if rate.nil? || summary[:completions].to_i.zero?

      if rate >= 80
        insight(:positive, "You were active on #{rate}% of days. Great consistency.")
      elsif rate < 40
        insight(:info, "You were active on only #{rate}% of days. Small daily wins build consistency.")
      end
    end

    def weekday_insight
      days = stats[:weekday_distribution] || []
      return nil if days.sum { |d| d[:completions] } < MIN_COMPLETIONS

      best = days.max_by { |d| d[:completions] }
      worst = days.min_by { |d| d[:completions] }
      return nil if best[:completions] == worst[:completions]

      insight(:info, "#{best[:weekday]} is your strongest day and #{worst[:weekday]} your weakest.")
    end

    def habit_insights
      habits = stats[:habits] || []
      list = []
      top = habits.max_by { |h| h[:completions] }
      list << insight(:positive, "\"#{top[:name]}\" is your most consistent habit (#{top[:completion_rate]}%).") if top && top[:completions].positive?
      slipping = habits.select { |h| h[:completions].zero? && h[:previous_completions].positive? }
      slipping.first(2).each do |h|
        list << insight(:warning, "\"#{h[:name]}\" had no completions this period. Time to restart it?")
      end
      list
    end

    def goal_insights
      (stats[:goals] || []).filter_map do |goal|
        next unless goal[:target_date] && goal[:target_date] <= 14.days.from_now.to_date && goal[:percentage] < 50

        insight(:warning, "Goal \"#{goal[:name]}\" is due #{goal[:target_date]} and is only #{goal[:percentage]}% complete.")
      end
    end

    def insight(type, message)
      { type: type, message: message }
    end
  end
end
