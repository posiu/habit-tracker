module Goals
  class CalculateProgressService < BaseService
    def initialize(goal)
      @goal = goal
    end

    def call
      progress_data = calculate_progress
      success(progress_data)
    end

    private

    attr_reader :goal

    def calculate_progress
      case goal.goal_type
      when 'target_value'
        calculate_target_value_progress
      when 'days_doing'
        calculate_days_doing_progress
      when 'days_without'
        calculate_days_without_progress
      when 'target_date'
        calculate_target_date_progress
      else
        { percentage: 0, current: 0, target: 0, status: 'unknown' }
      end
    end

    def calculate_target_value_progress
      metric = goal.goal_metrics.first
      return { percentage: 0, current: 0, target: 0, status: 'no_metric' } unless metric

      current_value = metric.current_value || 0
      target_value = metric.target_value || 1

      percentage = [(current_value / target_value * 100).round(1), 100].min

      {
        percentage: percentage,
        current: current_value,
        target: target_value,
        status: percentage >= 100 ? 'completed' : 'in_progress'
      }
    end

    def calculate_days_doing_progress
      # Count days where goal entries exist and have positive values
      days_done = goal.goal_entries
                     .joins(:daily_entry)
                     .where('numeric_value > 0 OR boolean_value = true OR text_value IS NOT NULL')
                     .count

      # Calculate target days from start_date to target_date
      target_days = if goal.target_date && goal.start_date
                      (goal.target_date - goal.start_date).to_i + 1
                    else
                      30 # Default to 30 days if no target date
                    end

      percentage = [(days_done.to_f / target_days * 100).round(1), 100].min

      {
        percentage: percentage,
        current: days_done,
        target: target_days,
        status: percentage >= 100 ? 'completed' : 'in_progress'
      }
    end

    def calculate_days_without_progress
      # Count days since start_date where NO goal entries exist
      return { percentage: 0, current: 0, target: 0, status: 'no_start_date' } unless goal.start_date

      total_days = (Date.current - goal.start_date).to_i + 1
      days_with_entries = goal.goal_entries
                             .joins(:daily_entry)
                             .where('daily_entries.entry_date >= ?', goal.start_date)
                             .count

      days_without = total_days - days_with_entries
      target_days = goal.target_date ? (goal.target_date - goal.start_date).to_i + 1 : 30

      percentage = [(days_without.to_f / target_days * 100).round(1), 100].min

      {
        percentage: percentage,
        current: days_without,
        target: target_days,
        status: percentage >= 100 ? 'completed' : 'in_progress'
      }
    end

    def calculate_target_date_progress
      return { percentage: 0, current: 0, target: 0, status: 'no_target_date' } unless goal.target_date

      if goal.completed_at
        return { percentage: 100, current: 1, target: 1, status: 'completed' }
      end

      # Calculate progress based on time elapsed
      total_days = (goal.target_date - goal.start_date).to_i + 1
      elapsed_days = (Date.current - goal.start_date).to_i + 1

      percentage = [(elapsed_days.to_f / total_days * 100).round(1), 100].min

      {
        percentage: percentage,
        current: elapsed_days,
        target: total_days,
        status: Date.current > goal.target_date ? 'overdue' : 'in_progress'
      }
    end
  end
end
