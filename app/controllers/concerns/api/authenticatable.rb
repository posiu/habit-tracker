module Api
  # Bearer-token authentication for API controllers.
  module Authenticatable
    extend ActiveSupport::Concern

    included do
      before_action :authenticate_api_user!
    end

    private

    attr_reader :current_user

    def authenticate_api_user!
      token = bearer_token
      return unauthorized('Missing bearer token') if token.blank?

      @current_user = Auth::TokenService.authenticate(token)
    rescue Auth::TokenService::InvalidToken => e
      unauthorized(e.message)
    end

    def bearer_token
      request.authorization.to_s[/\ABearer\s+(.+)\z/i, 1]
    end

    def unauthorized(message)
      response.headers['WWW-Authenticate'] = 'Bearer realm="habit-tracker"'
      render_error('unauthorized', message, status: :unauthorized)
    end
  end
end
