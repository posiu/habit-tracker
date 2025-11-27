class DailyEntryQuery
  def initialize(user)
    @user = user
  end

  def for_date(date)
    @user.daily_entries.for_date(date)
  end

  def for_date_range(start_date, end_date)
    @user.daily_entries.for_date_range(start_date, end_date)
  end

  def recent(limit = 30)
    @user.daily_entries.recent.limit(limit)
  end

  def with_mood
    @user.daily_entries.with_mood
  end

  def for_heatmap_data(start_date, end_date)
    # Returns array of [date, count, mood] for heatmap visualization
    entries = for_date_range(start_date, end_date)
    
    entries.group_by { |e| e.entry_date }
           .map { |date, daily_entries|
             daily_entry = daily_entries.first
             [
               date,
               daily_entry.habits_completed_count,
               daily_entry.mood
             ]
           }
  end

  def all
    @user.daily_entries.order(entry_date: :desc)
  end
end
