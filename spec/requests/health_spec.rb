require 'rails_helper'

RSpec.describe 'Health check', type: :request do
  it 'returns ok without authentication' do
    get '/up'
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to eq('status' => 'ok')
  end

  it 'returns 503 when the database is unreachable' do
    allow(ActiveRecord::Base.connection).to receive(:execute).and_raise(PG::ConnectionBad)
    get '/up'
    expect(response).to have_http_status(:service_unavailable)
  end

  it 'hides the Sidekiq UI from anonymous users and non-admins' do
    get '/sidekiq'
    expect(response).to have_http_status(:found)
    expect(response.location).to end_with('/users/sign_in')
    sign_in create(:user)
    expect { get '/sidekiq' }.to raise_error(ActionController::RoutingError)
  end

  it 'shows the Sidekiq UI to admins' do
    sign_in create(:user, admin: true)
    get '/sidekiq'
    expect(response).to have_http_status(:ok)
  end
end
