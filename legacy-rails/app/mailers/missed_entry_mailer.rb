class MissedEntryMailer < ApplicationMailer
  def missed_entry
    @user = params[:user]
    @date = params[:date]
    mail(
      to: @user.email,
      subject: "Przypomnienie: Brak wpisu dziennego na #{@date}"
    )
  end
end
