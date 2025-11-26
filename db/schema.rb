# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2025_11_26_230001) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "categories", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 100, null: false
    t.string "color", limit: 7
    t.string "icon", limit: 50
    t.text "description"
    t.integer "position"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "is_active", default: true, null: false
    t.index ["position"], name: "index_categories_on_position"
    t.index ["user_id", "name"], name: "index_categories_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "daily_entries", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "entry_date", null: false
    t.text "notes"
    t.integer "mood"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["entry_date"], name: "index_daily_entries_on_entry_date"
    t.index ["user_id", "entry_date"], name: "index_daily_entries_on_user_id_and_entry_date", unique: true
    t.index ["user_id", "entry_date"], name: "index_daily_entries_on_user_recent", order: { entry_date: :desc }
    t.index ["user_id"], name: "index_daily_entries_on_user_id"
  end

  create_table "goal_entries", force: :cascade do |t|
    t.bigint "daily_entry_id", null: false
    t.bigint "goal_id", null: false
    t.decimal "value", precision: 12, scale: 4
    t.boolean "boolean_value"
    t.boolean "is_increment", default: true
    t.text "notes"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["daily_entry_id", "goal_id", "boolean_value"], name: "index_goal_entries_on_daily_goal_boolean"
    t.index ["daily_entry_id", "goal_id"], name: "index_goal_entries_on_daily_entry_id_and_goal_id", unique: true
    t.index ["daily_entry_id"], name: "index_goal_entries_on_daily_entry_id"
    t.index ["goal_id", "created_at"], name: "index_goal_entries_on_goal_id_and_created_at"
    t.index ["goal_id"], name: "index_goal_entries_on_goal_id"
  end

  create_table "goal_metrics", force: :cascade do |t|
    t.bigint "goal_id", null: false
    t.integer "days_doing_target"
    t.integer "days_without_target"
    t.decimal "target_value", precision: 12, scale: 4
    t.date "target_date"
    t.decimal "current_value", precision: 12, scale: 4, default: "0.0"
    t.integer "current_days_doing", default: 0
    t.integer "current_days_without", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["goal_id"], name: "index_goal_metrics_on_goal_id", unique: true
    t.index ["target_date"], name: "index_goal_metrics_on_target_date"
  end

  create_table "goals", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "category_id"
    t.string "name", limit: 200, null: false
    t.text "description"
    t.string "goal_type", limit: 50, default: "target_value"
    t.string "unit", limit: 50
    t.date "start_date", null: false
    t.date "target_date"
    t.boolean "is_active", default: true, null: false
    t.datetime "completed_at"
    t.integer "position"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["category_id"], name: "index_goals_on_category_id"
    t.index ["created_at"], name: "index_goals_on_created_at"
    t.index ["user_id", "completed_at"], name: "index_goals_on_user_id_and_completed_at"
    t.index ["user_id", "is_active"], name: "index_goals_on_user_id_and_is_active"
    t.index ["user_id", "target_date"], name: "index_goals_on_user_id_and_target_date"
    t.index ["user_id"], name: "index_goals_on_user_id"
    t.check_constraint "(target_date IS NULL) OR (target_date >= start_date)", name: "goals_target_date_after_start_date"
  end

  create_table "habit_entries", force: :cascade do |t|
    t.bigint "daily_entry_id", null: false
    t.bigint "habit_id", null: false
    t.boolean "boolean_value"
    t.decimal "numeric_value", precision: 12, scale: 4
    t.integer "time_value"
    t.boolean "completed", default: false, null: false
    t.text "notes"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["daily_entry_id", "completed"], name: "index_habit_entries_on_daily_entry_id_and_completed"
    t.index ["daily_entry_id", "habit_id"], name: "index_habit_entries_on_daily_entry_id_and_habit_id", unique: true
    t.index ["daily_entry_id"], name: "index_habit_entries_on_daily_entry_id"
    t.index ["habit_id", "completed"], name: "index_habit_entries_on_habit_id_and_completed"
    t.index ["habit_id", "created_at"], name: "index_habit_entries_on_habit_id_and_created_at"
    t.index ["habit_id"], name: "index_habit_entries_on_habit_id"
  end

  create_table "habits", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "category_id"
    t.string "name", limit: 200, null: false
    t.text "description"
    t.string "habit_type", limit: 50, default: "boolean"
    t.string "unit", limit: 50
    t.decimal "target_value", precision: 10, scale: 2
    t.boolean "is_active", default: true, null: false
    t.date "start_date", null: false
    t.date "end_date"
    t.boolean "reminder_enabled", default: false
    t.integer "reminder_days", default: [], array: true
    t.integer "position"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["category_id"], name: "index_habits_on_category_id"
    t.index ["created_at"], name: "index_habits_on_created_at"
    t.index ["user_id", "is_active"], name: "index_habits_on_user_id_and_is_active"
    t.index ["user_id", "start_date"], name: "index_habits_on_user_id_and_start_date"
    t.index ["user_id"], name: "index_habits_on_user_id"
    t.check_constraint "(end_date IS NULL) OR (end_date >= start_date)", name: "habits_end_date_after_start_date"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "first_name", limit: 100
    t.string "last_name", limit: 100
    t.string "time_zone", limit: 50, default: "UTC"
    t.string "locale", limit: 10, default: "en"
    t.boolean "email_notifications_enabled", default: true
    t.time "reminder_time"
    t.index ["created_at"], name: "index_users_on_created_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "categories", "users"
  add_foreign_key "daily_entries", "users"
  add_foreign_key "goal_entries", "daily_entries"
  add_foreign_key "goal_entries", "goals"
  add_foreign_key "goal_metrics", "goals"
  add_foreign_key "goals", "categories"
  add_foreign_key "goals", "users"
  add_foreign_key "habit_entries", "daily_entries"
  add_foreign_key "habit_entries", "habits"
  add_foreign_key "habits", "categories"
  add_foreign_key "habits", "users"
end
