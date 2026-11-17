require 'rails_helper'

RSpec.describe Notifications::SendWeeklyReportNotificationService, type: :service do
  let(:user) { create(:user, email: 'test@example.com') }

  it 'sends weekly report email' do
    expect {
      described_class.new(user).call
    }.to have_enqueued_mail(WeeklyReportMailer, :weekly_report)
  end
end
