class DailyEntry < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :habit_entries, dependent: :destroy
  has_many :goal_entries, dependent: :destroy
  has_many :habits, through: :habit_entries
  has_many :goals, through: :goal_entries

  # Validations
  validates :entry_date, presence: true
  validates :entry_date, uniqueness: { scope: :user_id }
  validates :mood, inclusion: { in: 1..5 }, allow_nil: true

  # Scopes
  scope :for_date, ->(date) { where(entry_date: date) }
  scope :for_date_range, ->(start_date, end_date) { where(entry_date: start_date..end_date) }
  scope :recent, -> { order(entry_date: :desc) }
  scope :with_mood, -> { where.not(mood: nil) }
  scope :with_completions, -> { joins(:habit_entries).where(habit_entries: { completed: true }).distinct }

  # Instance methods
  def habits_completed_count
    habit_entries.where(completed: true).count
  end

  def habits_total_count
    habit_entries.count
  end

  def completion_percentage
    return 0 if habits_total_count.zero?
    (habits_completed_count.to_f / habits_total_count * 100).round(2)
  end

  def goals_progressed_count
    goal_entries.count
  end

  def mood_emoji
    case mood
    when 1 then '😢'
    when 2 then '😕'
    when 3 then '😐'
    when 4 then '😊'
    when 5 then '😄'
    end
  end

  def self.for_user_and_date(user, date)
    find_or_create_by(user: user, entry_date: date)
  end
end
