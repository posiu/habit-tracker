class SendWeeklyReportJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find(user_id)
    Notifications::SendWeeklyReportNotificationService.new(user).call
  end
end
