FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    first_name { "John" }
    last_name { "Doe" }
    time_zone { "UTC" }
    locale { "en" }
    email_notifications_enabled { true }
    
    trait :with_reminder do
      reminder_time { "09:00" }
    end
    
    trait :notifications_disabled do
      email_notifications_enabled { false }
    end
  end
end