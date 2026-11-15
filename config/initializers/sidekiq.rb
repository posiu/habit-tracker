redis_config = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }

Sidekiq.configure_server do |config|
  config.redis = redis_config

  # Register recurring jobs (config/schedule.yml) once the server has booted.
  config.on(:startup) do
    schedule_file = Rails.root.join('config/schedule.yml')
    if schedule_file.exist?
      Sidekiq::Cron::Job.load_from_hash!(YAML.safe_load(schedule_file.read))
    end
  end
end

Sidekiq.configure_client do |config|
  config.redis = redis_config
end
