class GoalForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :name, :string
  attribute :description, :string
  attribute :category_id, :integer
  attribute :goal_type, :string
  attribute :start_date, :date
  attribute :target_date, :date
  attribute :unit, :string
  attribute :is_active, :boolean, default: true
  attribute :goal_metrics_attributes, default: []

  validates :name, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :goal_type, presence: true, inclusion: { in: %w[days_doing days_without target_value target_date custom], message: "%{value} is not a valid goal type" }
  validates :category_id, numericality: { greater_than: 0 }, allow_nil: true
  validates :start_date, presence: true
  validates :target_date, presence: true, if: -> { goal_type == 'target_date' }
  validate :target_date_after_start_date
  validate :category_exists_for_user

  attr_reader :goal, :user

  def initialize(user, goal = nil, attributes = {})
    @user = user
    @goal = goal || Goal.new
    super(attributes.presence || goal_attributes)
  end

  def save
    return false unless valid?

    @goal.assign_attributes(
      name: name,
      description: description,
      category_id: category_id,
      goal_type: goal_type,
      start_date: start_date,
      target_date: target_date,
      unit: unit,
      is_active: is_active,
      user: user
    )

    @goal.save
  end

  def persisted?
    @goal.persisted?
  end

  def to_key
    @goal.to_key
  end

  def to_param
    @goal.to_param
  end

  private

  def goal_attributes
    return {} unless @goal

    {
      name: @goal.name,
      description: @goal.description,
      category_id: @goal.category_id,
      goal_type: @goal.goal_type,
      start_date: @goal.start_date,
      target_date: @goal.target_date,
      unit: @goal.unit,
      is_active: @goal.is_active,
      goal_metrics_attributes: @goal.goal_metrics.map { |m| goal_metric_attributes(m) }
    }
  end

  def goal_metric_attributes(metric)
    {
      id: metric.id,
      target_value: metric.target_value,
      current_value: metric.current_value,
      unit: metric.unit,
      _destroy: false
    }
  end

  def target_date_after_start_date
    return if start_date.blank? || target_date.blank?
    
    if target_date < start_date
      errors.add(:target_date, 'must be after start date')
    end
  end

  def category_exists_for_user
    return if category_id.blank?
    
    unless user.categories.exists?(category_id)
      errors.add(:category_id, 'must belong to current user')
    end
  end
end
