class GoalEntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_goal_entry, only: %i[update destroy]

  def create
    daily_entry = find_daily_entry_from_params
    goal = current_user.goals.find(params[:goal_id])

    result = Entries::CreateGoalEntryService.new(daily_entry: daily_entry, goal: goal, params: goal_entry_params).call

    if result.success?
      redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Goal entry saved.'
    else
      redirect_back fallback_location: daily_entry || dashboard_path, alert: result.error_messages || 'Failed to save goal entry.'
    end
  end

  def update
    authorize @goal_entry
    goal = @goal_entry.goal
    daily_entry = @goal_entry.daily_entry

    result = Entries::UpdateGoalEntryService.new(goal_entry: @goal_entry, goal: goal, daily_entry: daily_entry, params: goal_entry_params).call

    if result.success?
      redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Goal entry updated.'
    else
      redirect_back fallback_location: daily_entry || dashboard_path, alert: result.error_messages || 'Failed to update goal entry.'
    end
  end

  def destroy
    set_goal_entry
    authorize @goal_entry
    daily_entry = @goal_entry.daily_entry
    @goal_entry.destroy
    redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Goal entry deleted.'
  end

  private

  def set_goal_entry
    @goal_entry = GoalEntry.find(params[:id])
  end

  def goal_entry_params
    params.permit(:daily_entry_id, :goal_id, :value, :numeric_value, :boolean_value, :is_increment, :notes)
  end

  def find_daily_entry_from_params
    if params[:daily_entry_id].present?
      current_user.daily_entries.find_by(id: params[:daily_entry_id])
    elsif params[:daily_entry] && params[:daily_entry][:id]
      current_user.daily_entries.find_by(id: params[:daily_entry][:id])
    else
      current_user.daily_entries.find_by(entry_date: Date.current)
    end
  end
end
