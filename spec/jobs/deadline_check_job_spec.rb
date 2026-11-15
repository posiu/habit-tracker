require 'rails_helper'

RSpec.describe DeadlineCheckJob, type: :job do
  before { ActionMailer::Base.deliveries.clear }

  it 'alerts every user with an approaching goal' do
    a = create(:user)
    b = create(:user)
    create(:user) # no goals
    create(:goal, user: a, start_date: 5.days.ago.to_date, target_date: Date.current + 1)
    create(:goal, user: b, start_date: 5.days.ago.to_date, target_date: Date.current + 3)

    described_class.perform_now

    expect(ActionMailer::Base.deliveries.flat_map(&:to)).to match_array([a.email, b.email])
  end
end
