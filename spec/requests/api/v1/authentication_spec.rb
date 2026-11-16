require 'rails_helper'

RSpec.describe 'API v1 authentication', type: :request do
  let!(:user) { create(:user, email: 'ann@example.com', password: 'password123') }

  describe 'POST /api/v1/auth/login' do
    it 'returns a bearer token for valid credentials' do
      post '/api/v1/auth/login', params: { email: ' Ann@Example.com ', password: 'password123' }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json['data']).to include('token_type' => 'Bearer')
      expect(json['data']['user']['email']).to eq('ann@example.com')
      expect(response.headers['X-API-Version']).to eq('v1')

      get '/api/v1/profile', headers: { 'Authorization' => "Bearer #{json['data']['token']}" }
      expect(response).to have_http_status(:ok)
    end

    it 'rejects a wrong password without revealing whether the e-mail exists' do
      post '/api/v1/auth/login', params: { email: 'ann@example.com', password: 'nope' }, as: :json
      wrong_password = json

      post '/api/v1/auth/login', params: { email: 'ghost@example.com', password: 'nope' }, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json).to eq(wrong_password)
      expect(json['error']['code']).to eq('invalid_credentials')
    end
  end

  describe 'token validation' do
    it 'requires a token' do
      get '/api/v1/habits'
      expect(response).to have_http_status(:unauthorized)
      expect(response.headers['WWW-Authenticate']).to include('Bearer')
      expect(json['error']['code']).to eq('unauthorized')
    end

    it 'rejects garbage and tampered tokens' do
      get '/api/v1/habits', headers: { 'Authorization' => 'Bearer not.a.jwt' }
      expect(response).to have_http_status(:unauthorized)

      token, = Auth::TokenService.encode(user)
      get '/api/v1/habits', headers: { 'Authorization' => "Bearer #{token}x" }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects tokens signed with another secret' do
      forged = JWT.encode({ sub: user.id, jti: user.jwt_jti, exp: 1.hour.from_now.to_i }, 'other-secret', 'HS256')
      get '/api/v1/habits', headers: { 'Authorization' => "Bearer #{forged}" }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects the "none" algorithm' do
      forged = JWT.encode({ sub: user.id, jti: user.jwt_jti, exp: 1.hour.from_now.to_i }, nil, 'none')
      get '/api/v1/habits', headers: { 'Authorization' => "Bearer #{forged}" }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'rejects expired tokens' do
      token, = Auth::TokenService.encode(user, now: 2.days.ago)
      get '/api/v1/habits', headers: { 'Authorization' => "Bearer #{token}" }

      expect(response).to have_http_status(:unauthorized)
      expect(json['error']['message']).to match(/expired/)
    end

    it 'does not accept the web session cookie' do
      sign_in user
      get '/api/v1/habits'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    it 'revokes all tokens of the user' do
      headers = auth_headers(user)
      other_device = auth_headers(user)

      delete '/api/v1/auth/logout', headers: headers
      expect(response).to have_http_status(:no_content)

      get '/api/v1/habits', headers: headers
      expect(response).to have_http_status(:unauthorized)
      get '/api/v1/habits', headers: other_device
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/auth/refresh' do
    it 'issues a new working token' do
      post '/api/v1/auth/refresh', headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      get '/api/v1/habits', headers: { 'Authorization' => "Bearer #{json['data']['token']}" }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'rate limiting' do
    it 'throttles repeated login attempts' do
      6.times { post '/api/v1/auth/login', params: { email: 'a@example.com', password: 'x' }, as: :json }

      expect(response).to have_http_status(:too_many_requests)
      expect(response.headers['Retry-After']).to be_present
      expect(json['error']['code']).to eq('rate_limited')
    end
  end
end
