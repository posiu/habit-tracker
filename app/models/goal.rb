class Goal < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :category, optional: true
  has_many :goal_metrics, dependent: :destroy
  has_many :goal_entries, dependent: :destroy

  # Enums
  enum goal_type: {
    days_doing: 'days_doing',
    days_without: 'days_without',
    target_value: 'target_value',
    target_date: 'target_date',
    custom: 'custom'
  }

  # Validations
  validates :name, presence: true, length: { maximum: 200 }
  validates :goal_type, presence: true
  validates :start_date, presence: true
  validates :unit, length: { maximum: 50 }
  validate :target_date_after_start_date

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :incomplete, -> { where(completed_at: nil) }
  scope :by_category, ->(category_id) { where(category_id: category_id) }
  scope :ordered, -> { order(:position, :created_at) }
  scope :with_deadlines, -> { where.not(target_date: nil) }
  scope :approaching_deadline, -> { where('target_date <= ?', 1.week.from_now) }

  # Callbacks
  before_validation :set_defaults
  after_create :create_goal_metric

  # Delegations
  delegate :current_value, :current_days_doing, :current_days_without, to: :primary_goal_metric, allow_nil: true

  # Instance methods
  def progress_percentage
    result = Goals::CalculateProgressService.new(self).call
    result.success? ? result.data[:percentage] : 0
  end

  def progress_data
    result = Goals::CalculateProgressService.new(self).call
    result.success? ? result.data : { percentage: 0, current: 0, target: 0, status: 'unknown' }
  end

  def completed?
    completed_at.present?
  end

  def complete!
    update!(completed_at: Time.current, is_active: false)
  end

  def days_remaining
    return nil unless target_date
    (target_date - Date.current).to_i
  end

  private

  def set_defaults
    self.start_date ||= Date.current
    self.is_active = true if is_active.nil?
    self.goal_type ||= 'target_value'
  end

  def target_date_after_start_date
    return unless target_date && start_date
    errors.add(:target_date, 'must be after start date') if target_date < start_date
  end

  def primary_goal_metric
    goal_metrics.first
  end

  def create_goal_metric
    goal_metrics.create! unless goal_metrics.any?
  end
end
