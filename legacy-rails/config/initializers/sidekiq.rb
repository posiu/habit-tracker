Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
end

# Load scheduled jobs
schedule_file = "config/schedule.rb"
if File.exist?(schedule_file) && Sidekiq.server?
  require 'yaml'
  # Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file) if defined?(Sidekiq::Cron)
end

