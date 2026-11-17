class SendStreakMilestoneJob < ApplicationJob
  queue_as :default

  def perform(user_id, habit_id, streak)
    user = User.find(user_id)
    habit = Habit.find(habit_id)
    Notifications::SendStreakMilestoneNotificationService.new(user, habit, streak).call
  end
end
