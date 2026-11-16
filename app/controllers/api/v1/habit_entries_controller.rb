module Api
  module V1
    class HabitEntriesController < BaseController
      # POST /api/v1/daily_entries/:daily_entry_id/habit_entries
      # Upsert: tracking the same habit twice for a day updates the entry.
      def create
        daily_entry = current_user.daily_entries.find(params[:daily_entry_id])
        habit = current_user.habits.find(params.require(:habit_id))
        existing = daily_entry.habit_entries.find_by(habit_id: habit.id)

        result = if existing
                   Entries::UpdateHabitEntryService.new(habit_entry: existing, habit: habit, daily_entry: daily_entry, params: entry_params).call
                 else
                   Entries::CreateHabitEntryService.new(daily_entry: daily_entry, habit: habit, params: entry_params).call
                 end
        return render_service_failure(result) unless result.success?

        render_data(Serializers.habit_entry(result.data), status: existing ? :ok : :created)
      end

      def update
        entry = find_entry
        result = Entries::UpdateHabitEntryService.new(habit_entry: entry, habit: entry.habit, daily_entry: entry.daily_entry, params: entry_params).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.habit_entry(result.data))
      end

      def destroy
        find_entry.destroy!
        head :no_content
      end

      private

      def find_entry
        HabitEntry.joins(:daily_entry).where(daily_entries: { user_id: current_user.id }).find(params[:id])
      end

      def entry_params
        params.permit(:value, :completed, :notes)
      end
    end
  end
end
