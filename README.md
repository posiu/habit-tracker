# Habit Tracker

Personal habit and performance tracking application built with Ruby on Rails.

## Tech Stack

- Ruby on Rails (latest stable)
- PostgreSQL
- Hotwire (Turbo + Stimulus)
- Tailwind CSS
- Devise (Authentication)
- Pundit (Authorization)
- Sidekiq (Background Jobs)
- RSpec (Testing)

## Setup

1. Install dependencies:
   ```bash
   bundle install
   npm install  # if needed
   ```

2. Setup database:
   ```bash
   rails db:create
   rails db:migrate
   ```

3. Start services:
   ```bash
   # Terminal 1: Rails server
   rails server
   
   # Terminal 2: Redis (for Sidekiq)
   redis-server
   
   # Terminal 3: Sidekiq
   bundle exec sidekiq
   ```

4. Visit http://localhost:3000

## Testing

```bash
bundle exec rspec
bundle exec rubocop
bundle exec brakeman
```

## Development

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.
See [ARCHITECTURE.md](ARCHITECTURE.md) for architecture documentation.
See [DOMAIN_MODEL.md](DOMAIN_MODEL.md) for domain model.
See [ROADMAP.md](ROADMAP.md) for project roadmap.
