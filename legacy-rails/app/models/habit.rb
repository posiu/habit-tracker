class Habit < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :category, optional: true
  has_many :habit_entries, dependent: :destroy

  # Enums
  enum habit_type: {
    boolean: 'boolean',
    numeric: 'numeric',
    time: 'time',
    counter: 'count'
  }, _suffix: true

  # Validations
  validates :name, presence: true, length: { maximum: 200 }
  validates :habit_type, presence: true
  validates :start_date, presence: true
  validates :unit, length: { maximum: 50 }
  validates :target_value, numericality: { greater_than: 0 }, allow_nil: true
  validate :end_date_after_start_date

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :by_category, ->(category_id) { where(category_id: category_id) }
  scope :ordered, -> { order(:position, :created_at) }
  scope :with_reminders, -> { where(reminder_enabled: true) }

  # Callbacks
  before_validation :set_defaults

  # Instance methods
  def current_streak
    result = Habits::CalculateStreakService.new(self).call
    result.success? ? result.data : 0
  end

  def completed_today?
    return false unless today_entry
    
    case habit_type
    when 'boolean'
      today_entry.completed
    when 'numeric', 'time', 'counter'
      today_entry.value.present? && today_entry.value > 0
    else
      false
    end
  end

  def archive!
    update!(is_active: false, end_date: Date.current)
  end

  def activate!
    update!(is_active: true, end_date: nil)
  end

  private

  def today_entry
    habit_entries.joins(:daily_entry)
                 .where(daily_entries: { entry_date: Date.current })
                 .first
  end

  def set_defaults
    self.start_date ||= Date.current
    self.is_active = true if is_active.nil?
    self.habit_type ||= 'boolean'
    self.reminder_days ||= []
  end

  def end_date_after_start_date
    return unless end_date && start_date
    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end
end
