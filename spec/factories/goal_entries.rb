FactoryBot.define do
  factory :goal_entry do
    association :goal
    association :daily_entry
    value { 1.0 }
    boolean_value { nil }
    is_increment { true }
    notes { nil }

    trait :boolean_type do
      value { nil }
      boolean_value { true }
    end

    trait :decrement do
      is_increment { false }
    end
  end
end
