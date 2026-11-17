class HabitQuery
  def initialize(user)
    @user = user
  end

  def active
    @user.habits.where(is_active: true).ordered
  end

  def inactive
    @user.habits.where(is_active: false).ordered
  end

  def by_category(category_id)
    active.where(category_id: category_id)
  end

  def with_streaks
    active.includes(:habit_entries).ordered
  end

  def with_reminders
    active.where(reminder_enabled: true).ordered
  end

  def for_date_range(start_date, end_date)
    active
      .joins(:habit_entries)
      .where(habit_entries: { created_at: start_date..end_date })
      .distinct
      .ordered
  end

  def by_type(habit_type)
    active.where(habit_type: habit_type).ordered
  end

  def all
    @user.habits.ordered
  end

  private

  attr_reader :user
end
