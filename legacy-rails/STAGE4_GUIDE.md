# Stage 4 Developer Guide: Daily Entries & Dashboard

## Quick Start

### View Daily Entry
```ruby
# In controller or view
@daily_entry = current_user.daily_entries.find(params[:id])

# Or create/find for today
@daily_entry = DailyEntry.for_user_and_date(current_user, Date.current)
```

### Create Daily Entry
```ruby
service = Entries::CreateDailyEntryService.new(
  user: current_user,
  params: { entry_date: Date.current, mood: 4, notes: "Great day!" }
)

result = service.call
if result.success?
  daily_entry = result.data
else
  errors = result.error_messages
end
```

### Add Habit Entry
```ruby
habit = current_user.habits.find(params[:habit_id])
daily_entry = current_user.daily_entries.find(params[:daily_entry_id])

service = Entries::CreateHabitEntryService.new(
  daily_entry: daily_entry,
  habit: habit,
  params: { value: 25, completed: true, notes: "Optional notes" }
)

result = service.call
```

### Add Goal Entry
```ruby
goal = current_user.goals.find(params[:goal_id])
daily_entry = current_user.daily_entries.find(params[:daily_entry_id])

service = Entries::CreateGoalEntryService.new(
  daily_entry: daily_entry,
  goal: goal,
  params: { value: 5.5, boolean_value: true, is_increment: true }
)

result = service.call
```

---

## API Endpoints

### Daily Entries
```
GET  /daily_entries           # List all user's entries
GET  /daily_entries/:id       # View single entry
GET  /daily_entries/new       # New entry form
POST /daily_entries           # Create entry
GET  /daily_entries/:id/edit  # Edit form
PATCH/PUT /daily_entries/:id  # Update entry
DELETE /daily_entries/:id     # Delete entry
```

### Habit Entries (nested under daily_entries)
```
POST /daily_entries/:daily_entry_id/habit_entries            # Create
PATCH /daily_entries/:daily_entry_id/habit_entries/:id       # Update
DELETE /daily_entries/:daily_entry_id/habit_entries/:id      # Delete

# Also available at top level:
POST /habit_entries            # Create
PATCH /habit_entries/:id       # Update
DELETE /habit_entries/:id      # Delete
```

### Goal Entries (nested under daily_entries)
```
POST /daily_entries/:daily_entry_id/goal_entries             # Create
PATCH /daily_entries/:daily_entry_id/goal_entries/:id        # Update
DELETE /daily_entries/:daily_entry_id/goal_entries/:id       # Delete

# Also available at top level:
POST /goal_entries             # Create
PATCH /goal_entries/:id        # Update
DELETE /goal_entries/:id       # Delete
```

### Dashboard
```
GET  /                         # Dashboard (home, after sign_in)
```

---

## Form Objects Usage

### DailyEntryForm
```ruby
form = DailyEntryForm.new(daily_entry, user: current_user, attributes: params)

if form.valid?
  form.save  # Updates or creates daily_entry
else
  form.errors  # ActiveModel::Errors object
end
```

**Attributes:**
- `entry_date` - Date (required, not in future, unique per user per date)
- `mood` - Integer 1-5 (optional)
- `notes` - String max 1000 chars (optional)

### HabitEntryForm
```ruby
form = HabitEntryForm.new(habit_entry, habit: habit, daily_entry: daily_entry, attributes: params)

if form.valid?
  form.save
else
  form.errors
end
```

**Attributes by Habit Type:**
- **boolean** → `completed` boolean
- **numeric** → `value` decimal > 0
- **time** → `time_value` integer (seconds) > 0
- **count** → `value` decimal > 0

### GoalEntryForm
```ruby
form = GoalEntryForm.new(goal_entry, goal: goal, daily_entry: daily_entry, attributes: params)

if form.valid?
  form.save
else
  form.errors
end
```

**Attributes by Goal Type:**
- **days_doing/days_without** → `boolean_value` boolean
- **target_value** → `value` decimal > 0, `is_increment` boolean
- Others → similar to target_value

---

## Query Objects

### DailyEntryQuery
```ruby
query = DailyEntryQuery.new(current_user)

# All user's entries ordered by date desc
query.all

# Entries for specific date
query.for_date(Date.current)

# Entries in date range
query.for_date_range(1.month.ago.to_date, Date.current)

# Last 30 entries
query.recent(30)

# Only entries with mood recorded
query.with_mood

# Heatmap data for past year
data = query.for_heatmap_data(1.year.ago.to_date, Date.current)
# Returns: [[date1, completed_count, mood], [date2, ...], ...]
```

---

## Authorization (Pundit)

### In Views
```erb
<% if policy(daily_entry).show? %>
  <!-- show entry -->
<% end %>

<% policy_scope(DailyEntry).each do |entry| %>
  <!-- only user's entries -->
<% end %>
```

### In Controllers
```ruby
authorize @daily_entry         # Raises error if unauthorized
@daily_entries = policy_scope(DailyEntry)  # Already scoped to user
```

### Policies
- **DailyEntryPolicy** - `show?`, `create?`, `update?`, `destroy?`
- **HabitEntryPolicy** - `create?`, `update?`, `destroy?`
- **GoalEntryPolicy** - `create?`, `update?`, `destroy?`

