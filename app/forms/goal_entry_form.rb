class GoalEntryForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :value, :decimal
  attribute :boolean_value, :boolean
  attribute :is_increment, :boolean, default: true
  attribute :notes, :string

  validates :notes, length: { maximum: 500 }
  validate :value_matches_goal_type

  def initialize(goal_entry = nil, goal:, daily_entry:, attributes: {})
    @goal_entry = goal_entry || GoalEntry.new
    @goal = goal
    @daily_entry = daily_entry
    super(attributes.presence || goal_entry_attributes)
  end

  def save
    return false unless valid?

    @goal_entry.assign_attributes(
      value: value_for_goal_type,
      boolean_value: boolean_value_for_goal_type,
      is_increment: is_increment,
      notes: notes,
      goal: @goal,
      daily_entry: @daily_entry
    )

    @goal_entry.save
  end

  def goal_entry
    @goal_entry
  end

  def goal
    @goal
  end

  def persisted?
    @goal_entry.persisted?
  end

  def to_key
    @goal_entry.to_key
  end

  def to_param
    @goal_entry.to_param
  end

  # Helper methods for different goal types
  def days_doing_goal?
    @goal.goal_type == 'days_doing'
  end

  def days_without_goal?
    @goal.goal_type == 'days_without'
  end

  def target_value_goal?
    @goal.goal_type == 'target_value'
  end

  def boolean_goal?
    days_doing_goal? || days_without_goal?
  end

  def numeric_goal?
    target_value_goal?
  end

  def display_value
    return 'Yes' if boolean_goal? && boolean_value
    return 'No' if boolean_goal? && !boolean_value
    return "#{is_increment ? '+' : '-'}#{value}" if numeric_goal? && value.present?
    'Not tracked'
  end

  private

  def goal_entry_attributes
    return default_attributes unless @goal_entry.persisted?

    {
      value: @goal_entry.value,
      boolean_value: @goal_entry.boolean_value,
      is_increment: @goal_entry.is_increment,
      notes: @goal_entry.notes
    }
  end

  def default_attributes
    {
      value: nil,
      boolean_value: nil,
      is_increment: true,
      notes: nil
    }
  end

  def boolean_value_for_goal_type
    return boolean_value if boolean_goal?
    nil
  end

  def value_for_goal_type
    return value if numeric_goal?
    nil
  end

  def value_matches_goal_type
    return unless @goal

    if boolean_goal?
      if boolean_value.nil?
        errors.add(:boolean_value, "can't be blank")
      end
    elsif numeric_goal?
      if value.present? && value <= 0
        errors.add(:value, "must be greater than 0")
      elsif value.blank?
        errors.add(:value, "can't be blank")
      end
    end
  end
end
