class HabitsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_habit, only: [:show, :edit, :update, :destroy]

  def index
    @habits = current_user.habits.includes(:category).order(:name)
  end

  def show
  end

  def new
    @habit = current_user.habits.build
  end

  def create
    @habit = current_user.habits.build(habit_params)
    
    if @habit.save
      redirect_to @habit, notice: 'Habit was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @habit.update(habit_params)
      redirect_to @habit, notice: 'Habit was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @habit.destroy
    redirect_to habits_url, notice: 'Habit was successfully deleted.'
  end

  private

  def set_habit
    @habit = current_user.habits.find(params[:id])
  end

  def habit_params
    params.require(:habit).permit(:name, :description, :category_id, :habit_type, 
                                  :target_value, :start_date, :end_date, :is_active)
  end
end
