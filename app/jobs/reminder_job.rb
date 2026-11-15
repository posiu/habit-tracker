# Runs hourly. Sends the daily habit reminder to every user for whom it is
# currently their preferred reminder hour (user.reminder_time, default 09:00,
# interpreted in the user's own time zone).
class ReminderJob < ApplicationJob
  queue_as :default

  DEFAULT_HOUR = 9

  def perform(now = Time.current)
    User.with_notifications_enabled.find_each do |user|
      next unless due?(user, now)

      Notifications::SendReminderService.new(user).call
    rescue StandardError => e
      Rails.logger.error("[ReminderJob] user=#{user.id} #{e.class}: #{e.message}")
    end
  end

  private

  def due?(user, now)
    zone = ActiveSupport::TimeZone[user.time_zone.to_s] || ActiveSupport::TimeZone['UTC']
    now.in_time_zone(zone).hour == (user.reminder_time&.hour || DEFAULT_HOUR)
  end
end
