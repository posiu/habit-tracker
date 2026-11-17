module Reports
  class GenerateMonthlyReportService < BaseService
    def initialize(user, start_date: Date.current.beginning_of_month)
      @user = user
      @start_date = start_date
      @end_date = start_date.end_of_month
    end

    def call
      report_data = generate_monthly_data
      success(report_data)
    end

    private

    attr_reader :user, :start_date, :end_date

    def generate_monthly_data
      {
        period: start_date.strftime('%B %Y'),
        summary: generate_summary,
        habits: generate_habits_data,
        goals: generate_goals_data,
        weekly_breakdown: generate_weekly_breakdown,
        trends: generate_trends
      }
    end

    def generate_summary
      daily_entries = user.daily_entries.where(entry_date: start_date..end_date)
      total_days = (end_date - start_date).to_i + 1
      
      total_habit_completions = daily_entries.joins(:habit_entries)
                                           .where(habit_entries: { completed: true })
                                           .count
      
      total_goal_entries = daily_entries.joins(:goal_entries).count
      active_days = daily_entries.count
      
      {
        active_days: active_days,
        total_days: total_days,
        habit_completions: total_habit_completions,
        goal_entries: total_goal_entries,
        completion_rate: active_days > 0 ? (active_days.to_f / total_days * 100).round(1) : 0,
        avg_activities_per_day: active_days > 0 ? ((total_habit_completions + total_goal_entries).to_f / active_days).round(1) : 0
      }
    end

    def generate_habits_data
      user.habits.active.map do |habit|
        completions = habit.habit_entries
                          .joins(:daily_entry)
                          .where(daily_entries: { entry_date: start_date..end_date })
                          .where(completed: true)
                          .count
        
        total_days = (end_date - start_date).to_i + 1
        
        {
          name: habit.name,
          type: habit.habit_type,
          completions: completions,
          target_days: total_days,
          completion_rate: (completions.to_f / total_days * 100).round(1),
          streak: habit.current_streak,
          category: habit.category&.name
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
          status: progress[:status],
          category: goal.category&.name,
          target_date: goal.target_date
        }
      end
    end

    def generate_weekly_breakdown
      weeks = []
      current_week_start = start_date.beginning_of_week
      
      while current_week_start <= end_date
        week_end = [current_week_start.end_of_week, end_date].min
        
        daily_entries = user.daily_entries.where(entry_date: current_week_start..week_end)
        habit_completions = daily_entries.joins(:habit_entries)
                                       .where(habit_entries: { completed: true })
                                       .count
        goal_entries = daily_entries.joins(:goal_entries).count
        
        weeks << {
          start_date: current_week_start,
          end_date: week_end,
          active_days: daily_entries.count,
          habit_completions: habit_completions,
          goal_entries: goal_entries,
          total_activities: habit_completions + goal_entries
        }
        
        current_week_start += 1.week
      end
      
      weeks
    end

    def generate_trends
      # Compare with previous month
      prev_start = start_date - 1.month
      prev_end = prev_start.end_of_month
      
      prev_entries = user.daily_entries.where(entry_date: prev_start..prev_end)
      current_entries = user.daily_entries.where(entry_date: start_date..end_date)
      
      prev_habit_completions = prev_entries.joins(:habit_entries)
                                         .where(habit_entries: { completed: true })
                                         .count
      current_habit_completions = current_entries.joins(:habit_entries)
                                                .where(habit_entries: { completed: true })
                                                .count
      
      {
        habit_completions_change: calculate_percentage_change(prev_habit_completions, current_habit_completions),
        active_days_change: calculate_percentage_change(prev_entries.count, current_entries.count)
      }
    end

    def calculate_percentage_change(old_value, new_value)
      return 0 if old_value == 0
      ((new_value - old_value).to_f / old_value * 100).round(1)
    end
  end
end
