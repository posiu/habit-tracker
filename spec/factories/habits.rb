FactoryBot.define do
  factory :habit do
    user
    name { Faker::Lorem.unique.word }
    description { Faker::Lorem.sentence }
    category { nil }
    habit_type { 'boolean' }
    target_value { nil }
    unit { nil }
    start_date { Date.current }
    end_date { nil }
    reminder_enabled { false }
    reminder_time { nil }
    reminder_days { [] }
    is_active { true }

    trait :numeric do
      habit_type { 'numeric' }
      target_value { 30 }
      unit { 'minutes' }
    end

    trait :with_category do
      association :category, factory: :category
    end

    trait :inactive do
      is_active { false }
      end_date { Date.current }
    end
  end
end
