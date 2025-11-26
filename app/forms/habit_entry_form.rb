class HabitEntryForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :completed, :boolean, default: false
  attribute :value, :decimal
  attribute :notes, :string

  validates :notes, length: { maximum: 500 }
  validate :value_matches_habit_type

  def initialize(habit_entry = nil, habit:, daily_entry:, attributes: {})
    @habit_entry = habit_entry || HabitEntry.new
    @habit = habit
    @daily_entry = daily_entry
    super(attributes.presence || habit_entry_attributes)
  end

  def save
    return false unless valid?

    @habit_entry.assign_attributes(
      completed: completed_for_habit_type,
      value: value_for_habit_type,
      notes: notes,
      habit: @habit,
      daily_entry: @daily_entry
    )

    @habit_entry.save
  end

  def habit_entry
    @habit_entry
  end

  def habit
    @habit
  end

  def persisted?
    @habit_entry.persisted?
  end

  def to_key
    @habit_entry.to_key
  end

  def to_param
    @habit_entry.to_param
  end

  # Helper methods for different habit types
  def boolean_habit?
    @habit.habit_type == 'boolean'
  end

  def numeric_habit?
    @habit.habit_type == 'numeric'
  end

  def time_habit?
    @habit.habit_type == 'time'
  end

  def counter_habit?
    @habit.habit_type == 'count'
  end

  def display_value
    return 'Completed' if boolean_habit? && completed
    return 'Not completed' if boolean_habit? && !completed
    return value.to_s if value.present?
    'Not tracked'
  end

  private

  def habit_entry_attributes
    return default_attributes unless @habit_entry.persisted?

    {
      completed: @habit_entry.completed,
      value: @habit_entry.value,
      notes: @habit_entry.notes
    }
  end

  def default_attributes
    {
      completed: false,
      value: nil,
      notes: nil
    }
  end

  def completed_for_habit_type
    if boolean_habit?
      completed
    else
      value.present? && value > 0
    end
  end

  def value_for_habit_type
    if boolean_habit?
      completed ? 1 : 0
    else
      value
    end
  end

  def value_matches_habit_type
    return unless @habit

    if boolean_habit?
      # For boolean habits, we don't need a value
      return
    elsif numeric_habit? || counter_habit? || time_habit?
      if value.present? && value <= 0
        errors.add(:value, "must be greater than 0")
      end
    end
  end
end
