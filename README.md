# Habit Tracker

Personal habit and performance tracking application built with Ruby on Rails.

## Tech Stack

- Ruby 3.4, Ruby on Rails 8.1
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
   # no Node/yarn needed: JavaScript is served via importmap
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
bundle exec rspec        # no Redis needed; PostgreSQL required
COVERAGE=1 bundle exec rspec   # also writes coverage/index.html (currently ~84% lines)
bundle exec brakeman
```

(`.rubocop.yml` still uses the pre-1.72 `require:` syntax; update it before running `bundle exec rubocop` with a current RuboCop.)

## Project Status

### ✅ Completed Stages

**Stage 1-3:** Core infrastructure, authentication, and CRUD for Habits/Goals/Categories
**Stage 4:** Dashboard, daily entries system, and GitHub-style heatmap visualization
**Stage 5 (core):** Reports, exports, e-mail reports, reminders and deadline alerts (see below)
**Stage 6 (API):** JSON API v1 with JWT authentication — see [docs/API.md](docs/API.md)

### 📊 Current Features

- User authentication (Devise)
- Habit tracking (boolean, numeric, time, counter types)
- Goal tracking (5 goal types with metrics); metrics are recalculated from entries and
  goals are completed automatically once their target is reached
- Category organization with colors & icons
- Daily entry logging with mood tracking
- Habit & goal entry tracking per day
- GitHub-style activity heatmap (1 year)
- Dashboard with statistics and quick actions
- Weekly / monthly / quarterly reports for a chosen period, with **CSV and PDF export**
- **E-mail reports** (weekly on Mondays / monthly on the 1st, per-user setting) with a CSV attached
- **Habit reminders** (per habit: enabled + weekdays; per user: hour and time zone) and
  **goal deadline alerts**
- Authorization system (Pundit policies)
- **JSON API v1** (`/api/v1`) for the iOS app: JWT login/refresh/logout (tokens revoked on logout),
  CRUD for categories/habits/goals/daily entries, habit & goal tracking, dashboard, heatmap and reports,
  pagination, uniform error format, rate limiting (`rack-attack`) and CORS (`CORS_ORIGINS`)
- ~280 automated tests (`bundle exec rspec`)

### ⏰ Background jobs

Recurring jobs are defined in [`config/schedule.yml`](config/schedule.yml) and registered by
`sidekiq-cron` when the Sidekiq server boots:

| Job | When | What |
| --- | --- | --- |
| `ReminderJob` | hourly | e-mails open habits to users whose reminder hour it is (default 09:00, in their time zone) |
| `DeadlineCheckJob` | daily 08:00 | goals due within 3 days |
| `ReportGenerationJob("weekly")` | Mondays 07:00 | last week's report |
| `ReportGenerationJob("monthly")` | 1st of month 07:00 | last month's report |

Configuration (environment variables): `REDIS_URL`, `MAILER_FROM` (sender address),
`APP_HOST` (host used in links inside e-mails, production). Configure SMTP delivery in
`config/environments/production.rb` before enabling e-mails.

### 🔄 Still open from Stage 5 (see [ROADMAP.md](ROADMAP.md))
- `ReportQuery` / `ReportPresenter`; charts on the report pages (the dashboard already has them)
- Nightly streak persistence job (streaks are currently computed on demand)

### 🔜 Remaining before production
- OpenAPI/Swagger (RSwag) spec; raise test coverage from ~84% to >85%
- Fix `.rubocop.yml` for current RuboCop

## Documentation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment.
See [ARCHITECTURE.md](ARCHITECTURE.md) for architecture documentation.
See [DOMAIN_MODEL.md](DOMAIN_MODEL.md) for domain model.
See [ROADMAP.md](ROADMAP.md) for project roadmap.
See [docs/API.md](docs/API.md) for the JSON API.

### Stage Guides
- [Stage 3 Guide](STAGE3_GUIDE.md) - CRUD patterns and Services
- [Stage 3 Report](STAGE3_COMPLETION_REPORT.md) - Implementation details
- [Stage 4 Guide](STAGE4_GUIDE.md) - Daily entries and dashboard usage
- [Stage 4 Report](STAGE4_COMPLETION_REPORT.md) - Features and metrics
