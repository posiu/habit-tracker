module Api
  module V1
    class GoalEntriesController < BaseController
      # POST /api/v1/daily_entries/:daily_entry_id/goal_entries
      def create
        daily_entry = current_user.daily_entries.find(params[:daily_entry_id])
        goal = current_user.goals.find(params.require(:goal_id))
        existing = daily_entry.goal_entries.find_by(goal_id: goal.id)

        result = if existing
                   Entries::UpdateGoalEntryService.new(goal_entry: existing, goal: goal, daily_entry: daily_entry, params: entry_params).call
                 else
                   Entries::CreateGoalEntryService.new(daily_entry: daily_entry, goal: goal, params: entry_params).call
                 end
        return render_service_failure(result) unless result.success?

        render_data(Serializers.goal_entry(result.data), status: existing ? :ok : :created)
      end

      def update
        entry = find_entry
        result = Entries::UpdateGoalEntryService.new(goal_entry: entry, goal: entry.goal, daily_entry: entry.daily_entry, params: entry_params).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.goal_entry(result.data))
      end

      def destroy
        find_entry.destroy!
        head :no_content
      end

      private

      def find_entry
        GoalEntry.joins(:daily_entry).where(daily_entries: { user_id: current_user.id }).find(params[:id])
      end

      def entry_params
        params.permit(:value, :boolean_value, :is_increment, :notes)
      end
    end
  end
end
