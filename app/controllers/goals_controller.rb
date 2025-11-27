class GoalsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_goal, only: [:show, :edit, :update, :destroy, :complete]

  def index
    @goals = GoalQuery.new(current_user).active
    @categories = current_user.categories.active.ordered
  end

  def show
    authorize @goal
  end

  def new
    @goal_form = GoalForm.new(current_user)
    authorize Goal
  end

  def create
    authorize Goal
    service = Goals::CreateService.new(user: current_user, params: goal_params)
    result = service.call
    
    if result.success?
      redirect_to result.data, notice: 'Goal was successfully created.'
    else
      @goal_form = GoalForm.new(current_user, nil, goal_params)
      @goal_form.valid? # Trigger validations for error display
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @goal
    @goal_form = GoalForm.new(current_user, @goal)
  end

  def update
    authorize @goal
    service = Goals::UpdateService.new(goal: @goal, params: goal_params)
    result = service.call
    
    if result.success?
      redirect_to result.data, notice: 'Goal was successfully updated.'
    else
      @goal_form = GoalForm.new(current_user, @goal, goal_params)
      @goal_form.valid? # Trigger validations for error display
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @goal
    service = Goals::DeleteService.new(goal: @goal)
    result = service.call
    
    if result.success?
      redirect_to goals_url, notice: 'Goal was successfully deleted.'
    else
      redirect_to goals_url, alert: result.errors.join(', ')
    end
  end

  def complete
    authorize @goal
    if @goal.complete!
      redirect_to goals_url, notice: 'Goal was successfully completed.'
    else
      redirect_to goals_url, alert: 'Could not complete goal.'
    end
  end

  private

  def set_goal
    @goal = current_user.goals.find(params[:id])
  end

  def goal_params
    params.require(:goal).permit(:name, :description, :category_id, :goal_type, 
                                 :start_date, :target_date, :unit, :is_active,
                                 goal_metrics_attributes: [:id, :target_value, :current_value, 
                                                          :current_days_doing, :current_days_without, :unit, :_destroy])
  end
end
