# Directory Structure - Habit Tracker

Complete directory structure for the Habit Tracker application following domain-driven architecture.

---

## Full Directory Tree

```
habit-tracker/
├── app/
│   ├── assets/
│   │   ├── stylesheets/
│   │   │   ├── application.tailwind.css
│   │   │   └── components/          # Custom Tailwind components
│   │   └── javascript/
│   │       ├── application.js
│   │       └── controllers/         # Stimulus controllers
│   │           ├── index.js
│   │           ├── application.js
│   │           └── [name]_controller.js
│   │
│   ├── channels/                    # ActionCable (future)
│   │   └── application_cable/
│   │
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── base_controller.rb
│   │   │   ├── concerns/
│   │   │   │   ├── api_authenticatable.rb
│   │   │   │   ├── api_responsable.rb
│   │   │   │   └── api_error_handler.rb
│   │   │   └── v1/
│   │   │       ├── base_controller.rb
│   │   │       ├── authentication_controller.rb
│   │   │       ├── habits_controller.rb
│   │   │       ├── goals_controller.rb
│   │   │       ├── entries_controller.rb
│   │   │       ├── categories_controller.rb
│   │   │       ├── dashboard_controller.rb
│   │   │       └── reports_controller.rb
│   │   │
│   │   ├── concerns/
│   │   │   ├── authenticatable.rb
│   │   │   └── api_responsable.rb
│   │   │
│   │   ├── application_controller.rb
│   │   ├── dashboard_controller.rb
│   │   ├── habits_controller.rb
│   │   ├── goals_controller.rb
│   │   ├── categories_controller.rb
│   │   ├── daily_entries_controller.rb
│   │   ├── reports_controller.rb
│   │   └── users_controller.rb
│   │
│   ├── forms/                       # Form Objects
│   │   ├── habit_form.rb
│   │   ├── goal_form.rb
│   │   ├── goal_metric_form.rb
│   │   ├── daily_entry_form.rb
│   │   ├── habit_entry_form.rb
│   │   ├── goal_entry_form.rb
│   │   ├── category_form.rb
│   │   └── bulk_entry_form.rb
│   │
│   ├── helpers/
│   │   ├── application_helper.rb
│   │   ├── habits_helper.rb
│   │   ├── goals_helper.rb
│   │   └── dashboard_helper.rb
│   │
│   ├── jobs/                        # Background Jobs
│   │   ├── application_job.rb
│   │   ├── streak_calculation_job.rb
│   │   ├── goal_metric_update_job.rb
│   │   ├── reminder_job.rb
│   │   ├── deadline_check_job.rb
│   │   ├── report_generation_job.rb
│   │   └── cache_warmup_job.rb
│   │
│   ├── mailers/
│   │   ├── application_mailer.rb
│   │   ├── user_mailer.rb
│   │   ├── reminder_mailer.rb
│   │   └── report_mailer.rb
│   │
│   ├── models/
│   │   ├── concerns/
│   │   │   ├── trackable.rb         # Shared tracking logic
│   │   │   └── streakable.rb        # Streak calculations
│   │   │
│   │   ├── application_record.rb
│   │   ├── user.rb
│   │   ├── category.rb
│   │   ├── habit.rb
│   │   ├── goal.rb
│   │   ├── goal_metric.rb
│   │   ├── daily_entry.rb
│   │   ├── habit_entry.rb
│   │   └── goal_entry.rb
│   │
│   ├── policies/                    # Pundit Policies
│   │   ├── application_policy.rb
│   │   ├── habit_policy.rb
│   │   ├── goal_policy.rb
│   │   ├── category_policy.rb
│   │   ├── daily_entry_policy.rb
│   │   └── user_policy.rb
│   │
│   ├── presenters/                  # Presenter Objects
│   │   ├── habit_presenter.rb
│   │   ├── goal_presenter.rb
│   │   ├── dashboard_presenter.rb
│   │   └── report_presenter.rb
│   │
│   ├── queries/                     # Query Objects
│   │   ├── habit_query.rb
│   │   ├── goal_query.rb
│   │   ├── daily_entry_query.rb
│   │   ├── dashboard_query.rb
│   │   └── report_query.rb
│   │
│   ├── serializers/                 # API Serializers (optional)
│   │   └── api/
│   │       └── v1/
│   │           ├── habit_serializer.rb
│   │           ├── goal_serializer.rb
│   │           └── daily_entry_serializer.rb
│   │
│   ├── services/                    # Service Objects
│   │   ├── base_service.rb
│   │   │
│   │   ├── habits/
│   │   │   ├── create_service.rb
│   │   │   ├── update_service.rb
│   │   │   ├── delete_service.rb
│   │   │   ├── archive_service.rb
│   │   │   └── calculate_streak_service.rb
│   │   │
│   │   ├── goals/
│   │   │   ├── create_service.rb
│   │   │   ├── update_service.rb
│   │   │   ├── delete_service.rb
│   │   │   ├── calculate_progress_service.rb
│   │   │   ├── check_completion_service.rb
│   │   │   └── update_metric_service.rb
│   │   │
│   │   ├── entries/
│   │   │   ├── create_daily_entry_service.rb
│   │   │   ├── create_habit_entry_service.rb
│   │   │   ├── create_goal_entry_service.rb
│   │   │   ├── bulk_create_service.rb
│   │   │   └── update_entry_service.rb
│   │   │
│   │   ├── reports/
│   │   │   ├── generate_weekly_report_service.rb
│   │   │   ├── generate_monthly_report_service.rb
│   │   │   ├── generate_quarterly_report_service.rb
│   │   │   └── export_report_service.rb
│   │   │
│   │   ├── notifications/
│   │   │   ├── send_reminder_service.rb
│   │   │   ├── check_deadlines_service.rb
│   │   │   └── send_daily_digest_service.rb
│   │   │
│   │   └── analytics/
│   │       ├── calculate_heatmap_data_service.rb
│   │       ├── calculate_stats_service.rb
│   │       └── generate_insights_service.rb
│   │
│   └── views/
│       ├── api/
│       │   └── v1/
│       │       ├── habits/
│       │       │   └── [jbuilder templates]
│       │       └── goals/
│       │           └── [jbuilder templates]
│       │
│       ├── components/              # ViewComponent (optional)
│       │   ├── habit_card.html.erb
│       │   ├── goal_card.html.erb
│       │   └── heatmap.html.erb
│       │
│       ├── dashboard/
│       │   └── index.html.erb
│       │
│       ├── habits/
│       │   ├── index.html.erb
│       │   ├── show.html.erb
│       │   ├── new.html.erb
│       │   ├── edit.html.erb
│       │   └── _form.html.erb
│       │
│       ├── goals/
│       │   ├── index.html.erb
│       │   ├── show.html.erb
│       │   ├── new.html.erb
│       │   ├── edit.html.erb
│       │   └── _form.html.erb
│       │
│       ├── categories/
│       │   ├── index.html.erb
│       │   ├── new.html.erb
│       │   ├── edit.html.erb
│       │   └── _form.html.erb
│       │
│       ├── daily_entries/
│       │   ├── show.html.erb
│       │   ├── new.html.erb
│       │   └── _form.html.erb
│       │
│       ├── reports/
│       │   ├── index.html.erb
│       │   └── show.html.erb
│       │
│       ├── users/
│       │   ├── show.html.erb
│       │   └── edit.html.erb
│       │
│       ├── layouts/
│       │   ├── application.html.erb
│       │   ├── mailer.html.erb
│       │   ├── mailer.text.erb
│       │   └── api.html.erb
│       │
│       └── shared/
│           ├── _navbar.html.erb
│           ├── _flash_messages.html.erb
│           ├── _pagination.html.erb
│           └── _heatmap.html.erb
│
├── bin/
│   ├── rails
│   ├── rake
│   └── setup
│
├── config/
│   ├── initializers/
│   │   ├── assets.rb
│   │   ├── bullet.rb
│   │   ├── cors.rb
│   │   ├── devise.rb
│   │   ├── pundit.rb
│   │   ├── sidekiq.rb
│   │   └── ...
│   │
│   ├── locales/
│   │   ├── en.yml
│   │   └── pl.yml (optional)
│   │
│   ├── puma.rb
│   ├── routes.rb
│   ├── database.yml
│   ├── application.rb
│   ├── environments/
│   │   ├── development.rb
│   │   ├── production.rb
│   │   └── test.rb
│   └── schedule.rb                  # sidekiq-cron
│
├── db/
│   ├── migrate/
│   │   ├── YYYYMMDDHHMMSS_devise_create_users.rb
│   │   ├── YYYYMMDDHHMMSS_create_categories.rb
│   │   ├── YYYYMMDDHHMMSS_create_habits.rb
│   │   ├── YYYYMMDDHHMMSS_create_goals.rb
│   │   ├── YYYYMMDDHHMMSS_create_goal_metrics.rb
│   │   ├── YYYYMMDDHHMMSS_create_daily_entries.rb
│   │   ├── YYYYMMDDHHMMSS_create_habit_entries.rb
│   │   └── YYYYMMDDHHMMSS_create_goal_entries.rb
│   │
│   ├── schema.rb
│   └── seeds.rb
│
├── lib/
│   ├── services/                    # Shared/reusable services
│   │   └── ...
│   │
│   ├── modules/                     # Shared modules
│   │   └── ...
│   │
│   ├── utils/                       # Utilities
│   │   └── ...
│   │
│   ├── errors/                      # Custom error classes
│   │   ├── application_error.rb
│   │   ├── validation_error.rb
│   │   └── authorization_error.rb
│   │
│   └── tasks/
│       └── auto_annotate_models.rake
│
├── log/
│   └── [log files]
│
├── node_modules/                    # Node dependencies (Tailwind, etc.)
│
├── public/
│   └── assets/
│
├── spec/
│   ├── factories/
│   │   ├── users.rb
│   │   ├── categories.rb
│   │   ├── habits.rb
│   │   ├── goals.rb
│   │   ├── goal_metrics.rb
│   │   ├── daily_entries.rb
│   │   ├── habit_entries.rb
│   │   └── goal_entries.rb
│   │
│   ├── features/                    # Capybara integration tests
│   │   ├── user_signs_up_spec.rb
│   │   ├── user_creates_habit_spec.rb
│   │   ├── user_logs_entry_spec.rb
│   │   └── dashboard_displays_data_spec.rb
│   │
│   ├── jobs/
│   │   ├── streak_calculation_job_spec.rb
│   │   ├── reminder_job_spec.rb
│   │   └── report_generation_job_spec.rb
│   │
│   ├── mailers/
│   │   ├── user_mailer_spec.rb
│   │   └── reminder_mailer_spec.rb
│   │
│   ├── models/
│   │   ├── user_spec.rb
│   │   ├── habit_spec.rb
│   │   ├── goal_spec.rb
│   │   ├── category_spec.rb
│   │   ├── daily_entry_spec.rb
│   │   ├── habit_entry_spec.rb
│   │   └── goal_entry_spec.rb
│   │
│   ├── policies/
│   │   ├── habit_policy_spec.rb
│   │   ├── goal_policy_spec.rb
│   │   └── category_policy_spec.rb
│   │
│   ├── requests/                    # Request specs (API)
│   │   └── api/
│   │       └── v1/
│   │           ├── habits_spec.rb
│   │           ├── goals_spec.rb
│   │           └── entries_spec.rb
│   │
│   ├── services/
│   │   ├── habits/
│   │   │   ├── create_service_spec.rb
│   │   │   └── calculate_streak_service_spec.rb
│   │   ├── goals/
│   │   │   └── create_service_spec.rb
│   │   └── entries/
│   │       └── create_daily_entry_service_spec.rb
│   │
│   ├── forms/
│   │   ├── habit_form_spec.rb
│   │   └── goal_form_spec.rb
│   │
│   ├── queries/
│   │   ├── habit_query_spec.rb
│   │   └── dashboard_query_spec.rb
│   │
│   ├── presenters/
│   │   └── dashboard_presenter_spec.rb
│   │
│   ├── controllers/
│   │   ├── habits_controller_spec.rb
│   │   ├── goals_controller_spec.rb
│   │   └── dashboard_controller_spec.rb
│   │
│   ├── support/
│   │   ├── database_cleaner.rb
│   │   ├── factory_bot.rb
│   │   ├── capybara.rb
│   │   ├── shoulda_matchers.rb
│   │   ├── api_helpers.rb
│   │   └── authentication_helpers.rb
│   │
│   ├── rails_helper.rb
│   └── spec_helper.rb
│
├── storage/                         # ActiveStorage (if used)
│
├── tmp/
│   └── [temporary files]
│
├── vendor/
│
├── .env                             # Environment variables (not committed)
├── .env.example                     # Example env file (committed)
├── .gitignore
├── .rubocop.yml
├── .rspec
├── config.ru
├── Gemfile
├── Gemfile.lock
├── README.md
├── Rakefile
├── tailwind.config.js
└── package.json
```

