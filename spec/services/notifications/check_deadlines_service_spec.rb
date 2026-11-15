require 'rails_helper'

RSpec.describe Notifications::CheckDeadlinesService do
  let(:user) { create(:user) }
  let(:today) { Date.new(2026, 11, 16) }

  before { ActionMailer::Base.deliveries.clear }

  def goal(name, target_date, **attrs)
    create(:goal, user: user, name: name, start_date: today - 30, target_date: target_date, **attrs)
  end

  it 'alerts about goals due within the window, nearest first' do
    goal('Soon', today + 2)
    goal('Today', today)
    goal('Far away', today + 20)

    result = described_class.new(user, today: today).call

    expect(result.data[:sent]).to be true
    expect(result.data[:goals].map(&:name)).to eq(%w[Today Soon])
    body = ActionMailer::Base.deliveries.last.body.encoded
    expect(body).to include('Soon', 'Today')
    expect(body).not_to include('Far away')
  end

  it 'ignores completed, inactive and overdue goals' do
    goal('Done', today + 1, completed_at: Time.current, is_active: false)
    goal('Overdue', today - 1)

    expect(described_class.new(user, today: today).call.data[:sent]).to be false
    expect(ActionMailer::Base.deliveries).to be_empty
  end

  it 'respects the notification preference' do
    user.update!(email_notifications_enabled: false)
    goal('Soon', today + 1)

    expect(described_class.new(user, today: today).call.data[:reason]).to eq(:notifications_disabled)
  end
end
