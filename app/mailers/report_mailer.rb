class ReportMailer < ApplicationMailer
  def weekly_report(user)
    deliver_report(user, 'weekly', Reports::GenerateWeeklyReportService.new(user).call)
  end

  def monthly_report(user)
    previous_month = 1.month.ago.to_date.beginning_of_month
    deliver_report(user, 'monthly', Reports::GenerateMonthlyReportService.new(user, start_date: previous_month).call)
  end

  private

  def deliver_report(user, type, result)
    raise ArgumentError, "Could not build #{type} report: #{result.error_messages.to_sentence}" unless result.success?

    @user = user
    @type = type
    @report = result.data

    csv = Reports::ExportReportService.new(report_type: type, data: @report, format: 'csv').call
    attachments[csv.data[:filename]] = { mime_type: 'text/csv', content: csv.data[:content] } if csv.success?

    mail to: user.email, subject: "Your #{type} habit report: #{@report[:period]}", template_name: 'report'
  end
end
