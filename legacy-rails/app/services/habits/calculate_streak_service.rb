module Habits
  class CalculateStreakService < BaseService
    def initialize(habit)
      @habit = habit
    end

    def call
      current_streak = calculate_current_streak
      success(current_streak)
    end

    private

    attr_reader :habit

    def calculate_current_streak
      return 0 unless habit.habit_entries.any?

      # Get all completed entries for this habit, ordered by date DESC
      completed_entries = habit.habit_entries
                               .joins(:daily_entry)
                               .where(completed: true)
                               .order('daily_entries.entry_date DESC')
                               .pluck('daily_entries.entry_date')

      return 0 if completed_entries.empty?

      # Calculate streak from today backwards
      current_date = Date.current
      streak = 0

      # Check if there's an entry for today or yesterday (to handle timezone issues)
      latest_entry = completed_entries.first
      return 0 if latest_entry < current_date - 1.day

      # Start from the most recent entry and count backwards
      completed_entries.each_with_index do |entry_date, index|
        expected_date = latest_entry - index.days
        
        if entry_date == expected_date
          streak += 1
        else
          break
        end
      end

      streak
    end
  end
end
