module Notifications
  # E-mails a user the habits they asked to be reminded about today and have
  # not completed yet. Returns success with data[:sent] telling whether a mail went out.
  class SendReminderService < BaseService
    def initialize(user, date: nil)
      @user = user
      @date = date || Time.use_zone(zone) { Time.zone.today }
    end

    def call
      return success(sent: false, reason: :notifications_disabled) unless user.email_notifications_enabled?

      habits = due_habits
      return success(sent: false, reason: :nothing_due) if habits.empty?

      ReminderMailer.daily_reminder(user, habits.map(&:id), date).deliver_now
      success(sent: true, habits: habits)
    end

    private

    attr_reader :user, :date

    def zone
      ActiveSupport::TimeZone[user.time_zone.to_s] || ActiveSupport::TimeZone['UTC']
    end

    def due_habits
      completed_ids = HabitEntry.joins(:daily_entry)
                                .where(daily_entries: { user_id: user.id, entry_date: date }, completed: true)
                                .select(:habit_id)

      user.habits.active.with_reminders
          .where('start_date <= ?', date)
          .where('end_date IS NULL OR end_date >= ?', date)
          .where.not(id: completed_ids)
          .select { |habit| remind_on?(habit) }
    end

    # reminder_days holds weekdays (0 = Sunday); an empty list means every day.
    def remind_on?(habit)
      habit.reminder_days.blank? || habit.reminder_days.include?(date.wday)
    end
  end
end
