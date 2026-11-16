module Api
  module V1
    class DashboardController < BaseController
      # GET /api/v1/dashboard
      def show
        habits = current_user.habits.active
        today_entry = current_user.daily_entries.find_by(entry_date: Date.current)

        render_data({
          habits_count: habits.count,
          goals_count: current_user.goals.active.count,
          categories_count: current_user.categories.active.count,
          current_streak: habits.map(&:current_streak).max || 0,
          total_entries: current_user.daily_entries.count,
          this_month_entries: current_user.daily_entries.where(entry_date: Date.current.all_month).count,
          today_entry: today_entry && Serializers.daily_entry(today_entry, with_entries: true)
        })
      end

      # GET /api/v1/dashboard/heatmap?from=&to=  (defaults to the last year)
      def heatmap
        from = parse_date(params[:from]) || 1.year.ago.to_date
        to = parse_date(params[:to]) || Date.current
        raise ActionController::BadRequest, 'from must not be after to' if from > to
        raise ActionController::BadRequest, 'Range too large (max 400 days)' if (to - from).to_i > 400

        result = Analytics::CalculateHeatmapDataService.new(current_user, start_date: from, end_date: to).call
        render_data(result.data, meta: { from: from, to: to })
      end

      # GET /api/v1/dashboard/stats?days=30
      def stats
        result = Analytics::CalculateStatsService.new(current_user, days: params[:days] || 30).call
        raise ActionController::BadRequest, result.error_messages.to_sentence unless result.success?

        render_data(result.data.merge(insights: Analytics::GenerateInsightsService.new(result.data).call.data))
      end

      private

      def parse_date(value)
        value.present? ? Date.iso8601(value.to_s) : nil
      rescue ArgumentError
        raise ActionController::BadRequest, "Invalid date: #{value}"
      end
    end
  end
end
