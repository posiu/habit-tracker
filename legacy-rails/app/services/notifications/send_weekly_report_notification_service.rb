module Notifications
  class SendWeeklyReportNotificationService < BaseService
    def initialize(user)
      @user = user
    end

    def call
      report = Reports::GenerateWeeklyReportService.new(user).call.data
      WeeklyReportMailer.with(user: user, report: report).weekly_report.deliver_later
      success(true)
    end

    private

    attr_reader :user
  end
end