All require user to be owner of the entry (via daily_entry).

---

## Dashboard Features

### Statistics Available
```ruby
# In DashboardController or view
@habits_count        # Active habits for user
@goals_count         # Active goals for user
@categories_count    # Categories for user
@current_streak      # Highest streak among habits
@total_entries       # Lifetime entries count
@this_month_entries  # Entries created this calendar month
@today_entry         # Today's daily entry (if exists)
@recent_entries      # Last 5 entries
@heatmap_data        # Heatmap data for past year
```

### Heatmap Data Structure
```ruby
[
  { date: "2025-11-27", count: 3, level: 1, percentage: 75.0, mood: 4, mood_emoji: "😊" },
  { date: "2025-11-26", count: 5, level: 2, percentage: 100.0, mood: 5, mood_emoji: "😄" },
  # ...
]
```

Activity levels:
- 0 = no activity
- 1 = 1-2 activities
- 2 = 3-5 activities
- 3 = 6-10 activities
- 4 = 11+ activities

---

## Frontend Integration

### Inline Habit Entry Form
```erb
<%= render 'daily_entries/habit_entry_form', 
    habit: habit, 
    habit_entry: habit_entry, 
    daily_entry: daily_entry %>
```

Shows form based on habit type:
- Boolean: checkbox "Mark as completed"
- Numeric: number input for value
- Time: number input for seconds

### Inline Goal Entry Form
```erb
<%= render 'daily_entries/goal_entry_form', 
    goal: goal, 
    goal_entry: goal_entry, 
    daily_entry: daily_entry %>
```

Shows form based on goal type:
- days_doing/days_without: checkbox "Made progress today"
- target_value: number input for value + increment/decrement toggle

### Toggle Functions
```javascript
toggleHabitForm(habitId)   // Show/hide form for habit
toggleGoalForm(goalId)     // Show/hide form for goal
```

---

## Testing

### Run All Tests
```bash
bundle exec rspec spec/

# Specific test file
bundle exec rspec spec/services/entries/create_daily_entry_service_spec.rb

# Feature tests only
bundle exec rspec spec/features/
```

### Test Data Setup
```ruby
# Create user with habits and goals
user = create(:user)
habit = create(:habit, user: user)
goal = create(:goal, user: user)

# Create daily entry with existing entries
daily_entry = create(:daily_entry, user: user)
habit_entry = create(:habit_entry, daily_entry: daily_entry, habit: habit)
goal_entry = create(:goal_entry, daily_entry: daily_entry, goal: goal)

# Sign in user in feature tests
sign_in user
```

### Writing New Tests
```ruby
# Service test
describe Entries::CreateDailyEntryService do
  it 'creates daily entry' do
    result = described_class.new(user: user, params: {...}).call
    expect(result.success?).to be true
  end
end

# Feature test
describe 'Daily Entries', type: :feature do
  it 'user can track habit' do
    sign_in user
    visit daily_entry_path(daily_entry)
    click_button 'Track'
    # ...
    expect(page).to have_text('saved')
  end
end
```

---

## Troubleshooting

### Issue: "not authorized" error
**Solution:** Check Pundit policy is allowing the action. Verify user owns the entry.

### Issue: Duplicate entry error
**Solution:** DailyEntry unique constraint per user per date. Update instead of create.

### Issue: Heatmap not showing data
**Solution:** Verify daily entries exist. Check if `Analytics::CalculateHeatmapDataService` returns data.

### Issue: Inline form not submitting
**Solution:** Check form hidden fields for `habit_id`, `goal_id`, `daily_entry_id`. Verify CSRF token.

---

## Performance Considerations

### N+1 Queries
Already optimized with:
```ruby
@user_habits = current_user.habits.active.includes(:category)
@user_goals = current_user.goals.active.includes(:category)
@habit_entries = @daily_entry.habit_entries.includes(:habit)
@goal_entries = @daily_entry.goal_entries.includes(:goal)
```

### Indexes
Database has indexes on:
- `daily_entries(user_id, entry_date)` - unique
- `habit_entries(daily_entry_id, habit_id)` - unique
- `goal_entries(daily_entry_id, goal_id)` - unique

### Caching
Heatmap data calculated once per request. Could be cached if needed:
```ruby
Rails.cache.fetch("heatmap_#{user.id}_#{date}", expires_in: 1.day) do
  Analytics::CalculateHeatmapDataService.new(user).call.data
end
```

---

## Next Steps for Developers

### Adding Features
1. Follow Service → Form → Controller pattern
2. Add Pundit policy for authorization
3. Write tests (service → feature)
4. Update views and routes

### Extending for Stage 5
- Add `StreakCalculationJob` to update habit streaks nightly
- Add `GoalMetricUpdateJob` to update progress metrics
- Implement `Reports::GenerateWeeklyReportService`
- Add email notification system

### Mobile API (Stage 6)
- Services are API-ready (no view dependencies)
- Add jbuilder templates in `app/views/api/v1/`
- Create API v1 controllers inheriting from `Api::V1::BaseController`
- Use same authorization (Pundit) in API
