module Notifications
  class SendStreakMilestoneNotificationService < BaseService
    def initialize(user, habit, streak)
      @user = user
      @habit = habit
      @streak = streak
    end

    def call
      return failure('No streak milestone') unless streak_milestone?
      # Enqueue mailer job
      HabitMailer.with(user: user, habit: habit, streak: streak).streak_milestone.deliver_later
      success(true)
    end

    private

    attr_reader :user, :habit, :streak

    def streak_milestone?
      [7, 30, 100, 365].include?(streak)
    end
  end
end
