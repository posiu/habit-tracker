module Api
  module V1
    class ReportsController < BaseController
      TYPES = {
        'weekly' => Reports::GenerateWeeklyReportService,
        'monthly' => Reports::GenerateMonthlyReportService,
        'quarterly' => Reports::GenerateQuarterlyReportService
      }.freeze

      def index
        render_data(TYPES.keys.map { |type| { type: type, path: "/api/v1/reports/#{type}" } })
      end

      # GET /api/v1/reports/:id?start_date=YYYY-MM-DD
      def show
        service = TYPES.fetch(params[:id]) { raise ActiveRecord::RecordNotFound }
        options = {}
        if params[:start_date].present?
          date = Date.iso8601(params[:start_date].to_s)
          options[:start_date] = params[:id] == 'weekly' ? date.beginning_of_week : date.beginning_of_month
        end

        render_data(service.new(current_user, **options).call.data)
      rescue ArgumentError
        raise ActionController::BadRequest, "Invalid date: #{params[:start_date]}"
      end
    end
  end
end
