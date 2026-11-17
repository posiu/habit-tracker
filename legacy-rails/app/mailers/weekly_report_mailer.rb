class WeeklyReportMailer < ApplicationMailer
  def weekly_report
    @user = params[:user]
    @report = params[:report]
    mail(
      to: @user.email,
      subject: "Twój cotygodniowy raport postępów w nawykach i celach"
    )
  end
end
