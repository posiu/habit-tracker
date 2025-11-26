class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, only: [:show, :edit, :update, :destroy]

  def index
    @categories = policy_scope(Category).order(:position, :name)
  end

  def show
    authorize @category
  end

  def new
    @category_form = CategoryForm.new
    authorize Category
  end

  def create
    authorize Category
    result = Categories::CreateService.call(user: current_user, params: category_params)
    
    if result.success?
      redirect_to result.data, notice: 'Category was successfully created.'
    else
      @category_form = CategoryForm.new(nil, category_params)
      @category_form.valid? # Trigger validations for error display
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @category
    @category_form = CategoryForm.new(@category)
  end

  def update
    authorize @category
    result = Categories::UpdateService.call(category: @category, params: category_params)
    
    if result.success?
      redirect_to result.data, notice: 'Category was successfully updated.'
    else
      @category_form = CategoryForm.new(@category, category_params)
      @category_form.valid? # Trigger validations for error display
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @category
    result = Categories::DeleteService.call(category: @category)
    
    if result.success?
      redirect_to categories_url, notice: 'Category was successfully deleted.'
    else
      redirect_to categories_url, alert: result.errors.join(', ')
    end
  end

  private

  def set_category
    @category = current_user.categories.find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name, :description, :color, :position, :is_active)
  end
end
