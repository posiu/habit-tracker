# Deployment

The app needs Ruby 3.0.2, PostgreSQL 12+, Redis (Sidekiq) and an SMTP server.
See `.env.example` for every environment variable.

## Required configuration

| Variable | Purpose |
|---|---|
| `SECRET_KEY_BASE` | Rails secrets and API JWT signing (`bundle exec rails secret`). Rotating it logs everyone out of the API. |
| `DATABASE_URL` | PostgreSQL connection (or `DATABASE_HOST/NAME/USER` + `HABIT_TRACKER_DATABASE_PASSWORD`). |
| `REDIS_URL` | Sidekiq. |
| `APP_HOST` | Host used in e-mail links (https). |
| `SMTP_*`, `MAILER_FROM` | Reminder and report e-mails. |

Optional: `ALLOWED_HOSTS`, `CORS_ORIGINS` (empty = no cross-origin API access), `FORCE_SSL=false`
(only behind a proxy that does not send `X-Forwarded-Proto`), `WEB_CONCURRENCY`, `RAILS_MAX_THREADS`, `RAILS_LOG_LEVEL`.

## Processes

- **web**: `bundle exec puma -C config/puma.rb`
- **worker**: `bundle exec sidekiq` (also registers the cron schedule from `config/schedule.yml`; run exactly one worker process group)
- **release**: `bundle exec rails db:migrate`

A `Procfile` (Heroku/Render/Fly style) and a `Dockerfile` are included.

```bash
docker build -t habit-tracker .
docker run --env-file .env -p 3000:3000 habit-tracker
docker run --env-file .env habit-tracker bundle exec sidekiq
```

## Operations

- **Health check:** `GET /up` returns 200 when the database is reachable, 503 otherwise. It is exempt from the HTTPS redirect.
- **Sidekiq UI:** `/sidekiq`, only for users with `admin = true`:
  `bundle exec rails runner 'User.find_by!(email: "you@example.com").update!(admin: true)'`
- **Logs:** set `RAILS_LOG_TO_STDOUT=true` and collect them from the platform.
- **Backups:** back up PostgreSQL regularly; Redis holds only job queues.

## Known limitations

Ruby 3.0 and Rails 6.1 are end-of-life and `bundle-audit` reports vulnerabilities that need a Rails/Ruby upgrade.
Plan that upgrade before exposing the app to the public internet.
The assets pipeline (webpacker + Tailwind CDN) was not verified with `rails assets:precompile` in this environment, and the Dockerfile was not built.
