class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @user = current_user
    
    # Real statistics
    @habits_count = current_user.habits.active.count
    @goals_count = current_user.goals.active.count
    @categories_count = current_user.categories.active.count
    @current_streak = 0 # Will be implemented with streak service
    
    # Daily entries info
    @total_entries = current_user.daily_entries.count
    @this_month_entries = current_user.daily_entries.where(entry_date: Date.current.beginning_of_month..Date.current.end_of_month).count
    @today_entry = current_user.daily_entries.find_by(entry_date: Date.current)
    @recent_entries = current_user.daily_entries.order(entry_date: :desc).limit(5)
  end
end
