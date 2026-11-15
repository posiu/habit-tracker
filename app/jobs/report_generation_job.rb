# Sends the periodic report e-mail ('weekly' or 'monthly') to every user who
# chose that frequency in their settings.
class ReportGenerationJob < ApplicationJob
  queue_as :default

  def perform(frequency)
    raise ArgumentError, "Unknown report frequency: #{frequency}" unless User::REPORT_FREQUENCIES.include?(frequency) && frequency != 'none'

    User.with_notifications_enabled.where(report_frequency: frequency).find_each do |user|
      ReportMailer.public_send("#{frequency}_report", user).deliver_now
    rescue StandardError => e
      Rails.logger.error("[ReportGenerationJob] user=#{user.id} #{e.class}: #{e.message}")
    end
  end
end
