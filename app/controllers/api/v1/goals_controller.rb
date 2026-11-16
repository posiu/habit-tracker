module Api
  module V1
    class GoalsController < BaseController
      before_action :set_goal, only: %i[show update destroy complete]

      # GET /api/v1/goals?status=active|completed|all&category_id=
      def index
        scope = current_user.goals.ordered.includes(:goal_metrics)
        scope = scope.active if params[:status].blank? || params[:status] == 'active'
        scope = scope.completed if params[:status] == 'completed'
        scope = scope.by_category(params[:category_id]) if params[:category_id].present?

        render_paginated(scope) { |g| Serializers.goal(g) }
      end

      def show
        render_data(Serializers.goal(@goal))
      end

      def create
        result = Goals::CreateService.new(user: current_user, params: goal_params.to_h).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.goal(result.data), status: :created)
      end

      def update
        attrs = merged_attributes(GoalForm.new(current_user, @goal), goal_params)
        result = Goals::UpdateService.new(goal: @goal, params: attrs).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.goal(result.data))
      end

      def destroy
        result = Goals::DeleteService.new(goal: @goal).call
        return render_service_failure(result) unless result.success?

        head :no_content
      end

      def complete
        @goal.complete!
        render_data(Serializers.goal(@goal))
      end

      private

      def set_goal
        @goal = current_user.goals.find(params[:id])
      end

      def goal_params
        params.require(:goal).permit(:name, :description, :category_id, :goal_type, :unit, :start_date, :target_date)
      end
    end
  end
end
