class HabitMailer < ApplicationMailer
  def streak_milestone
    @user = params[:user]
    @habit = params[:habit]
    @streak = params[:streak]
    mail(
      to: @user.email,
      subject: "Gratulacje! Osiągnięto streak #{@streak} dni w nawyku: #{@habit.name}"
    )
  end
end
