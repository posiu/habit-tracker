class ReminderMailer < ApplicationMailer
  # habit_ids / goal_ids (not records) so the arguments stay serialisable
  # for deliver_later.
  def daily_reminder(user, habit_ids, date = Date.current)
    @user = user
    @date = date
    @habits = user.habits.where(id: habit_ids).ordered

    mail to: user.email, subject: "Habit reminder: #{@habits.size} to do today"
  end

  def deadline_alert(user, goal_ids, today = Date.current)
    @user = user
    @today = today
    @goals = user.goals.where(id: goal_ids).order(:target_date)

    mail to: user.email, subject: "Goal deadline approaching (#{@goals.size})"
  end
end
