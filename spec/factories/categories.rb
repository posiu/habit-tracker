FactoryBot.define do
  factory :category do
    user
    name { Faker::Lorem.unique.word }
    description { Faker::Lorem.sentence }
    color { "##{SecureRandom.hex(3).upcase}" }
    icon { %w[💪 🏃 📚 🎯 ❤️ 🧠].sample }
    position { 1 }
    is_active { true }

    trait :inactive do
      is_active { false }
    end

    trait :with_color do
      color { '#FF0000' }
    end
  end
end