---

## Directory Descriptions

### `app/services/`
**Purpose:** Service Objects - orchestration and business logic

**Organization:**
- `base_service.rb` - Abstract base class for all services
- Domain subdirectories (`habits/`, `goals/`, `entries/`) group related services
- Each service handles one specific operation

**Naming Convention:**
- `[Domain]::[Action]Service` (e.g., `Habits::CreateService`)
- Inherit from `Services::BaseService`

**Example:**
```ruby
app/services/habits/create_service.rb
app/services/habits/update_service.rb
app/services/goals/calculate_progress_service.rb
```

---

### `app/forms/`
**Purpose:** Form Objects - encapsulate form validation and persistence

**Organization:**
- One form object per model/form
- Inherit from `ActiveModel::Model`
- Handle validations and save operations

**Naming Convention:**
- `[Model]Form` (e.g., `HabitForm`, `GoalForm`)

**Example:**
```ruby
app/forms/habit_form.rb
app/forms/goal_form.rb
app/forms/daily_entry_form.rb
```

---

### `app/queries/`
**Purpose:** Query Objects - encapsulate complex database queries

**Organization:**
- One query object per domain/feature
- Methods return ActiveRecord relations
- Makes queries reusable and testable

**Naming Convention:**
- `[Domain]Query` (e.g., `HabitQuery`, `DashboardQuery`)

