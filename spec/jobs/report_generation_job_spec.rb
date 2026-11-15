require 'rails_helper'

RSpec.describe ReportGenerationJob, type: :job do
  before { ActionMailer::Base.deliveries.clear }

  it 'sends weekly reports only to users on the weekly plan' do
    weekly = create(:user, report_frequency: 'weekly')
    create(:user, report_frequency: 'monthly')
    create(:user, report_frequency: 'none')

    described_class.perform_now('weekly')

    expect(ActionMailer::Base.deliveries.flat_map(&:to)).to eq([weekly.email])
  end

  it 'sends monthly reports to users on the monthly plan' do
    monthly = create(:user, report_frequency: 'monthly')
    create(:user, report_frequency: 'weekly')

    described_class.perform_now('monthly')

    expect(ActionMailer::Base.deliveries.flat_map(&:to)).to eq([monthly.email])
  end

  it 'respects disabled notifications' do
    create(:user, report_frequency: 'weekly', email_notifications_enabled: false)

    described_class.perform_now('weekly')

    expect(ActionMailer::Base.deliveries).to be_empty
  end

  it 'rejects unknown frequencies' do
    expect { described_class.perform_now('daily') }.to raise_error(ArgumentError)
    expect { described_class.perform_now('none') }.to raise_error(ArgumentError)
  end
end
