# Runs daily. Warns users about goals whose deadline is close.
class DeadlineCheckJob < ApplicationJob
  queue_as :default

  def perform
    User.with_notifications_enabled.find_each do |user|
      Notifications::CheckDeadlinesService.new(user).call
    rescue StandardError => e
      Rails.logger.error("[DeadlineCheckJob] user=#{user.id} #{e.class}: #{e.message}")
    end
  end
end
