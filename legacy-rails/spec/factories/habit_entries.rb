FactoryBot.define do
  factory :habit_entry do
    association :habit
    association :daily_entry
    completed { true }
    numeric_value { nil }
    time_value { nil }
    notes { nil }

    trait :numeric do
      completed { false }
      numeric_value { 5.0 }
    end

    trait :time_based do
      completed { false }
      time_value { 3600 } # 1 hour in seconds
    end

    trait :incomplete do
      completed { false }
      numeric_value { nil }
      time_value { nil }
    end
  end
end