**Example:**
```ruby
app/queries/habit_query.rb      # HabitQuery.new(user).active
app/queries/dashboard_query.rb  # DashboardQuery.new(user).heatmap_data
app/queries/report_query.rb     # ReportQuery.new(user).weekly_data
```

---

### `app/presenters/`
**Purpose:** Presenter Objects - format data for views

**Organization:**
- One presenter per view/feature
- Keep view logic out of views and models
- Format data, calculations for display

**Naming Convention:**
- `[Domain]Presenter` (e.g., `HabitPresenter`, `DashboardPresenter`)

**Example:**
```ruby
app/presenters/habit_presenter.rb
app/presenters/dashboard_presenter.rb
```

---

### `app/jobs/`
**Purpose:** Background Jobs - async processing

**Organization:**
- One job per task
- Inherit from `ApplicationJob`
- Use Sidekiq for execution

**Naming Convention:**
- `[Action]Job` (e.g., `StreakCalculationJob`, `ReminderJob`)

**Example:**
```ruby
app/jobs/streak_calculation_job.rb
app/jobs/reminder_job.rb
```

---

### `app/policies/`
**Purpose:** Pundit Policies - authorization logic

**Organization:**
- One policy per model
- Inherit from `ApplicationPolicy`
- Methods match controller actions

