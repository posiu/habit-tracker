class GoalMetricForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :id, :integer
  attribute :target_value, :decimal
  attribute :current_value, :decimal
  attribute :current_days_doing, :integer
  attribute :current_days_without, :integer
  attribute :unit, :string
  attribute :_destroy, :boolean

  validates :target_value, numericality: { greater_than: 0 }, allow_nil: true
  validates :current_value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :unit, length: { maximum: 50 }, allow_blank: true

  attr_reader :goal_metric, :goal

  def initialize(goal, goal_metric = nil, attributes = {})
    @goal = goal
    @goal_metric = goal_metric || GoalMetric.new
    super(attributes.presence || metric_attributes)
  end

  def save
    return false unless valid?

    @goal_metric.assign_attributes(
      target_value: target_value,
      current_value: current_value,
      current_days_doing: current_days_doing,
      current_days_without: current_days_without,
      unit: unit,
      goal: goal
    )

    @goal_metric.save
  end

  def persisted?
    @goal_metric.persisted?
  end

  def to_key
    @goal_metric.to_key
  end

  def to_param
    @goal_metric.to_param
  end

  private

  def metric_attributes
    return {} unless @goal_metric

    {
      id: @goal_metric.id,
      target_value: @goal_metric.target_value,
      current_value: @goal_metric.current_value,
      current_days_doing: @goal_metric.current_days_doing,
      current_days_without: @goal_metric.current_days_without,
      unit: @goal_metric.unit
    }
  end
end
