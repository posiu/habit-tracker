require 'rails_helper'

RSpec.describe GoalPolicy do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:goal) { create(:goal, user: user) }
  let(:other_goal) { create(:goal, user: other_user) }

  describe 'permissions' do
    it 'allows index for authenticated users' do
      expect(GoalPolicy.new(user, Goal).index?).to be true
    end

    it 'allows user to view their own goal' do
      expect(GoalPolicy.new(user, goal).show?).to be true
    end

    it 'prevents user from viewing other users goal' do
      expect(GoalPolicy.new(user, other_goal).show?).to be false
    end

    it 'allows user to create goals' do
      expect(GoalPolicy.new(user, Goal.new).create?).to be true
    end

    it 'allows user to update their own goal' do
      expect(GoalPolicy.new(user, goal).update?).to be true
    end

    it 'prevents user from updating other users goal' do
      expect(GoalPolicy.new(user, other_goal).update?).to be false
    end

    it 'allows user to delete their own goal' do
      expect(GoalPolicy.new(user, goal).destroy?).to be true
    end

    it 'prevents user from deleting other users goal' do
      expect(GoalPolicy.new(user, other_goal).destroy?).to be false
    end

    it 'allows user to complete their own goal' do
      expect(GoalPolicy.new(user, goal).complete?).to be true
    end
  end

  describe 'Scope' do
    it 'returns only users goals' do
      create(:goal, user: user)
      create(:goal, user: other_user)
      
      scope = GoalPolicy::Scope.new(user, Goal).resolve
      expect(scope).to include(goal)
      expect(scope).not_to include(other_goal)
    end
  end
end
