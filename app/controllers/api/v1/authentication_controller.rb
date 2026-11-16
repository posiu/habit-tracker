module Api
  module V1
    class AuthenticationController < BaseController
      skip_before_action :authenticate_api_user!, only: :create

      # POST /api/v1/auth/login  { "email": "...", "password": "..." }
      def create
        user = User.find_for_database_authentication(email: params[:email].to_s.strip.downcase)

        if user&.valid_password?(params[:password].to_s)
          render_token(user)
        else
          render_error('invalid_credentials', 'Invalid email or password', status: :unauthorized)
        end
      end

      # POST /api/v1/auth/refresh - exchanges a still valid token for a fresh one
      def refresh
        render_token(current_user)
      end

      # DELETE /api/v1/auth/logout - revokes every token issued for the user
      def destroy
        current_user.rotate_jwt_jti!
        head :no_content
      end

      private

      def render_token(user)
        token, expires_at = Auth::TokenService.encode(user)
        render_data({ token: token, token_type: 'Bearer', expires_at: expires_at.iso8601,
                      user: Serializers.user(user) })
      end
    end
  end
end
