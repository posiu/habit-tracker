FactoryBot.define do
  factory :goal_entry do
    association :goal
    association :daily_entry
    numeric_value { 1.0 }
    boolean_value { nil }
    text_value { nil }

    trait :boolean_type do
      numeric_value { nil }
      boolean_value { true }
    end

    trait :text_type do
      numeric_value { nil }
      text_value { "Sample progress note" }
    end
  end
end
