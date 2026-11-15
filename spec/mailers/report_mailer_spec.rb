require 'rails_helper'

RSpec.describe ReportMailer, type: :mailer do
  let(:user) { create(:user, first_name: 'Anna') }

  before { create(:habit, user: user, name: 'Bieganie') }

  describe '#weekly_report' do
    subject(:mail) { described_class.weekly_report(user) }

    it 'is addressed to the user and mentions the period' do
      expect(mail.to).to eq([user.email])
      expect(mail.subject).to match(/weekly habit report/)
    end

    it 'includes the habits and links to the full report' do
      expect(mail.html_part.body.encoded).to include('Bieganie', '/reports/weekly')
      expect(mail.text_part.body.encoded).to include('Bieganie')
    end

    it 'attaches a CSV copy' do
      attachment = mail.attachments.first
      expect(attachment.filename).to match(/\Aweekly-report-.*\.csv\z/)
      expect(attachment.mime_type).to eq('text/csv')
    end
  end

  describe '#monthly_report' do
    it 'reports on the previous month' do
      mail = described_class.monthly_report(user)
      expect(mail.subject).to include(1.month.ago.strftime('%B %Y'))
    end
  end
end
