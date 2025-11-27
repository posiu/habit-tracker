FactoryBot.define do
  factory :goal_metric do
    association :goal
    metric_type { 'numeric' }
    target_value { 100.0 }
    current_value { 0.0 }
    unit { 'points' }
    target_date { 1.month.from_now }

    trait :boolean_type do
      metric_type { 'boolean' }
      target_value { 1.0 }
      unit { nil }
    end

    trait :text_type do
      metric_type { 'text' }
      target_value { nil }
      unit { nil }
    end
  end
end
