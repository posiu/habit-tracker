require 'rails_helper'

RSpec.describe HabitPolicy do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:habit) { create(:habit, user: user) }
  let(:other_habit) { create(:habit, user: other_user) }

  describe 'permissions' do
    it 'allows index for authenticated users' do
      expect(HabitPolicy.new(user, Habit).index?).to be true
    end

    it 'allows user to view their own habit' do
      expect(HabitPolicy.new(user, habit).show?).to be true
    end

    it 'prevents user from viewing other users habit' do
      expect(HabitPolicy.new(user, other_habit).show?).to be false
    end

    it 'allows user to create habits' do
      expect(HabitPolicy.new(user, Habit.new).create?).to be true
    end

    it 'allows user to update their own habit' do
      expect(HabitPolicy.new(user, habit).update?).to be true
    end

    it 'prevents user from updating other users habit' do
      expect(HabitPolicy.new(user, other_habit).update?).to be false
    end

    it 'allows user to delete their own habit' do
      expect(HabitPolicy.new(user, habit).destroy?).to be true
    end

    it 'prevents user from deleting other users habit' do
      expect(HabitPolicy.new(user, other_habit).destroy?).to be false
    end

    it 'allows user to archive their own habit' do
      expect(HabitPolicy.new(user, habit).archive?).to be true
    end
  end

  describe 'Scope' do
    it 'returns only users habits' do
      create(:habit, user: user)
      create(:habit, user: other_user)
      
      scope = HabitPolicy::Scope.new(user, Habit).resolve
      expect(scope).to include(habit)
      expect(scope).not_to include(other_habit)
    end
  end
end
