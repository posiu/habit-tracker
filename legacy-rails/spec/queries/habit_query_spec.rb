require 'rails_helper'

RSpec.describe HabitQuery do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  let!(:active_habit) { create(:habit, user: user, is_active: true) }
  let!(:inactive_habit) { create(:habit, user: user, is_active: false) }
  let!(:habit_with_category) { create(:habit, user: user, is_active: true, category: category) }
  let!(:boolean_habit) { create(:habit, user: user, is_active: true, habit_type: 'boolean') }
  let!(:numeric_habit) { create(:habit, user: user, is_active: true, habit_type: 'numeric', target_value: 30) }

  describe '#active' do
    it 'returns only active habits' do
      query = described_class.new(user)
      habits = query.active
      
      expect(habits).to include(active_habit)
      expect(habits).not_to include(inactive_habit)
    end
  end

  describe '#inactive' do
    it 'returns only inactive habits' do
      query = described_class.new(user)
      habits = query.inactive
      
      expect(habits).to include(inactive_habit)
      expect(habits).not_to include(active_habit)
    end
  end

  describe '#by_category' do
    it 'returns habits for specific category' do
      query = described_class.new(user)
      habits = query.by_category(category.id)
      
      expect(habits).to include(habit_with_category)
      expect(habits).not_to include(active_habit)
    end
  end

  describe '#by_type' do
    it 'returns habits of specific type' do
      query = described_class.new(user)
      habits = query.by_type('boolean')
      
      expect(habits).to include(boolean_habit)
      expect(habits).not_to include(numeric_habit)
    end
  end

  describe '#all' do
    it 'returns all user habits' do
      query = described_class.new(user)
      habits = query.all
      
      expect(habits.count).to eq 5
    end
  end
end
