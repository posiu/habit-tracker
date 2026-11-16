require 'rails_helper'

RSpec.describe 'API v1 dashboard, reports and profile', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  it 'returns dashboard statistics' do
    create(:habit, user: user)
    create(:goal, user: user)
    create(:daily_entry, user: user, entry_date: Date.current)

    get '/api/v1/dashboard', headers: headers

    expect(json['data']).to include('habits_count' => 1, 'goals_count' => 1, 'total_entries' => 1)
    expect(json['data']['today_entry']).to be_present
  end

  it 'returns heatmap data and validates the range' do
    get '/api/v1/dashboard/heatmap', params: { from: (Date.current - 6).iso8601 }, headers: headers
    expect(json['data'].size).to eq(7)

    get '/api/v1/dashboard/heatmap', params: { from: '2020-01-01' }, headers: headers
    expect(response).to have_http_status(:bad_request)

    get '/api/v1/dashboard/heatmap', params: { from: 'x' }, headers: headers
    expect(response).to have_http_status(:bad_request)
  end

  it 'lists and generates reports' do
    get '/api/v1/reports', headers: headers
    expect(json['data'].map { |r| r['type'] }).to eq(%w[weekly monthly quarterly])

    %w[weekly monthly quarterly].each do |type|
      get "/api/v1/reports/#{type}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json['data']).to include('period', 'summary')
    end

    get '/api/v1/reports/monthly', params: { start_date: '2025-01-20' }, headers: headers
    expect(json['data']['period']).to eq('January 2025')

    get '/api/v1/reports/yearly', headers: headers
    expect(response).to have_http_status(:not_found)

    get '/api/v1/reports/weekly', params: { start_date: 'bad' }, headers: headers
    expect(response).to have_http_status(:bad_request)
  end

  it 'shows and updates the profile' do
    get '/api/v1/profile', headers: headers
    expect(json['data']['email']).to eq(user.email)
    expect(json['data']).not_to include('encrypted_password', 'jwt_jti')

    patch '/api/v1/profile', params: { user: { first_name: 'Ola', report_frequency: 'weekly' } }, headers: headers, as: :json
    expect(user.reload).to have_attributes(first_name: 'Ola', report_frequency: 'weekly')

    patch '/api/v1/profile', params: { user: { report_frequency: 'hourly' } }, headers: headers, as: :json
    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'cannot escalate privileges through the profile' do
    patch '/api/v1/profile', params: { user: { admin: true, email: 'x@example.com' } }, headers: headers, as: :json
    expect(user.reload).not_to be_admin
    expect(user.email).not_to eq('x@example.com')
  end
end
