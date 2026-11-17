require 'rails_helper'

RSpec.describe Entries::CreateGoalEntryService do
  let(:user) { create(:user) }
  let(:daily_entry) { create(:daily_entry, user: user) }
  let(:goal) { create(:goal, user: user, goal_type: 'days_doing') }

  describe '#call' do
    context 'with days_doing goal and valid params' do
      let(:params) { { boolean_value: true } }

      it 'creates goal entry' do
        result = described_class.new(daily_entry: daily_entry, goal: goal, params: params).call

        expect(result.success?).to be true
        expect(result.data).to be_a(GoalEntry)
        expect(result.data.boolean_value).to be true
      end
    end

    context 'with target_value goal and valid params' do
      let(:target_goal) { create(:goal, user: user, goal_type: 'target_value', unit: 'km') }
      let(:params) { { value: 5.5, is_increment: true } }

      it 'creates goal entry with numeric value' do
        result = described_class.new(daily_entry: daily_entry, goal: target_goal, params: params).call

        expect(result.success?).to be true
        expect(result.data.value).to eq(5.5)
        expect(result.data.is_increment).to be true
      end
    end

    context 'with invalid params' do
      let(:target_goal) { create(:goal, user: user, goal_type: 'target_value') }
      let(:params) { { value: nil, is_increment: true } }

      it 'returns failure' do
        result = described_class.new(daily_entry: daily_entry, goal: target_goal, params: params).call

        expect(result.success?).to be false
      end
    end

    context 'with duplicate entry for same day' do
      let(:params) { { boolean_value: true } }

      it 'prevents creating duplicate' do
        described_class.new(daily_entry: daily_entry, goal: goal, params: params).call

        result = described_class.new(daily_entry: daily_entry, goal: goal, params: params).call
        expect(result.success?).to be false
      end
    end
  end
end
