class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    @user = current_user
    # Placeholder data - will be replaced in Stage 3
    @habits_count = 0
    @goals_count = 0
    @categories_count = 0
    @current_streak = 0
  end
end