**Naming Convention:**
- `[Model]Policy` (e.g., `HabitPolicy`, `GoalPolicy`)

**Example:**
```ruby
app/policies/habit_policy.rb
app/policies/goal_policy.rb
```

---

### `app/controllers/api/v1/`
**Purpose:** API Controllers for future iOS app

**Organization:**
- Versioned API (`v1/`)
- Separate from web controllers
- JSON responses only

**Naming Convention:**
- `Api::V1::[Resource]Controller`

**Example:**
```ruby
app/controllers/api/v1/habits_controller.rb
app/controllers/api/v1/goals_controller.rb
```

---

### `app/controllers/concerns/`
**Purpose:** Shared controller logic

**Organization:**
- Concerns shared across controllers
- Include in controllers via `include`

**Example:**
```ruby
app/controllers/concerns/authenticatable.rb
app/controllers/concerns/api_responsable.rb
```

---

### `app/models/concerns/`
**Purpose:** Shared model logic

**Organization:**
- Concerns shared across models
- Include in models via `include`

**Example:**
```ruby
app/models/concerns/trackable.rb
app/models/concerns/streakable.rb
```

---

### `app/views/shared/`
**Purpose:** Shared partials and components

**Organization:**
- Reusable view components
- Partials used across multiple views

**Example:**
```ruby
app/views/shared/_navbar.html.erb
app/views/shared/_flash_messages.html.erb
app/views/shared/_heatmap.html.erb
```

