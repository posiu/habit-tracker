class DailyEntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_daily_entry, only: [:show, :edit, :update, :destroy]

  def index
    @daily_entries = policy_scope(DailyEntry).order(entry_date: :desc)
  end

  def show
    authorize @daily_entry
    @user_habits = current_user.habits.active.includes(:category)
    @user_goals = current_user.goals.active.includes(:category)
    @habit_entries = @daily_entry.habit_entries.includes(:habit)
    @goal_entries = @daily_entry.goal_entries.includes(:goal)
  end

  def new
    @daily_entry_form = DailyEntryForm.new(nil, user: current_user)
    authorize DailyEntry
  end

  def create
    authorize DailyEntry
    result = Entries::CreateDailyEntryService.call(user: current_user, params: daily_entry_params)
    
    if result.success?
      redirect_to result.data, notice: 'Daily entry was successfully created.'
    else
      @daily_entry_form = DailyEntryForm.new(nil, user: current_user, attributes: daily_entry_params)
      @daily_entry_form.valid? # Trigger validations for error display
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @daily_entry
    @daily_entry_form = DailyEntryForm.new(@daily_entry, user: current_user)
  end

  def update
    authorize @daily_entry
    @daily_entry_form = DailyEntryForm.new(@daily_entry, user: current_user, attributes: daily_entry_params)
    
    if @daily_entry_form.save
      redirect_to @daily_entry, notice: 'Daily entry was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @daily_entry
    @daily_entry.destroy
    redirect_to daily_entries_url, notice: 'Daily entry was successfully deleted.'
  end

  private

  def set_daily_entry
    @daily_entry = current_user.daily_entries.find(params[:id])
  end

  def daily_entry_params
    params.require(:daily_entry_form).permit(:entry_date, :mood, :notes)
  end
end
