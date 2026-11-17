require 'rails_helper'

RSpec.describe Notifications::SendStreakMilestoneNotificationService, type: :service do
  let(:user) { create(:user, email: 'test@example.com') }
  let(:habit) { create(:habit, user: user, name: 'Test Habit') }

  it 'does not send notification for non-milestone streaks' do
    service = described_class.new(user, habit, 5)
    expect(service.call.success?).to be_falsey
  end

  it 'sends notification for milestone streaks' do
    service = described_class.new(user, habit, 7)
    expect {
      service.call
    }.to have_enqueued_mail(HabitMailer, :streak_milestone)
  end
end
