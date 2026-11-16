module Analytics
  # Extended statistics for the dashboard charts and the API.
  #
  #   Analytics::CalculateStatsService.new(user, days: 30).call.data
  #   # => { period:, summary:, daily_series:, weekly_trend:, weekday_distribution:, habits:, goals: }
  class CalculateStatsService < BaseService
    DEFAULT_DAYS = 30
    MAX_DAYS = 365
    TREND_WEEKS = 12

    def initialize(user, days: DEFAULT_DAYS, end_date: Date.current)
      @user = user
      @days = days.to_i.clamp(1, MAX_DAYS)
      @end_date = end_date
    end

    def call
      success(
        period: { from: range.first, to: range.last, days: days },
        summary: summary,
        daily_series: daily_series,
        weekly_trend: weekly_trend,
        weekday_distribution: weekday_distribution,
        habits: habits_stats,
        goals: goals_stats
      )
    rescue StandardError => e
      failure("Failed to calculate statistics: #{e.message}")
    end

    private

    attr_reader :user, :days, :end_date

    def range
      @range ||= (end_date - (days - 1))..end_date
    end

    def previous_range
      @previous_range ||= (range.first - days)..(range.first - 1)
    end

    def completed_entries
      HabitEntry.joins(:daily_entry, :habit)
                .where(completed: true, habits: { user_id: user.id })
    end

    # { Date => completions } for any date range.
    def completions_by_date(date_range)
      completed_entries.where(daily_entries: { entry_date: date_range })
                       .group('daily_entries.entry_date').count
    end

    def current_by_date
      @current_by_date ||= completions_by_date(range)
    end

    def previous_by_date
      @previous_by_date ||= completions_by_date(previous_range)
    end

    def summary
      current = current_by_date.values.sum
      previous = previous_by_date.values.sum
      {
        completions: current,
        previous_completions: previous,
        change_percent: change_percent(current, previous),
        active_days: current_by_date.size,
        previous_active_days: previous_by_date.size,
        active_day_rate: (current_by_date.size * 100.0 / days).round(1),
        average_mood: average_mood
      }
    end

    def change_percent(current, previous)
      return nil if previous.zero?

      ((current - previous) * 100.0 / previous).round(1)
    end

    def average_mood
      value = user.daily_entries.where(entry_date: range).where.not(mood: nil).average(:mood)
      value&.to_f&.round(2)
    end

    def daily_series
      range.map { |date| { date: date, completions: current_by_date.fetch(date, 0) } }
    end

    def weekly_trend
      last_week = end_date.beginning_of_week
      first_week = last_week - (TREND_WEEKS - 1).weeks
      counts = completions_by_date(first_week..end_date)
      (0...TREND_WEEKS).map do |i|
        week_start = first_week + i.weeks
        total = (week_start..[week_start + 6, end_date].min).sum { |d| counts.fetch(d, 0) }
        { week_start: week_start, completions: total }
      end
    end

    # Completions per weekday (Monday first) over the selected period.
    def weekday_distribution
      totals = Hash.new(0)
      current_by_date.each { |date, count| totals[date.cwday] += count }
      (1..7).map { |n| { weekday: Date::DAYNAMES[n % 7], completions: totals[n] } }
    end

    def habits_stats
      current = completed_entries.where(daily_entries: { entry_date: range }).group('habits.id').count
      previous = completed_entries.where(daily_entries: { entry_date: previous_range }).group('habits.id').count
      user.habits.active.order(:name).map do |habit|
        done = current.fetch(habit.id, 0)
        {
          id: habit.id,
          name: habit.name,
          completions: done,
          previous_completions: previous.fetch(habit.id, 0),
          completion_rate: [(done * 100.0 / days).round(1), 100.0].min,
          current_streak: habit.current_streak
        }
      end
    end

    def goals_stats
      user.goals.active.incomplete.ordered.map do |goal|
        data = goal.progress_data || {}
        {
          id: goal.id,
          name: goal.name,
          percentage: data[:percentage].to_f.round(1),
          status: data[:status].to_s,
          target_date: goal.target_date
        }
      end
    end
  end
end
