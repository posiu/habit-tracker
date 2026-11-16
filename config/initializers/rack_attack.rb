# Rate limiting for the JSON API. Limits are per client IP (and, for logins,
# additionally per e-mail address to slow down credential stuffing).
class Rack::Attack
  redis_url = ENV['REDIS_URL']
  Rack::Attack.cache.store =
    if Rails.env.production? && redis_url.present?
      ActiveSupport::Cache::RedisCacheStore.new(url: redis_url)
    else
      ActiveSupport::Cache::MemoryStore.new
    end

  throttle('api/login/ip', limit: 10, period: 1.minute) do |req|
    req.ip if req.path == '/api/v1/auth/login' && req.post?
  end

  # Clients post JSON, which Rack::Attack does not parse, so read the body
  # ourselves (bounded, and rewound for the application).
  LOGIN_BODY_LIMIT = 4.kilobytes

  def self.login_email(req)
    email =
      if req.content_type.to_s.include?('json') && req.content_length.to_i <= LOGIN_BODY_LIMIT
        body = req.body.read(LOGIN_BODY_LIMIT)
        req.body.rewind
        JSON.parse(body.to_s)['email'] if body.present?
      else
        req.params['email']
      end
    email.to_s.strip.downcase.presence
  rescue JSON::ParserError, NoMethodError, TypeError
    nil
  end

  throttle('api/login/email', limit: 5, period: 1.minute) do |req|
    login_email(req) if req.path == '/api/v1/auth/login' && req.post?
  end

  throttle('api/ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  self.throttled_responder = lambda do |request|
    match = request.env['rack.attack.match_data'] || {}
    retry_after = (match[:period] || 60).to_i
    body = { error: { code: 'rate_limited', message: 'Too many requests, retry later' } }.to_json
    [429, { 'Content-Type' => 'application/json', 'Retry-After' => retry_after.to_s }, [body]]
  end
end
