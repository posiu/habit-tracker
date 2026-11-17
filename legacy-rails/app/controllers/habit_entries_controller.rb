class HabitEntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_habit_entry, only: %i[update destroy]

  def create
    # allow nested or top-level params
    daily_entry = find_daily_entry_from_params
    habit = current_user.habits.find(params[:habit_id])

    result = Entries::CreateHabitEntryService.new(daily_entry: daily_entry, habit: habit, params: habit_entry_params).call

    if result.success?
      redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Habit entry saved.'
    else
      redirect_back fallback_location: daily_entry || dashboard_path, alert: result.error_messages || 'Failed to save habit entry.'
    end
  end

  def update
    authorize @habit_entry
    habit = @habit_entry.habit
    daily_entry = @habit_entry.daily_entry

    result = Entries::UpdateHabitEntryService.new(habit_entry: @habit_entry, habit: habit, daily_entry: daily_entry, params: habit_entry_params).call

    if result.success?
      redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Habit entry updated.'
    else
      redirect_back fallback_location: daily_entry || dashboard_path, alert: result.error_messages || 'Failed to update habit entry.'
    end
  end

  def destroy
    set_habit_entry
    authorize @habit_entry
    daily_entry = @habit_entry.daily_entry
    @habit_entry.destroy
    redirect_back fallback_location: daily_entry || dashboard_path, notice: 'Habit entry deleted.'
  end

  private

  def set_habit_entry
    @habit_entry = HabitEntry.find(params[:id])
  end

  def habit_entry_params
    params.permit(:daily_entry_id, :habit_id, :value, :completed, :notes)
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
