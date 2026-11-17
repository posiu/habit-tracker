class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @user = current_user
    
    # Real statistics
    @habits_count = current_user.habits.active.count
    @goals_count = current_user.goals.active.count
    @categories_count = current_user.categories.active.count
    
    # Calculate current streak (highest streak among all active habits)
    @current_streak = calculate_highest_streak
    
    # Daily entries info
    @total_entries = current_user.daily_entries.count
    @this_month_entries = current_user.daily_entries.where(entry_date: Date.current.beginning_of_month..Date.current.end_of_month).count
    @today_entry = current_user.daily_entries.find_by(entry_date: Date.current)
    @recent_entries = current_user.daily_entries.order(entry_date: :desc).limit(5)
    @has_more_entries = current_user.daily_entries.count > 5
    
    # Heatmap data for the last year
    heatmap_result = Analytics::CalculateHeatmapDataService.new(current_user).call
    @heatmap_data = heatmap_result.success? ? heatmap_result.data : []
  end

  private

  def calculate_highest_streak
    return 0 unless current_user.habits.active.any?
    
    current_user.habits.active.map(&:current_streak).max || 0
  end
end
