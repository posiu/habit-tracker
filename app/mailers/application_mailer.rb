class ApplicationMailer < ActionMailer::Base
  default from: -> { ENV.fetch('MAILER_FROM', 'Habit Tracker <no-reply@habit-tracker.local>') }
  layout 'mailer'
end
