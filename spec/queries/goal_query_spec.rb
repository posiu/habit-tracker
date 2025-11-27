require 'rails_helper'

RSpec.describe GoalQuery do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  let!(:active_goal) { create(:goal, user: user, is_active: true) }
  let!(:completed_goal) { create(:goal, user: user, is_active: false, completed_at: Time.current) }
  let!(:goal_with_category) { create(:goal, user: user, is_active: true, category: category) }
  let!(:goal_with_deadline) { create(:goal, user: user, is_active: true, goal_type: 'target_date', target_date: 30.days.from_now) }
  let!(:approaching_deadline_goal) { create(:goal, user: user, is_active: true, goal_type: 'target_date', target_date: 3.days.from_now) }

  describe '#active' do
    it 'returns only active goals' do
      query = described_class.new(user)
      goals = query.active
      
      expect(goals).to include(active_goal)
      expect(goals).not_to include(completed_goal)
    end
  end

  describe '#completed' do
    it 'returns only completed goals' do
      query = described_class.new(user)
      goals = query.completed
      
      expect(goals).to include(completed_goal)
      expect(goals).not_to include(active_goal)
    end
  end

  describe '#incomplete' do
    it 'returns only incomplete goals' do
      query = described_class.new(user)
      goals = query.incomplete
      
      expect(goals).to include(active_goal)
      expect(goals).not_to include(completed_goal)
    end
  end

  describe '#by_category' do
    it 'returns goals for specific category' do
      query = described_class.new(user)
      goals = query.by_category(category.id)
      
      expect(goals).to include(goal_with_category)
      expect(goals).not_to include(active_goal)
    end
  end

  describe '#with_deadlines' do
    it 'returns goals with target dates' do
      query = described_class.new(user)
      goals = query.with_deadlines
      
      expect(goals).to include(goal_with_deadline)
      expect(goals).not_to include(active_goal)
    end
  end

  describe '#approaching_deadline' do
    it 'returns goals with deadline within 1 week' do
      query = described_class.new(user)
      goals = query.approaching_deadline
      
      expect(goals).to include(approaching_deadline_goal)
      expect(goals).not_to include(goal_with_deadline)
    end
  end

  describe '#all' do
    it 'returns all user goals' do
      query = described_class.new(user)
      goals = query.all
      
      expect(goals.count).to eq 5
    end
  end
end
