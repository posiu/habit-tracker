class GoalEntry < ApplicationRecord
  # Associations
  belongs_to :daily_entry
  belongs_to :goal

  # Validations
  validates :daily_entry_id, uniqueness: { scope: :goal_id }
  validates :value, numericality: true, allow_nil: true
  validate :value_or_boolean_present

  # Scopes
  scope :for_goal, ->(goal) { where(goal: goal) }
  scope :for_date_range, ->(start_date, end_date) { joins(:daily_entry).where(daily_entries: { entry_date: start_date..end_date }) }
  scope :increments, -> { where(is_increment: true) }
  scope :decrements, -> { where(is_increment: false) }

  # Instance methods
  def effective_value
    case goal.goal_type
    when 'days_doing', 'days_without'
      boolean_value ? 1 : 0
    when 'target_value'
      is_increment ? (value || 0) : -(value || 0)
    else
      value || 0
    end
  end

  def formatted_value
    case goal.goal_type
    when 'days_doing', 'days_without'
      boolean_value ? 'Yes' : 'No'
    when 'target_value'
      sign = is_increment ? '+' : '-'
      "#{sign}#{value} #{goal.unit}".strip
    else
      "#{value} #{goal.unit}".strip
    end
  end

  private

  def value_or_boolean_present
    case goal&.goal_type
    when 'days_doing', 'days_without'
      errors.add(:boolean_value, "can't be blank") if boolean_value.nil?
    when 'target_value'
      errors.add(:value, "can't be blank") if value.blank?
    end
  end
end
