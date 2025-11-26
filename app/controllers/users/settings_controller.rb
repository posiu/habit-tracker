class Users::SettingsController < ApplicationController
  include Authenticatable
  
  before_action :set_user

  def show
  end

  def update
    if @user.update(settings_params)
      redirect_to users_settings_path, notice: 'Settings updated successfully.'
    else
      render :show, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = current_user
    authorize @user, :update?
  end

  def settings_params
    params.require(:user).permit(
      :email_notifications_enabled, :reminder_time, :time_zone, :locale
    )
  end
end
