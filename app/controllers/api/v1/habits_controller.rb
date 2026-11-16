module Api
  module V1
    class HabitsController < BaseController
      before_action :set_habit, only: %i[show update destroy archive]

      # GET /api/v1/habits?status=active|inactive|all&category_id=
      def index
        scope = current_user.habits.ordered
        scope = scope.active if params[:status].blank? || params[:status] == 'active'
        scope = scope.inactive if params[:status] == 'inactive'
        scope = scope.by_category(params[:category_id]) if params[:category_id].present?

        render_paginated(scope) { |h| Serializers.habit(h) }
      end

      def show
        render_data(Serializers.habit(@habit, with_streak: true))
      end

      def create
        result = Habits::CreateService.new(user: current_user, params: habit_params.to_h).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.habit(result.data), status: :created)
      end

      def update
        attrs = merged_attributes(HabitForm.new(current_user, @habit), habit_params)
        result = Habits::UpdateService.new(habit: @habit, params: attrs).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.habit(result.data))
      end

      def destroy
        result = Habits::DeleteService.new(habit: @habit).call
        return render_service_failure(result) unless result.success?

        head :no_content
      end

      def archive
        result = Habits::ArchiveService.new(habit: @habit).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.habit(result.data))
      end

      private

      def set_habit
        @habit = current_user.habits.find(params[:id])
      end

      def habit_params
        params.require(:habit).permit(:name, :description, :category_id, :habit_type, :target_value, :unit,
                                      :start_date, :end_date, :reminder_enabled, :is_active,
                                      reminder_days: [])
      end
    end
  end
end
