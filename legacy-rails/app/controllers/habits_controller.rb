class HabitsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_habit, only: [:show, :edit, :update, :destroy, :archive]

  def index
    @habits = HabitQuery.new(current_user).active
    @categories = current_user.categories.active.ordered
  end

  def show
    authorize @habit
  end

  def new
    @habit_form = HabitForm.new(current_user)
    authorize Habit
  end

  def create
    authorize Habit
    service = Habits::CreateService.new(user: current_user, params: habit_params)
    result = service.call
    
    if result.success?
      redirect_to result.data, notice: 'Habit was successfully created.'
    else
      @habit_form = HabitForm.new(current_user, nil, habit_params)
      @habit_form.valid? # Trigger validations for error display
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @habit
    @habit_form = HabitForm.new(current_user, @habit)
  end

  def update
    authorize @habit
    service = Habits::UpdateService.new(habit: @habit, params: habit_params)
    result = service.call
    
    if result.success?
      redirect_to result.data, notice: 'Habit was successfully updated.'
    else
      @habit_form = HabitForm.new(current_user, @habit, habit_params)
      @habit_form.valid? # Trigger validations for error display
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @habit
    service = Habits::DeleteService.new(habit: @habit)
    result = service.call
    
    if result.success?
      redirect_to habits_url, notice: 'Habit was successfully deleted.'
    else
      redirect_to habits_url, alert: result.errors.join(', ')
    end
  end

  def archive
    authorize @habit
    service = Habits::ArchiveService.new(habit: @habit)
    result = service.call
    
    if result.success?
      redirect_to habits_url, notice: 'Habit was successfully archived.'
    else
      redirect_to habits_url, alert: result.errors.join(', ')
    end
  end

  private

  def set_habit
    @habit = current_user.habits.find(params[:id])
  end

  def habit_params
    params.require(:habit).permit(:name, :description, :category_id, :habit_type, 
                                  :target_value, :unit, :start_date, :end_date, 
                                  :reminder_enabled, :reminder_time, :is_active,
                                  reminder_days: [])
  end
end
