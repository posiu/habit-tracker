require 'rails_helper'

RSpec.describe 'Reports', type: :request do
  let(:user) { create(:user) }

  it 'redirects guests to sign in' do
    get report_path('weekly')
    expect(response).to redirect_to(new_user_session_path)
  end

  context 'when signed in' do
    before do
      sign_in user
      create(:habit, user: user, name: 'Run')
    end

    it 'lists the reports' do
      get reports_path
      expect(response).to have_http_status(:ok)
    end

    %w[weekly monthly quarterly].each do |type|
      it "renders the #{type} report" do
        get report_path(type)
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('Download CSV')
      end

      it "downloads the #{type} report as CSV" do
        get report_path(type, format: :csv)
        expect(response).to have_http_status(:ok)
        expect(response.media_type).to eq('text/csv')
        expect(response.headers['Content-Disposition']).to include("#{type}-report-")
        expect(response.body).to include('Run')
      end

      it "downloads the #{type} report as PDF" do
        get report_path(type, format: :pdf)
        expect(response).to have_http_status(:ok)
        expect(response.media_type).to eq('application/pdf')
        expect(response.body.b).to start_with('%PDF-')
      end
    end

    it 'honours a custom period start date' do
      get report_path('monthly'), params: { start_date: '2025-01-15' }
      expect(response.body).to include('January 2025')
    end

    it 'ignores an invalid start date' do
      get report_path('weekly'), params: { start_date: 'not-a-date' }
      expect(response).to have_http_status(:ok)
    end

    it 'redirects for an unknown report type' do
      get report_path('yearly')
      expect(response).to redirect_to(reports_path)
    end
  end
end
