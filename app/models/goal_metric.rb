class GoalMetric < ApplicationRecord
  # Associations
  belongs_to :goal

  # Validations
  validates :current_value, numericality: true
  validates :current_days_doing, numericality: { greater_than_or_equal_to: 0 }
  validates :current_days_without, numericality: { greater_than_or_equal_to: 0 }
  validates :days_doing_target, numericality: { greater_than: 0 }, allow_nil: true
  validates :days_without_target, numericality: { greater_than: 0 }, allow_nil: true
  validates :target_value, numericality: true, allow_nil: true

  # Scopes
  scope :with_deadlines, -> { where.not(target_date: nil) }
  scope :approaching_deadline, -> { where('target_date <= ?', 1.week.from_now) }

  # Instance methods
  def progress_percentage_for_days_doing
    return 0 unless days_doing_target&.positive?
    [(current_days_doing.to_f / days_doing_target * 100).round(2), 100].min
  end

  def progress_percentage_for_days_without
    return 0 unless days_without_target&.positive?
    [(current_days_without.to_f / days_without_target * 100).round(2), 100].min
  end

  def progress_percentage_for_value
    return 0 unless target_value&.positive?
    [(current_value.to_f / target_value * 100).round(2), 100].min
  end

  def target_reached?
    case goal.goal_type
    when 'days_doing'
      days_doing_target && current_days_doing >= days_doing_target
    when 'days_without'
      days_without_target && current_days_without >= days_without_target
    when 'target_value'
      target_value && current_value >= target_value
    else
      false
    end
  end
end
