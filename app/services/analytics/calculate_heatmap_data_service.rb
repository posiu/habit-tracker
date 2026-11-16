module Analytics
  class CalculateHeatmapDataService < BaseService
    def initialize(user, start_date: 1.year.ago.to_date, end_date: Date.current)
      @user = user
      @start_date = start_date
      @end_date = end_date
    end

    def call
      heatmap_data = calculate_heatmap_data
      success(heatmap_data)
    end

    private

    attr_reader :user, :start_date, :end_date

    def calculate_heatmap_data
      # Get all daily entries for the user in the date range
      range = start_date..end_date
      habit_counts = HabitEntry.joins(:daily_entry)
                               .where(completed: true, daily_entries: { user_id: user.id, entry_date: range })
                               .group('daily_entries.entry_date').count
      goal_counts = GoalEntry.joins(:daily_entry)
                             .where(daily_entries: { user_id: user.id, entry_date: range })
                             .group('daily_entries.entry_date').count

      # Create a hash with all dates in the range initialized to 0
      date_range = (start_date..end_date).to_a
      heatmap_data = date_range.map do |date|
        {
          date: date.strftime('%Y-%m-%d'),
          count: 0,
          level: 0 # 0-4 scale like GitHub
        }
      end.index_by { |item| item[:date] }

      # Calculate activity for each day
      (habit_counts.keys | goal_counts.keys).each do |date|
        date_key = date.strftime('%Y-%m-%d')
        next unless heatmap_data[date_key]

        total_activity = habit_counts.fetch(date, 0) + goal_counts.fetch(date, 0)
        
        heatmap_data[date_key][:count] = total_activity
        heatmap_data[date_key][:level] = calculate_activity_level(total_activity)
      end

      # Convert back to array and sort by date
      heatmap_data.values.sort_by { |item| item[:date] }
    end

    def calculate_activity_level(count)
      # GitHub-style levels: 0 (no activity) to 4 (very high activity)
      case count
      when 0
        0
      when 1..2
        1
      when 3..5
        2
      when 6..10
        3
      else
        4
      end
    end
  end
end
