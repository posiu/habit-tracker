module Notifications
  # E-mails a user about their open goals whose deadline is today or within
  # the next `within` days.
  class CheckDeadlinesService < BaseService
    DEFAULT_WINDOW_DAYS = 3

    def initialize(user, today: nil, within: DEFAULT_WINDOW_DAYS)
      @user = user
      @today = today || Time.use_zone(zone) { Time.zone.today }
      @within = within
    end

    def call
      return success(sent: false, reason: :notifications_disabled) unless user.email_notifications_enabled?

      goals = approaching_goals
      return success(sent: false, reason: :nothing_due) if goals.empty?

      ReminderMailer.deadline_alert(user, goals.map(&:id), today).deliver_now
      success(sent: true, goals: goals)
    end

    private

    attr_reader :user, :today, :within

    def zone
      ActiveSupport::TimeZone[user.time_zone.to_s] || ActiveSupport::TimeZone['UTC']
    end

    def approaching_goals
      user.goals.active.incomplete
          .where(target_date: today..(today + within.days))
          .order(:target_date)
          .to_a
    end
  end
end
