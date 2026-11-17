require 'rails_helper'

RSpec.describe MissedEntryMailer, type: :mailer do
  let(:user) { create(:user, email: 'test@example.com') }
  let(:date) { Date.yesterday }
  let(:mail) { described_class.with(user: user, date: date).missed_entry }

  it 'renders the subject' do
    expect(mail.subject).to eq("Przypomnienie: Brak wpisu dziennego na #{date}")
  end

  it 'sends to the correct user' do
    expect(mail.to).to eq([user.email])
  end

  it 'includes date info in the body' do
    expect(mail.body.encoded).to include(date.to_s)
  end
end
