class ReportsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_report_type, only: :show

  REPORT_TYPES = {
    'weekly' => Reports::GenerateWeeklyReportService,
    'monthly' => Reports::GenerateMonthlyReportService,
    'quarterly' => Reports::GenerateQuarterlyReportService
  }.freeze

  def index
    @reports = [
      { type: 'weekly', name: 'Weekly Report', description: 'Last 7 days activity summary' },
      { type: 'monthly', name: 'Monthly Report', description: 'Current month progress' },
      { type: 'quarterly', name: 'Quarterly Report', description: 'Last 3 months overview' }
    ]
  end

  def show
    @start_date = parse_start_date(params[:start_date])
    @report_data = generate_report(@report_type, @start_date)

    respond_to do |format|
      format.html
      format.pdf { export(:pdf) }
      format.csv { export(:csv) }
    end
  end

  private

  def set_report_type
    @report_type = params[:id]
    return if REPORT_TYPES.key?(@report_type)

    redirect_to reports_path, alert: 'Unknown report type.'
  end

  def generate_report(type, start_date)
    service = REPORT_TYPES.fetch(type)
    options = start_date ? { start_date: period_start(type, start_date) } : {}
    service.new(current_user, **options).call
  end

  # Snap the picked date to the beginning of the period it belongs to.
  def period_start(type, date)
    type == 'weekly' ? date.beginning_of_week : date.beginning_of_month
  end

  def parse_start_date(value)
    return nil if value.blank?

    Date.iso8601(value.to_s)
  rescue ArgumentError
    nil
  end

  def export(format)
    unless @report_data.success?
      return redirect_to reports_path, alert: @report_data.error_messages.to_sentence
    end

    result = Reports::ExportReportService.new(
      report_type: @report_type, data: @report_data.data, format: format
    ).call

    return redirect_to reports_path, alert: result.error_messages.to_sentence unless result.success?

    send_data result.data[:content],
              filename: result.data[:filename],
              type: result.data[:content_type],
              disposition: 'attachment'
  end
end
