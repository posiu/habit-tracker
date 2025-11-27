FactoryBot.define do
  factory :goal do
    user
    name { Faker::Lorem.unique.sentence }
    description { Faker::Lorem.paragraph }
    category { nil }
    goal_type { 'target_value' }
    start_date { Date.current }
    target_date { nil }
    unit { nil }
    is_active { true }
    completed_at { nil }

    trait :with_deadline do
      goal_type { 'target_date' }
      target_date { 30.days.from_now }
    end

    trait :completed do
      is_active { false }
      completed_at { Time.current }
    end

    trait :with_category do
      association :category, factory: :category
    end

    after :create do |goal|
      create :goal_metric, goal: goal if goal.goal_metrics.none?
    end
  end
end
