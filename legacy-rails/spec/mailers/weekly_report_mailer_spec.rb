require 'rails_helper'

RSpec.describe WeeklyReportMailer, type: :mailer do
  let(:user) { create(:user, email: 'test@example.com') }
  let(:report) { { summary: { habit_completions: 5 }, habits: [], goals: [] } }
  let(:mail) { described_class.with(user: user, report: report).weekly_report }

  it 'renders the subject' do
    expect(mail.subject).to eq('Twój cotygodniowy raport postępów w nawykach i celach')
  end

  it 'sends to the correct user' do
    expect(mail.to).to eq([user.email])
  end

  it 'includes summary info in the body' do
    expect(mail.body.encoded).to include('habit_completions')
  end
end
