module Api
  module V1
    class DailyEntriesController < BaseController
      before_action :set_daily_entry, only: %i[show update destroy]

      # GET /api/v1/daily_entries?from=YYYY-MM-DD&to=YYYY-MM-DD
      def index
        scope = current_user.daily_entries.order(entry_date: :desc)
        from = parse_date(params[:from])
        to = parse_date(params[:to])
        scope = scope.where('entry_date >= ?', from) if from
        scope = scope.where('entry_date <= ?', to) if to

        render_paginated(scope) { |e| Serializers.daily_entry(e) }
      end

      def show
        render_data(Serializers.daily_entry(@daily_entry, with_entries: true))
      end

      # One entry per day: posting an existing date updates it.
      def create
        result = Entries::CreateDailyEntryService.call(user: current_user, params: daily_entry_params.to_h)
        return render_service_failure(result) unless result.success?

        status = result.data.previously_new_record? ? :created : :ok
        render_data(Serializers.daily_entry(result.data), status: status)
      end

      def update
        attrs = daily_entry_form_attributes.merge(daily_entry_params.to_h.symbolize_keys)
        result = Entries::UpdateDailyEntryService.new(daily_entry: @daily_entry, params: attrs).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.daily_entry(result.data))
      end

      def destroy
        @daily_entry.destroy!
        head :no_content
      end

      private

      def set_daily_entry
        @daily_entry = current_user.daily_entries.find(params[:id])
      end

      def daily_entry_params
        params.require(:daily_entry).permit(:entry_date, :mood, :notes)
      end

      def daily_entry_form_attributes
        DailyEntryForm.new(@daily_entry, user: current_user).attributes.symbolize_keys
      end

      def parse_date(value)
        value.present? ? Date.iso8601(value.to_s) : nil
      rescue ArgumentError
        raise ActionController::BadRequest, "Invalid date: #{value}"
      end
    end
  end
end
