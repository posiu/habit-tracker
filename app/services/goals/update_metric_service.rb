module Goals
  # Recomputes the goal's metric from its entries (source of truth) and
  # completes the goal automatically once its target has been reached.
  class UpdateMetricService < BaseService
    SIGNED_VALUE_SQL = Arel.sql(
      'CASE WHEN is_increment THEN COALESCE(value, 0) ELSE -COALESCE(value, 0) END'
    )

    def initialize(goal)
      @goal = goal
    end

    def call
      metric = goal.goal_metric
      return failure('Goal has no metric') unless metric

      metric.update!(recalculated_attributes)
      goal.complete! if auto_complete?(metric)

      success(metric)
    end

    private

    attr_reader :goal

    def recalculated_attributes
      case goal.goal_type
      when 'target_value'
        { current_value: goal.goal_entries.sum(SIGNED_VALUE_SQL) }
      when 'days_doing'
        { current_days_doing: done_days }
      when 'days_without'
        { current_days_without: done_days }
      else
        {}
      end
    end

    def done_days
      goal.goal_entries.where(boolean_value: true).count
    end

    def auto_complete?(metric)
      goal.is_active? && !goal.completed? && metric.target_reached?
    end
  end
end
