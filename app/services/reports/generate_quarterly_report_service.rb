module Reports
  class GenerateQuarterlyReportService < BaseService
    def initialize(user, start_date: 3.months.ago.beginning_of_month)
      @user = user
      @start_date = start_date
      @end_date = Date.current.end_of_month
    end

    def call
      report_data = generate_quarterly_data
      success(report_data)
    end

    private

    attr_reader :user, :start_date, :end_date

    def generate_quarterly_data
      {
        period: "#{start_date.strftime('%B %Y')} - #{end_date.strftime('%B %Y')}",
        summary: generate_summary,
        habits: generate_habits_data,
        goals: generate_goals_data,
        monthly_breakdown: generate_monthly_breakdown,
        achievements: generate_achievements
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
          category: habit.category&.name,
          best_streak: calculate_best_streak(habit)
        }
      end
    end

    def generate_goals_data
      user.goals.where(start_date: start_date..end_date).map do |goal|
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
          target_date: goal.target_date,
          completed_at: goal.completed_at
        }
      end
    end

    def generate_monthly_breakdown
      months = []
      current_month_start = start_date.beginning_of_month
      
      while current_month_start <= end_date
        month_end = [current_month_start.end_of_month, end_date].min
        
        daily_entries = user.daily_entries.where(entry_date: current_month_start..month_end)
        habit_completions = daily_entries.joins(:habit_entries)
                                       .where(habit_entries: { completed: true })
                                       .count
        goal_entries = daily_entries.joins(:goal_entries).count
        
        months << {
          month: current_month_start.strftime('%B %Y'),
          active_days: daily_entries.count,
          habit_completions: habit_completions,
          goal_entries: goal_entries,
          total_activities: habit_completions + goal_entries
        }
        
        current_month_start += 1.month
      end
      
      months
    end

    def generate_achievements
      achievements = []
      
      # Completed goals
      completed_goals = user.goals.where(completed_at: start_date..end_date)
      achievements << {
        type: 'goals_completed',
        count: completed_goals.count,
        description: "#{completed_goals.count} goals completed"
      }
      
      # High streak habits
      high_streak_habits = user.habits.active.select { |h| h.current_streak >= 30 }
      achievements << {
        type: 'high_streaks',
        count: high_streak_habits.count,
        description: "#{high_streak_habits.count} habits with 30+ day streaks"
      }
      
      # Consistent tracking
      active_days = user.daily_entries.where(entry_date: start_date..end_date).count
      total_days = (end_date - start_date).to_i + 1
      if (active_days.to_f / total_days) >= 0.8
        achievements << {
          type: 'consistent_tracking',
          count: 1,
          description: "Consistent tracking (#{((active_days.to_f / total_days) * 100).round(1)}% of days)"
        }
      end
      
      achievements
    end

    def calculate_best_streak(habit)
      # This is a simplified version - in production you'd want to calculate actual best streak
      habit.current_streak
    end
  end
end
