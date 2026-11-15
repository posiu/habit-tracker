FactoryBot.define do
  factory :habit_entry do
    association :habit
    association :daily_entry
    boolean_value { true }
    numeric_value { nil }
    time_value { nil }
    notes { nil }

    trait :numeric do
      association :habit, factory: %i[habit numeric]
      boolean_value { nil }
      numeric_value { 5.0 }
    end

    trait :time_based do
      association :habit, factory: :habit, habit_type: 'time'
      boolean_value { nil }
      time_value { 3600 } # 1 hour in seconds
    end

    trait :incomplete do
      boolean_value { false }
    end
  end
end
