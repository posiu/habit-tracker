module Reports
  class GenerateWeeklyReportService < BaseService
    def initialize(user, start_date: 1.week.ago.beginning_of_week)
      @user = user
      @start_date = start_date
      @end_date = start_date.end_of_week
    end

    def call
      report_data = generate_weekly_data
      success(report_data)
    end

    private

    attr_reader :user, :start_date, :end_date

    def generate_weekly_data
      {
        period: "#{start_date.strftime('%b %d')} - #{end_date.strftime('%b %d, %Y')}",
        summary: generate_summary,
        habits: generate_habits_data,
        goals: generate_goals_data,
        daily_breakdown: generate_daily_breakdown
      }
    end

    def generate_summary
      daily_entries = user.daily_entries.where(entry_date: start_date..end_date)
      
      total_habit_completions = daily_entries.joins(:habit_entries)
                                           .where(habit_entries: { completed: true })
                                           .count
      
      total_goal_entries = daily_entries.joins(:goal_entries).count
      active_days = daily_entries.count
      
      {
        active_days: active_days,
        total_days: 7,
        habit_completions: total_habit_completions,
        goal_entries: total_goal_entries,
        completion_rate: active_days > 0 ? (active_days.to_f / 7 * 100).round(1) : 0
      }
    end

    def generate_habits_data
      user.habits.active.map do |habit|
        completions = habit.habit_entries
                          .joins(:daily_entry)
                          .where(daily_entries: { entry_date: start_date..end_date })
                          .where(completed: true)
                          .count
        
        {
          name: habit.name,
          type: habit.habit_type,
          completions: completions,
          target_days: 7,
          completion_rate: (completions.to_f / 7 * 100).round(1),
          streak: habit.current_streak
        }
      end
    end

    def generate_goals_data
      user.goals.active.map do |goal|
        entries = goal.goal_entries
                     .joins(:daily_entry)
                     .where(daily_entries: { entry_date: start_date..end_date })
                     .count
        
        progress = goal.progress_data
        
        {
          name: goal.name,
          type: goal.goal_type,
          entries: entries,
          progress_percentage: progress[:percentage],
          status: progress[:status]
        }
      end
    end

    def generate_daily_breakdown
      (start_date..end_date).map do |date|
        daily_entry = user.daily_entries.find_by(entry_date: date)
        
        if daily_entry
          habit_completions = daily_entry.habit_entries.where(completed: true).count
          goal_entries = daily_entry.goal_entries.count
          
          {
            date: date,
            has_entry: true,
            habit_completions: habit_completions,
            goal_entries: goal_entries,
            total_activities: habit_completions + goal_entries
          }
        else
          {
            date: date,
            has_entry: false,
            habit_completions: 0,
            goal_entries: 0,
            total_activities: 0
          }
        end
      end
    end
  end
end
