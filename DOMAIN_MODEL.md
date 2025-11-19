# Domain Model - Habit Tracker Application

## 1. Entities Overview

### Core Entities:
1. **User** - Użytkownik systemu
2. **Category** - Kategorie nawyków i celów
3. **Habit** - Nawyki użytkownika
4. **Goal** - Cele użytkownika
5. **GoalMetric** - Metryki celów (wskaźniki sukcesu)
6. **DailyEntry** - Główny dzienny wpis
7. **HabitEntry** - Wpisy dla nawyków w danym dniu
8. **GoalEntry** - Wpisy dla celów w danym dniu

---

## 2. Detailed Entity Specifications

### 2.1 User

**Purpose:** Użytkownik aplikacji

**Fields:**
- `id` (bigint, primary key)
- `email` (string, 255, unique, indexed)
- `encrypted_password` (string, 255)
- `first_name` (string, 100)
- `last_name` (string, 100)
- `time_zone` (string, 50, default: 'UTC')
- `locale` (string, 10, default: 'en')
- `email_notifications_enabled` (boolean, default: true)
- `reminder_time` (time) - Godzina przypomnień
- `reset_password_token` (string, indexed)
- `reset_password_sent_at` (datetime)
- `remember_created_at` (datetime)
- `sign_in_count` (integer, default: 0)
- `current_sign_in_at` (datetime)
- `last_sign_in_at` (datetime)
- `current_sign_in_ip` (string)
- `last_sign_in_ip` (string)
- `created_at` (datetime, indexed)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `reset_password_token`
- Index on `created_at` (for analytics/reporting)

---

### 2.2 Category

**Purpose:** Kategorie dla nawyków i celów

**Fields:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key, indexed)
- `name` (string, 100, indexed)
- `color` (string, 7) - Hex color code (e.g., '#FF5733')
- `icon` (string, 50) - Icon identifier/class name
- `description` (text)
- `position` (integer) - For custom sorting
- `created_at` (datetime)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `user_id, name` (composite, for unique constraint)
- Index on `position` (for sorting)

**Relationships:**
- belongs_to :user
- has_many :habits
- has_many :goals

**Constraints:**
- Unique constraint on `user_id, name` (user can't have duplicate category names)

---

### 2.3 Habit

**Purpose:** Nawyki użytkownika do śledzenia

**Fields:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key, indexed)
- `category_id` (bigint, foreign key, indexed, nullable)
- `name` (string, 200, indexed)
- `description` (text)
- `habit_type` (string, 50, default: 'boolean') - 'boolean', 'numeric', 'time', 'count'
- `unit` (string, 50, nullable) - Unit of measurement (e.g., 'minutes', 'pages', 'glasses')
- `target_value` (decimal, 10, 2, nullable) - Target value for numeric habits
- `is_active` (boolean, default: true, indexed)
- `start_date` (date, indexed) - When habit tracking started
- `end_date` (date, nullable, indexed) - When habit tracking ended (for archived habits)
- `reminder_enabled` (boolean, default: false)
- `reminder_days` (integer[], default: []) - Days of week (0=Sunday, 6=Saturday)
- `position` (integer) - For custom ordering
- `created_at` (datetime, indexed)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Foreign key index on `category_id`
- Index on `user_id, is_active` (composite, for filtering active habits)
- Index on `user_id, start_date` (composite, for date range queries)
- Index on `created_at` (for analytics)

**Relationships:**
- belongs_to :user
- belongs_to :category (optional)
- has_many :habit_entries

**Constraints:**
- Check constraint: `end_date IS NULL OR end_date >= start_date`

---

### 2.4 Goal

**Purpose:** Cele użytkownika ze wskaźnikami sukcesu

**Fields:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key, indexed)
- `category_id` (bigint, foreign key, indexed, nullable)
- `name` (string, 200, indexed)
- `description` (text)
- `goal_type` (string, 50, default: 'value') - 'days_doing', 'days_without', 'target_value', 'target_date', 'custom'
- `unit` (string, 50, nullable) - Unit of measurement
- `start_date` (date, indexed) - When goal tracking started
- `target_date` (date, nullable, indexed) - Deadline for goal
- `is_active` (boolean, default: true, indexed)
- `completed_at` (datetime, nullable, indexed)
- `position` (integer) - For custom ordering
- `created_at` (datetime, indexed)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Foreign key index on `category_id`
- Index on `user_id, is_active` (composite)
- Index on `user_id, target_date` (composite, for deadline queries)
- Index on `user_id, completed_at` (composite, for completion queries)
- Index on `created_at` (for analytics)

**Relationships:**
- belongs_to :user
- belongs_to :category (optional)
- has_one :goal_metric
- has_many :goal_entries

**Constraints:**
- Check constraint: `target_date IS NULL OR target_date >= start_date`

---

### 2.5 GoalMetric

**Purpose:** Szczegółowe metryki i wskaźniki sukcesu dla celów

