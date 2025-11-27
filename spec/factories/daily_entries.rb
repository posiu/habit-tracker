FactoryBot.define do
  factory :daily_entry do
    association :user
    entry_date { Date.current }
    notes { "Sample notes for the day" }
    mood { 3 }

    trait :with_habits do
      after(:create) do |daily_entry, evaluator|
        create_list(:habit_entry, 3, daily_entry: daily_entry)
      end
    end
  end
end
