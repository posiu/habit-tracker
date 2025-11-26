class DailyEntryForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :entry_date, :date
  attribute :mood, :integer
  attribute :notes, :string

  validates :entry_date, presence: true
  validates :mood, inclusion: { in: 1..5 }, allow_nil: true
  validates :notes, length: { maximum: 1000 }

  validate :entry_date_not_in_future
  validate :unique_entry_per_day, if: :user_present?

  def initialize(daily_entry = nil, user: nil, attributes: {})
    @daily_entry = daily_entry || DailyEntry.new
    @user = user
    super(attributes.presence || daily_entry_attributes)
  end

  def save
    return false unless valid?

    @daily_entry.assign_attributes(
      entry_date: entry_date,
      mood: mood,
      notes: notes,
      user: @user
    )

    @daily_entry.save
  end

  def daily_entry
    @daily_entry
  end

  def persisted?
    @daily_entry.persisted?
  end

  def to_key
    @daily_entry.to_key
  end

  def to_param
    @daily_entry.to_param
  end

  def mood_options
    [
      ['😄 Great', 5],
      ['😊 Good', 4],
      ['😐 Okay', 3],
      ['😔 Not Great', 2],
      ['😞 Poor', 1]
    ]
  end

  def mood_emoji
    return nil unless mood

    case mood
    when 5 then '😄 Great'
    when 4 then '😊 Good'
    when 3 then '😐 Okay'
    when 2 then '😔 Not Great'
    when 1 then '😞 Poor'
    end
  end

  private

  def daily_entry_attributes
    return { entry_date: Date.current } unless @daily_entry.persisted?

    {
      entry_date: @daily_entry.entry_date,
      mood: @daily_entry.mood,
      notes: @daily_entry.notes
    }
  end

  def entry_date_not_in_future
    return unless entry_date

    if entry_date > Date.current
      errors.add(:entry_date, "cannot be in the future")
    end
  end

  def unique_entry_per_day
    return unless entry_date && @user

    existing = @user.daily_entries.where(entry_date: entry_date)
    existing = existing.where.not(id: @daily_entry.id) if @daily_entry.persisted?

    if existing.exists?
      errors.add(:entry_date, "already has an entry for this date")
    end
  end

  def user_present?
    @user.present?
  end
end