**Fields:**
- `id` (bigint, primary key)
- `goal_id` (bigint, foreign key, indexed, unique)
- `days_doing_target` (integer, nullable) - Target number of days doing something
- `days_without_target` (integer, nullable) - Target number of days without something
- `target_value` (decimal, 12, 4, nullable) - Target value (e.g., weight, time)
- `target_date` (date, nullable) - Target date for completion
- `current_value` (decimal, 12, 4, default: 0) - Current accumulated value
- `current_days_doing` (integer, default: 0) - Current count of days doing
- `current_days_without` (integer, default: 0) - Current count of days without
- `created_at` (datetime)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Unique foreign key index on `goal_id` (one-to-one relationship)
- Index on `target_date` (for deadline reminders)

**Relationships:**
- belongs_to :goal

**Notes:**
- Only one metric type should be set per goal (based on goal.goal_type)
- Denormalized fields (current_*) are updated via background jobs for performance

---

### 2.6 DailyEntry

**Purpose:** Główny dzienny wpis użytkownika (facade pattern for aggregation)

**Fields:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key, indexed)
- `entry_date` (date, indexed)
- `notes` (text, nullable)
- `mood` (integer, nullable) - 1-5 scale (optional feature)
- `created_at` (datetime)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- **Unique composite index on `user_id, entry_date`** (critical for performance)
- Index on `entry_date` (for date range queries)
- Index on `user_id, entry_date` DESC (for recent entries queries)

**Relationships:**
- belongs_to :user
- has_many :habit_entries
- has_many :goal_entries

**Constraints:**
- Unique constraint on `user_id, entry_date` (one entry per user per day)

**Performance Notes:**
- This table enables fast queries like "all entries for user in date range"
- Used for heatmap generation (grouping by date)

---

### 2.7 HabitEntry

**Purpose:** Wartości nawyków dla konkretnego dnia

