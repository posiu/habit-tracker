require 'rails_helper'

RSpec.describe Notifications::SendMissedEntryNotificationService, type: :service do
  let(:user) { create(:user, email: 'test@example.com') }
  let(:date) { Date.yesterday }

  it 'does not send notification if entry exists' do
    create(:daily_entry, user: user, entry_date: date)
    service = described_class.new(user, date)
    expect(service.call.success?).to be_falsey
  end

  it 'sends notification if entry is missing' do
    service = described_class.new(user, date)
    expect {
      service.call
    }.to have_enqueued_mail(MissedEntryMailer, :missed_entry)
  end
end
