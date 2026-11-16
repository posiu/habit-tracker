module Api
  module ErrorHandler
    extend ActiveSupport::Concern

    included do
      rescue_from ActiveRecord::RecordNotFound do
        render_error('not_found', 'Resource not found', status: :not_found)
      end
      rescue_from ActionController::ParameterMissing do |e|
        render_error('parameter_missing', "Missing parameter: #{e.param}", status: :bad_request)
      end
      rescue_from ActionController::BadRequest do |e|
        render_error('bad_request', e.message, status: :bad_request)
      end
      rescue_from Pundit::NotAuthorizedError do
        render_error('forbidden', 'You are not allowed to perform this action', status: :forbidden)
      end
    end
  end
end
