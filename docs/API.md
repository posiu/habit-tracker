# Habit Tracker JSON API (v1)

Base URL: `/api/v1`. All requests and responses are JSON (`Content-Type: application/json`).
Every response carries `X-API-Version: v1`. A future `v2` will live under `/api/v2` next to v1.

## Authentication

Token based (JWT, HS256, valid for 24 hours).

```
POST /api/v1/auth/login      { "email": "...", "password": "..." }
→ 200 { "data": { "token": "...", "token_type": "Bearer", "expires_at": "2026-11-17T10:00:00Z", "user": {...} } }

POST /api/v1/auth/refresh    (Authorization: Bearer <valid token>)  → new token
DELETE /api/v1/auth/logout   → 204, revokes ALL tokens issued for the user
```

Send the token on every other request: `Authorization: Bearer <token>`.
Missing, malformed, expired or revoked tokens give `401` with a `WWW-Authenticate: Bearer` header.
A token is also revoked when `jwt_jti` is rotated (logout).

## Response format

```json
{ "data": { ... } }                                   // single resource
{ "data": [ ... ], "meta": { "page": 1, "per_page": 25, "total_pages": 3, "total_count": 61 } }
{ "error": { "code": "validation_failed", "message": "Validation failed", "details": { "name": ["can't be blank"] } } }
```

Lists accept `page` and `per_page` (default 25, max 100).

| HTTP | `error.code` | Meaning |
| --- | --- | --- |
| 400 | `parameter_missing`, `bad_request` | missing top-level key, malformed date/range |
| 401 | `unauthorized`, `invalid_credentials` | no/invalid/expired/revoked token, bad login |
| 403 | `forbidden` | not allowed |
| 404 | `not_found` | unknown resource **or one that belongs to another user** |
| 409 | `conflict` | e.g. deleting a category that still has habits/goals |
| 422 | `validation_failed`, `unprocessable` | validation errors in `details` |
| 429 | `rate_limited` | see `Retry-After` header |

## Endpoints

| Method & path | Notes |
| --- | --- |
| `GET/PATCH /profile` | body `{ "user": { first_name, last_name, time_zone, locale, email_notifications_enabled, reminder_time, report_frequency } }` |
| `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` | body `{ "category": { name, description, color, icon, position, is_active } }` |
| `GET/POST /habits`, `GET/PATCH/DELETE /habits/:id`, `PATCH /habits/:id/archive` | `?status=active\|inactive\|all`, `?category_id=`; body `{ "habit": { name, description, category_id, habit_type (boolean\|numeric\|time\|count), target_value, unit, start_date, end_date, reminder_enabled, reminder_days: [0-6], is_active } }`; `show` adds `current_streak` |
| `GET/POST /goals`, `GET/PATCH/DELETE /goals/:id`, `PATCH /goals/:id/complete` | `?status=active\|completed\|all`, `?category_id=`; body `{ "goal": { name, description, category_id, goal_type, unit, start_date, target_date } }`; responses include `progress` and `metric` |
| `GET/POST /daily_entries`, `GET/PATCH/DELETE /daily_entries/:id` | `?from=&to=` (ISO dates); body `{ "daily_entry": { entry_date, mood (1-5), notes } }`. POSTing an existing date updates that day (`200` instead of `201`). `show` embeds `habit_entries` and `goal_entries` |
| `POST /daily_entries/:id/habit_entries` | `{ habit_id, value, completed, notes }`; upsert per habit and day |
| `PATCH/DELETE /habit_entries/:id` | |
| `POST /daily_entries/:id/goal_entries` | `{ goal_id, value, boolean_value, is_increment, notes }`; upsert. Updates the goal metric and completes the goal when the target is reached |
| `PATCH/DELETE /goal_entries/:id` | |
| `GET /dashboard` | counts, current streak, today's entry |
| `GET /dashboard/heatmap` | `?from=&to=` (default last year, max 400 days) |
| `GET /reports`, `GET /reports/:type` | `type` = `weekly\|monthly\|quarterly`, optional `?start_date=` |

PATCH requests are partial: omitted attributes keep their value.

## Rate limits

Per IP: 300 requests / 5 minutes on `/api/*`; 10 logins / minute. Per e-mail address: 5 login attempts / minute.
Exceeding a limit returns `429` with `Retry-After` (seconds).

## CORS

Native clients do not need it. For browser clients set `CORS_ORIGINS` (comma separated origins) in production;
development allows all origins.

## Example

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"secret"}' | jq -r .data.token)

curl -s localhost:3000/api/v1/habits -H "Authorization: Bearer $TOKEN"

curl -s -X POST localhost:3000/api/v1/habits -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"habit":{"name":"Read","habit_type":"boolean","start_date":"2026-11-16"}}'
```
