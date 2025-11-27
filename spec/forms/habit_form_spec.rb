require 'rails_helper'

RSpec.describe HabitForm do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  describe 'validations' do
    it 'validates presence of name' do
      form = described_class.new(user, nil, name: '')
      expect(form.valid?).to be false
      expect(form.errors[:name]).to be_present
    end

    it 'validates presence of habit_type' do
      form = described_class.new(user, nil, habit_type: '')
      expect(form.valid?).to be false
    end

    it 'validates presence of start_date' do
      form = described_class.new(user, nil, start_date: nil)
      expect(form.valid?).to be false
    end

    it 'validates habit_type inclusion' do
      form = described_class.new(user, nil, 
        name: 'Test',
        habit_type: 'invalid_type',
        start_date: Date.current
      )
      expect(form.valid?).to be false
      expect(form.errors[:habit_type]).to be_present
    end

    it 'validates target_value requirement for numeric habits' do
      form = described_class.new(user, nil,
        name: 'Test',
        habit_type: 'numeric',
        start_date: Date.current,
        target_value: nil
      )
      expect(form.valid?).to be false
      expect(form.errors[:target_value]).to be_present
    end

    it 'allows nil target_value for boolean habits' do
      form = described_class.new(user, nil,
        name: 'Test',
        habit_type: 'boolean',
        start_date: Date.current,
        target_value: nil
      )
      expect(form.valid?).to be true
    end

    it 'validates category belongs to user' do
      other_user = create(:user)
      other_category = create(:category, user: other_user)
      
      form = described_class.new(user, nil,
        name: 'Test',
        habit_type: 'boolean',
        start_date: Date.current,
        category_id: other_category.id
      )
      expect(form.valid?).to be false
      expect(form.errors[:category_id]).to be_present
    end
  end

  describe '#save' do
    let(:valid_attributes) do
      {
        name: 'Morning Run',
        habit_type: 'boolean',
        start_date: Date.current,
        category_id: category.id
      }
    end

    it 'creates a new habit' do
      form = described_class.new(user, nil, valid_attributes)
      expect { form.save }.to change { Habit.count }.by(1)
    end

    it 'updates an existing habit' do
      habit = create(:habit, user: user, name: 'Old Name')
      form = described_class.new(user, habit, valid_attributes.merge(name: 'New Name'))
      
      expect { form.save }.not_to change { Habit.count }
      expect(habit.reload.name).to eq 'New Name'
    end

    it 'returns false for invalid form' do
      form = described_class.new(user, nil, name: '')
      expect(form.save).to be false
    end
  end
end
