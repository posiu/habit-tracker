class Users::ProfilesController < ApplicationController
  include Authenticatable
  
  before_action :set_user

  def show
  end

  def edit
  end

  def update
    if @user.update(profile_params)
      redirect_to users_profile_path, notice: 'Profile updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = current_user
    authorize @user, :update?
  end

  def profile_params
    params.require(:user).permit(
      :first_name, :last_name, :time_zone, :locale,
      :email_notifications_enabled, :reminder_time
    )
  end
end
