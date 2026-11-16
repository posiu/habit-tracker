# CORS for the JSON API (/api/*). Native iOS clients do not need CORS; this is
# for browser based clients. In production set CORS_ORIGINS to a comma separated
# list of allowed origins (nothing is allowed by default).
allowed_origins =
  if Rails.env.production?
    ENV.fetch('CORS_ORIGINS', '').split(',').map(&:strip).reject(&:empty?)
  else
    ['*']
  end

if allowed_origins.any?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(*allowed_origins)
      resource '/api/*',
               headers: :any,
               methods: %i[get post patch put delete options head],
               expose: %w[X-API-Version Retry-After],
               max_age: 600
    end
  end
end
