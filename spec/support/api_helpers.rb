module ApiHelpers
  def auth_headers(user)
    token, = Auth::TokenService.encode(user)
    { 'Authorization' => "Bearer #{token}" }
  end

  def json
    JSON.parse(response.body)
  end
end

RSpec.configure do |config|
  config.include ApiHelpers, type: :request
  config.before { Rack::Attack.cache.store.clear }
end
