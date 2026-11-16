module Api
  module V1
    class ProfilesController < BaseController
      def show
        render_data(Serializers.user(current_user))
      end

      def update
        if current_user.update(profile_params)
          render_data(Serializers.user(current_user))
        else
          render_validation_error(current_user.errors)
        end
      end

      private

      def profile_params
        params.require(:user).permit(:first_name, :last_name, :time_zone, :locale,
                                     :email_notifications_enabled, :reminder_time, :report_frequency)
      end
    end
  end
end
