require 'rails_helper'

RSpec.describe Notifications::SendReminderService do
  let(:user) { create(:user) }
  let(:date) { Date.new(2026, 11, 16) } # a Monday (wday 1)

  def deliveries
    ActionMailer::Base.deliveries
  end

  before { deliveries.clear }

  def call
    described_class.new(user, date: date).call
  end

  it 'e-mails the habits that have reminders enabled and are not done yet' do
    create(:habit, user: user, name: 'Stretch', reminder_enabled: true, start_date: date - 5)
    create(:habit, user: user, name: 'No reminder', reminder_enabled: false, start_date: date - 5)

    result = call

    expect(result.data[:sent]).to be true
    expect(deliveries.size).to eq(1)
    mail = deliveries.last
    expect(mail.to).to eq([user.email])
    expect(mail.body.encoded).to include('Stretch')
    expect(mail.body.encoded).not_to include('No reminder')
  end

  it 'skips habits already completed that day' do
    habit = create(:habit, user: user, reminder_enabled: true, start_date: date - 5)
    entry = create(:daily_entry, user: user, entry_date: date)
    create(:habit_entry, habit: habit, daily_entry: entry)

    expect(call.data).to include(sent: false, reason: :nothing_due)
    expect(deliveries).to be_empty
  end

  it 'still reminds when the entry for the day exists but the habit is not completed' do
    habit = create(:habit, user: user, reminder_enabled: true, start_date: date - 5)
    entry = create(:daily_entry, user: user, entry_date: date)
    create(:habit_entry, :incomplete, habit: habit, daily_entry: entry)

    expect(call.data[:sent]).to be true
  end

  it 'respects reminder_days (0 = Sunday)' do
    create(:habit, user: user, reminder_enabled: true, reminder_days: [2, 4], start_date: date - 5) # Tue, Thu
    expect(call.data[:sent]).to be false

    create(:habit, user: user, reminder_enabled: true, reminder_days: [1], start_date: date - 5) # Mon
    expect(call.data[:sent]).to be true
  end

  it 'ignores inactive habits and habits outside their date range' do
    create(:habit, user: user, reminder_enabled: true, is_active: false, start_date: date - 5)
    create(:habit, user: user, reminder_enabled: true, start_date: date + 1)
    create(:habit, user: user, reminder_enabled: true, start_date: date - 10, end_date: date - 1)

    expect(call.data[:sent]).to be false
  end

  it 'does nothing for users with notifications disabled' do
    user.update!(email_notifications_enabled: false)
    create(:habit, user: user, reminder_enabled: true, start_date: date - 5)

    expect(call.data).to include(sent: false, reason: :notifications_disabled)
    expect(deliveries).to be_empty
  end
end
