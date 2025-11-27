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

## Project Status

### ✅ Completed Stages

**Stage 1-3:** Core infrastructure, authentication, and CRUD for Habits/Goals/Categories
**Stage 4:** Dashboard, daily entries system, and GitHub-style heatmap visualization

### 📊 Current Features

- User authentication (Devise)
- Habit tracking (boolean, numeric, time, counter types)
- Goal tracking (5 goal types with metrics)
- Category organization with colors & icons
- Daily entry logging with mood tracking
- Habit & goal entry tracking per day
- GitHub-style activity heatmap (1 year)
- Dashboard with statistics and quick actions
- Authorization system (Pundit policies)
- Comprehensive test coverage (50+ tests)

### 🔄 Next: Stage 5
- Streak calculations and persistence
- Progress metrics and auto-completion
- Weekly/monthly reports with export
- Email reminders and deadline alerts
- Scheduled background jobs (Sidekiq cron)

## Documentation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.
See [ARCHITECTURE.md](ARCHITECTURE.md) for architecture documentation.
See [DOMAIN_MODEL.md](DOMAIN_MODEL.md) for domain model.
See [ROADMAP.md](ROADMAP.md) for project roadmap.

### Stage Guides
- [Stage 3 Guide](STAGE3_GUIDE.md) - CRUD patterns and Services
- [Stage 3 Report](STAGE3_COMPLETION_REPORT.md) - Implementation details
- [Stage 4 Guide](STAGE4_GUIDE.md) - Daily entries and dashboard usage
- [Stage 4 Report](STAGE4_COMPLETION_REPORT.md) - Features and metrics
