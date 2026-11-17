class SendMissedEntryJob < ApplicationJob
  queue_as :default

  def perform(user_id, date)
    user = User.find(user_id)
    Notifications::SendMissedEntryNotificationService.new(user, date).call
  end
end