---

### `spec/`
**Purpose:** Test files

**Organization:**
- Mirror structure of `app/`
- Feature tests in `spec/features/`
- Request specs for API in `spec/requests/`
- Support files in `spec/support/`

**Naming Convention:**
- `[file_name]_spec.rb`

**Example:**
```ruby
spec/services/habits/create_service_spec.rb
spec/features/user_creates_habit_spec.rb
spec/requests/api/v1/habits_spec.rb
```

---

### `lib/`
**Purpose:** Shared libraries and utilities

**Organization:**
- `lib/services/` - Reusable services
- `lib/modules/` - Shared modules
- `lib/utils/` - Utility classes
- `lib/errors/` - Custom error classes

**Example:**
```ruby
lib/errors/application_error.rb
lib/utils/date_helper.rb
```

---

## Naming Conventions Summary

| Type | Convention | Example |
|------|-----------|---------|
| Service Objects | `[Domain]::[Action]Service` | `Habits::CreateService` |
| Form Objects | `[Model]Form` | `HabitForm` |
| Query Objects | `[Domain]Query` | `HabitQuery` |
| Presenter Objects | `[Domain]Presenter` | `HabitPresenter` |
| Jobs | `[Action]Job` | `StreakCalculationJob` |
| Policies | `[Model]Policy` | `HabitPolicy` |
| Controllers | `[Resource]Controller` | `HabitsController` |
| API Controllers | `Api::V1::[Resource]Controller` | `Api::V1::HabitsController` |
| Models | `[Model]` | `Habit` |
| Concerns | `[Name]` | `Trackable` |

---

## File Organization Best Practices

1. **One Class Per File**: Each file should contain one class/module
2. **Logical Grouping**: Group related classes in subdirectories
3. **Consistent Naming**: Follow Rails conventions
4. **Clear Responsibilities**: Each class has one clear purpose
5. **Test Coverage**: Mirror test structure to app structure

---

## Usage Examples

### Service Object
```ruby
# app/services/habits/create_service.rb
module Habits
  class CreateService < Services::BaseService
    # ...
  end
end

# Usage in controller
service = Habits::CreateService.new(current_user, params)
result = service.call
```

### Query Object
```ruby
# app/queries/habit_query.rb
class HabitQuery
  def initialize(user)
    @user = user
  end
  
  def active
    @user.habits.where(is_active: true)
  end
end

# Usage in controller
@habits = HabitQuery.new(current_user).active
```

### Form Object
```ruby
# app/forms/habit_form.rb
class HabitForm
  include ActiveModel::Model
  # ...
end

# Usage in controller
form = HabitForm.new(current_user, params)
if form.valid?
  form.save
end
```

---

This structure supports:
✅ Clean architecture
✅ Separation of concerns
✅ Testability
✅ Scalability
✅ Maintainability

