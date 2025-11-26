class HabitEntry < ApplicationRecord
  # Associations
  belongs_to :daily_entry
  belongs_to :habit

  # Validations
  validates :daily_entry_id, uniqueness: { scope: :habit_id }
  validates :numeric_value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :time_value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validate :value_present_for_habit_type

  # Scopes
  scope :completed, -> { where(completed: true) }
  scope :incomplete, -> { where(completed: false) }
  scope :for_habit, ->(habit) { where(habit: habit) }
  scope :for_date_range, ->(start_date, end_date) { joins(:daily_entry).where(daily_entries: { entry_date: start_date..end_date }) }

  # Callbacks
  before_save :set_completed_flag

  # Instance methods
  def value
    case habit.habit_type
    when 'boolean'
      boolean_value
    when 'numeric', 'count'
      numeric_value
    when 'time'
      time_value
    end
  end

  def value=(val)
    case habit.habit_type
    when 'boolean'
      self.boolean_value = val
    when 'numeric', 'count'
      self.numeric_value = val
    when 'time'
      self.time_value = val
    end
  end

  def formatted_value
    case habit.habit_type
    when 'boolean'
      boolean_value ? 'Yes' : 'No'
    when 'numeric', 'count'
      "#{numeric_value} #{habit.unit}".strip
    when 'time'
      format_time(time_value)
    end
  end

  private

  def set_completed_flag
    self.completed = case habit.habit_type
                     when 'boolean'
                       boolean_value == true
                     when 'numeric', 'count'
                       numeric_value.present? && numeric_value > 0
                     when 'time'
                       time_value.present? && time_value > 0
                     else
                       false
                     end
  end

  def value_present_for_habit_type
    case habit&.habit_type
    when 'boolean'
      errors.add(:boolean_value, "can't be blank") if boolean_value.nil?
    when 'numeric', 'count'
      errors.add(:numeric_value, "can't be blank") if numeric_value.blank?
    when 'time'
      errors.add(:time_value, "can't be blank") if time_value.blank?
    end
  end

  def format_time(seconds)
    return '0s' unless seconds&.positive?
    
    hours = seconds / 3600
    minutes = (seconds % 3600) / 60
    secs = seconds % 60

    if hours > 0
      "#{hours}h #{minutes}m"
    elsif minutes > 0
      "#{minutes}m #{secs}s"
    else
      "#{secs}s"
    end
  end
end
