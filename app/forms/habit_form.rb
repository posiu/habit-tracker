class HabitForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :name, :string
  attribute :description, :string
  attribute :category_id, :integer
  attribute :habit_type, :string
  attribute :target_value, :decimal
  attribute :unit, :string
  attribute :start_date, :date
  attribute :end_date, :date
  attribute :reminder_enabled, :boolean, default: false
  attribute :reminder_days, default: []
  attribute :reminder_time, :time
  attribute :is_active, :boolean, default: true

  validates :name, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :habit_type, presence: true, inclusion: { in: %w[boolean numeric time counter], message: "%{value} is not a valid habit type" }
  validates :category_id, numericality: { greater_than: 0 }, allow_nil: true
  validates :target_value, numericality: { greater_than: 0 }, allow_nil: true
  validates :unit, length: { maximum: 50 }, allow_blank: true
  validates :start_date, presence: true
  validates :end_date, presence: true, if: -> { end_date.present? }
  validate :end_date_after_start_date
  validate :target_value_required_for_numeric_habits
  validate :category_exists_for_user

  attr_reader :habit, :user

  def initialize(user, habit = nil, attributes = {})
    @user = user
    @habit = habit || Habit.new
    super(attributes.presence || habit_attributes)
  end

  def save
    return false unless valid?

    @habit.assign_attributes(
      name: name,
      description: description,
      category_id: category_id,
      habit_type: habit_type,
      target_value: target_value,
      unit: unit,
      start_date: start_date,
      end_date: end_date,
      reminder_enabled: reminder_enabled,
      reminder_days: reminder_days,
      reminder_time: reminder_time,
      is_active: is_active,
      user: user
    )

    @habit.save
  end

  def persisted?
    @habit.persisted?
  end

  def to_key
    @habit.to_key
  end

  def to_param
    @habit.to_param
  end

  private

  def habit_attributes
    return {} unless @habit

    {
      name: @habit.name,
      description: @habit.description,
      category_id: @habit.category_id,
      habit_type: @habit.habit_type,
      target_value: @habit.target_value,
      unit: @habit.unit,
      start_date: @habit.start_date,
      end_date: @habit.end_date,
      reminder_enabled: @habit.reminder_enabled,
      reminder_days: @habit.reminder_days,
      reminder_time: @habit.reminder_time,
      is_active: @habit.is_active
    }
  end

  def end_date_after_start_date
    return if start_date.blank? || end_date.blank?
    
    if end_date < start_date
      errors.add(:end_date, 'must be after start date')
    end
  end

  def target_value_required_for_numeric_habits
    return if habit_type.blank?
    
    if %w[numeric counter].include?(habit_type) && target_value.blank?
      errors.add(:target_value, 'is required for numeric and counter habits')
    end
  end

  def category_exists_for_user
    return if category_id.blank?
    
    unless user.categories.exists?(category_id)
      errors.add(:category_id, 'must belong to current user')
    end
  end
end
