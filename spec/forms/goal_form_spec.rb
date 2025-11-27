require 'rails_helper'

RSpec.describe GoalForm do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  describe 'validations' do
    it 'validates presence of name' do
      form = described_class.new(user, nil, name: '')
      expect(form.valid?).to be false
      expect(form.errors[:name]).to be_present
    end

    it 'validates presence of goal_type' do
      form = described_class.new(user, nil, goal_type: '')
      expect(form.valid?).to be false
    end

    it 'validates presence of start_date' do
      form = described_class.new(user, nil, start_date: nil)
      expect(form.valid?).to be false
    end

    it 'validates goal_type inclusion' do
      form = described_class.new(user, nil,
        name: 'Test Goal',
        goal_type: 'invalid_type',
        start_date: Date.current
      )
      expect(form.valid?).to be false
    end

    it 'validates target_date presence for target_date goals' do
      form = described_class.new(user, nil,
        name: 'Test Goal',
        goal_type: 'target_date',
        start_date: Date.current,
        target_date: nil
      )
      expect(form.valid?).to be false
    end

    it 'validates target_date after start_date' do
      form = described_class.new(user, nil,
        name: 'Test Goal',
        goal_type: 'target_value',
        start_date: Date.current,
        target_date: 5.days.ago
      )
      expect(form.valid?).to be false
      expect(form.errors[:target_date]).to be_present
    end
  end

  describe '#save' do
    let(:valid_attributes) do
      {
        name: 'Run 10K',
        goal_type: 'target_value',
        start_date: Date.current,
        category_id: category.id
      }
    end

    it 'creates a new goal' do
      form = described_class.new(user, nil, valid_attributes)
      expect { form.save }.to change { Goal.count }.by(1)
    end

    it 'updates an existing goal' do
      goal = create(:goal, user: user, name: 'Old Goal')
      form = described_class.new(user, goal, valid_attributes.merge(name: 'New Goal'))
      
      expect { form.save }.not_to change { Goal.count }
      expect(goal.reload.name).to eq 'New Goal'
    end

    it 'returns false for invalid form' do
      form = described_class.new(user, nil, name: '')
      expect(form.save).to be false
    end
  end
end
