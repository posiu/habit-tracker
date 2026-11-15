require 'rails_helper'

RSpec.describe ReminderJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  let(:noon_utc) { Time.utc(2026, 11, 16, 12, 0) }

  before { ActionMailer::Base.deliveries.clear }

  def user_with_habit(**attrs)
    user = create(:user, **attrs)
    create(:habit, user: user, reminder_enabled: true, start_date: Date.new(2026, 11, 1))
    user
  end

  it 'reminds users whose preferred hour (in their time zone) is now' do
    warsaw = user_with_habit(time_zone: 'Europe/Warsaw', reminder_time: '13:00') # 12:00 UTC = 13:00 CET
    user_with_habit(time_zone: 'UTC', reminder_time: '09:00')

    described_class.perform_now(noon_utc)

    expect(ActionMailer::Base.deliveries.map(&:to)).to eq([[warsaw.email]])
  end

  it 'defaults to 09:00 when the user has no reminder time' do
    user = user_with_habit(time_zone: 'UTC', reminder_time: nil)

    described_class.perform_now(Time.utc(2026, 11, 16, 9, 30))

    expect(ActionMailer::Base.deliveries.map(&:to)).to eq([[user.email]])
  end

  it 'skips users who disabled notifications' do
    user_with_habit(time_zone: 'UTC', reminder_time: '12:00', email_notifications_enabled: false)

    described_class.perform_now(noon_utc)

    expect(ActionMailer::Base.deliveries).to be_empty
  end

  it 'keeps going when one user fails' do
    user_with_habit(time_zone: 'UTC', reminder_time: '12:00')
    good = user_with_habit(time_zone: 'UTC', reminder_time: '12:00')
    allow(Notifications::SendReminderService).to receive(:new).and_wrap_original do |original, user, *args|
      raise 'boom' if user.id != good.id

      original.call(user, *args)
    end

    expect { described_class.perform_now(noon_utc) }.not_to raise_error
    expect(ActionMailer::Base.deliveries.map(&:to)).to eq([[good.email]])
  end

  it 'survives an unknown time zone string' do
    user_with_habit(time_zone: 'Nowhere/Land', reminder_time: '12:00')

    expect { described_class.perform_now(noon_utc) }.not_to raise_error
    expect(ActionMailer::Base.deliveries.size).to eq(1) # falls back to UTC
  end
end