**Fields:**
- `id` (bigint, primary key)
- `daily_entry_id` (bigint, foreign key, indexed)
- `habit_id` (bigint, foreign key, indexed)
- `boolean_value` (boolean, nullable) - For boolean habits
- `numeric_value` (decimal, 12, 4, nullable) - For numeric/time/count habits
- `time_value` (integer, nullable) - Time in seconds (for time-based habits)
- `completed` (boolean, default: false, indexed) - Quick check if habit was done
- `notes` (text, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `daily_entry_id`
- Foreign key index on `habit_id`
- **Unique composite index on `daily_entry_id, habit_id`** (one entry per habit per day)
- Index on `habit_id, completed` (composite, for streak calculations)
- Index on `daily_entry_id, completed` (composite, for daily completion stats)
- Index on `habit_id, created_at` (for trend analysis)

**Relationships:**
- belongs_to :daily_entry
- belongs_to :habit

**Constraints:**
- Unique constraint on `daily_entry_id, habit_id`
- Check constraint: at least one value field must be set

**Performance Notes:**
- `completed` field is denormalized for fast streak calculations
- Separate value fields for different types enable type-specific aggregations

---

### 2.8 GoalEntry

**Purpose:** Wartości celów dla konkretnego dnia

**Fields:**
- `id` (bigint, primary key)
- `daily_entry_id` (bigint, foreign key, indexed)
- `goal_id` (bigint, foreign key, indexed)
- `value` (decimal, 12, 4, nullable) - Progress value for the day
- `boolean_value` (boolean, nullable) - For boolean goals (did/didn't do)
- `is_increment` (boolean, default: true) - Whether this adds to or subtracts from progress
- `notes` (text, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

**Indexes:**
- Primary key on `id`
- Foreign key index on `daily_entry_id`
- Foreign key index on `goal_id`
- **Unique composite index on `daily_entry_id, goal_id`** (one entry per goal per day)
- Index on `goal_id, created_at` (for trend analysis and progress calculation)
- Index on `daily_entry_id, goal_id, boolean_value` (composite, for days_doing/days_without calculations)

**Relationships:**
- belongs_to :daily_entry
- belongs_to :goal

**Constraints:**
- Unique constraint on `daily_entry_id, goal_id`

---

## 3. Entity Relationships Diagram

```
User (1) ────< (N) Habit
User (1) ────< (N) Goal
User (1) ────< (N) Category
User (1) ────< (N) DailyEntry

Category (1) ────< (N) Habit
Category (1) ────< (N) Goal

Habit (1) ────< (N) HabitEntry
Goal (1) ────< (N) GoalEntry
Goal (1) ────< (1) GoalMetric

DailyEntry (1) ────< (N) HabitEntry
DailyEntry (1) ────< (N) GoalEntry
```

**Cardinalities:**
- User → Habit: 1:N
- User → Goal: 1:N
- User → Category: 1:N
- User → DailyEntry: 1:N
- Category → Habit: 1:N (optional)
- Category → Goal: 1:N (optional)
- Habit → HabitEntry: 1:N
- Goal → GoalEntry: 1:N
- Goal → GoalMetric: 1:1
- DailyEntry → HabitEntry: 1:N
- DailyEntry → GoalEntry: 1:N

---

## 4. Indexes Summary

### Critical Performance Indexes:

1. **DailyEntry:**
   - `(user_id, entry_date)` - UNIQUE - Critical for heatmap queries
   - `entry_date` - For date range filtering
   - `(user_id, entry_date DESC)` - For recent entries

2. **HabitEntry:**
   - `(daily_entry_id, habit_id)` - UNIQUE - Prevents duplicates
   - `(habit_id, completed)` - For streak calculations
   - `(habit_id, created_at)` - For trend analysis

3. **GoalEntry:**
   - `(daily_entry_id, goal_id)` - UNIQUE - Prevents duplicates
   - `(goal_id, created_at)` - For progress tracking

4. **Habit:**
   - `(user_id, is_active)` - For filtering active habits
   - `(user_id, start_date)` - For date range queries

5. **Goal:**
   - `(user_id, target_date)` - For deadline reminders
   - `(user_id, is_active)` - For filtering active goals

6. **User:**
   - `email` - UNIQUE - Authentication
   - `created_at` - For analytics

---

## 5. Performance Optimization Strategies

### 5.1 For Date Range Queries (Heatmap, Reports)

- **Materialized Views** (PostgreSQL):
  - Daily summary view: `user_id, entry_date, habits_completed, goals_progressed`
  - Monthly summary view: `user_id, year, month, total_completed`

- **Partial Indexes:**
  - Active habits only: `CREATE INDEX idx_habits_active ON habits(user_id) WHERE is_active = true`
  - Recent entries: `CREATE INDEX idx_daily_entries_recent ON daily_entries(user_id, entry_date DESC) WHERE entry_date >= CURRENT_DATE - INTERVAL '365 days'`

### 5.2 For Streak Calculations

- **Denormalized Fields:**
  - `HabitEntry.completed` - Quick boolean check
  - `GoalMetric.current_days_doing` - Cached counter
  - `GoalMetric.current_days_without` - Cached counter

- **Background Jobs:**
  - Daily job to update streak counters
  - Update GoalMetric current values nightly

### 5.3 For Aggregation Queries

- **Database Functions:**
  - PostgreSQL functions for streak calculations
  - Window functions for trend analysis

- **Caching Strategy:**
  - Cache dashboard data (Rails.cache)
  - Invalidate on new entry creation
  - Cache TTL: 1 hour for dashboard, 24 hours for historical reports

### 5.4 Query Patterns

**Heatmap Data:**
```sql
SELECT entry_date, COUNT(he.id) as completed_count
FROM daily_entries de
LEFT JOIN habit_entries he ON he.daily_entry_id = de.id AND he.completed = true
WHERE de.user_id = ? AND de.entry_date BETWEEN ? AND ?
GROUP BY de.entry_date
ORDER BY de.entry_date;
```

**Streak Calculation:**
```sql
-- Using window functions for efficient streak calculation
WITH daily_activity AS (
  SELECT entry_date, COUNT(*) as activity_count
  FROM habit_entries he
  JOIN daily_entries de ON de.id = he.daily_entry_id
  WHERE he.habit_id = ? AND he.completed = true
  GROUP BY entry_date
)
SELECT MAX(streak) as current_streak
FROM (
  SELECT entry_date,
         SUM(CASE WHEN activity_count > 0 THEN 1 ELSE 0 END)
           OVER (ORDER BY entry_date ROWS UNBOUNDED PRECEDING) as streak
  FROM daily_activity
) streaks;
```

---

## 6. Extensibility Considerations

### 6.1 Future Enhancements

- **Tags System:** Many-to-many relationship with habits/goals
- **Reminders:** Separate `Reminder` model with polymorphic association
- **Collaboration:** Share habits/goals with other users
- **Habit Templates:** Pre-defined habit templates
- **Integrations:** Third-party API connections (Fitbit, Apple Health)

### 6.2 Flexible Schema Additions

- **Habit.custom_fields** (JSONB) - For custom metadata
- **Goal.custom_fields** (JSONB) - For custom goal parameters
- **DailyEntry.metadata** (JSONB) - For extensible entry data

### 6.3 Partitioning Strategy (Future)

For high-volume users, consider partitioning:
- `DailyEntry` by year/month
- `HabitEntry` and `GoalEntry` by date range

---

## 7. Data Integrity Rules

1. **Cascading Deletes:**
   - User deleted → delete all related records
   - Category deleted → set category_id to NULL (habits/goals remain)
   - Habit/Goal deleted → delete all related entries
   - DailyEntry deleted → delete all habit_entries and goal_entries

2. **Date Constraints:**
   - `entry_date` cannot be future date (with configurable limit)
   - `start_date <= end_date` for habits
   - `start_date <= target_date` for goals

3. **Value Constraints:**
   - Numeric values must be >= 0 (except for specific cases)
   - Boolean habits require boolean_value to be set
   - Numeric habits require numeric_value or time_value to be set

---

## 8. Audit & Soft Deletes

**Consideration:** Add `deleted_at` (datetime) to critical tables:
- `Habit` - Soft delete to preserve history
- `Goal` - Soft delete to preserve history
- `DailyEntry` - Hard delete (or archive)

This allows data recovery and historical analysis even after "deletion".

