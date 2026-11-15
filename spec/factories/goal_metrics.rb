FactoryBot.define do
  factory :goal_metric do
    association :goal
    target_value { 100.0 }
    current_value { 0.0 }
    current_days_doing { 0 }
    current_days_without { 0 }
    target_date { 1.month.from_now.to_date }

    trait :days_doing do
      days_doing_target { 30 }
      target_value { nil }
    end

    trait :days_without do
      days_without_target { 30 }
      target_value { nil }
    end
  end
end
