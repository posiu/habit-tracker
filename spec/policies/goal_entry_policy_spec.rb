require 'rails_helper'

RSpec.describe GoalEntryPolicy do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:daily_entry) { create(:daily_entry, user: user) }
  let(:other_daily_entry) { create(:daily_entry, user: other_user) }
  let(:goal_entry) { create(:goal_entry, daily_entry: daily_entry) }
  let(:other_goal_entry) { create(:goal_entry, daily_entry: other_daily_entry) }

  subject { described_class }

  permissions :create? do
    it 'allows user to create entry for own daily entry' do
      expect(subject).to permit(user, goal_entry)
    end

    it 'denies user from creating entry for other user\'s daily entry' do
      expect(subject).not_to permit(user, other_goal_entry)
    end
  end

  permissions :update? do
    it 'allows user to update own entry' do
      expect(subject).to permit(user, goal_entry)
    end

    it 'denies user from updating other user\'s entry' do
      expect(subject).not_to permit(user, other_goal_entry)
    end
  end

  permissions :destroy? do
    it 'allows user to destroy own entry' do
      expect(subject).to permit(user, goal_entry)
    end

    it 'denies user from destroying other user\'s entry' do
      expect(subject).not_to permit(user, other_goal_entry)
    end
  end

  describe 'Scope' do
    before do
      create_list(:goal_entry, 3, daily_entry: daily_entry)
      create_list(:goal_entry, 2, daily_entry: other_daily_entry)
    end

    it 'returns only current user\'s goal entries' do
      scope = described_class::Scope.new(user, GoalEntry.all).resolve
      expect(scope.count).to eq(3)
    end
  end
end
