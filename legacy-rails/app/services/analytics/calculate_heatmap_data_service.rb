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
      daily_entries = user.daily_entries
                          .where(entry_date: start_date..end_date)
                          .includes(:habit_entries, :goal_entries)

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
      daily_entries.each do |entry|
        date_key = entry.entry_date.strftime('%Y-%m-%d')
        next unless heatmap_data[date_key]

        # Count completed habits and goal entries for this day
        completed_habits = entry.habit_entries.where(completed: true).count
        goal_entries = entry.goal_entries.count

        total_activity = completed_habits + goal_entries
        
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
