module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_api_user

    private

    def authenticate_api_user
      # Will be implemented with JWT in Stage 6
      head :unauthorized unless current_user
    end

    def render_success(data, status: :ok)
      render json: {
        success: true,
        data: data
      }, status: status
    end

    def render_error(errors, status: :unprocessable_entity)
      render json: {
        success: false,
        errors: errors
      }, status: status
    end
  end
end

