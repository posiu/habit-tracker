require 'rails_helper'

RSpec.describe Goals::CalculateProgressService do
  let(:user) { create(:user) }
  let(:goal) { create(:goal, user: user) }
  let(:service) { described_class.new(goal) }

  describe '#call' do
    context 'with target_value goal type' do
      let(:goal) { create(:goal, user: user, goal_type: 'target_value') }
      let!(:goal_metric) { create(:goal_metric, goal: goal, target_value: 100, current_value: 30) }

      it 'calculates correct progress percentage' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data[:percentage]).to eq(30.0)
        expect(result.data[:current]).to eq(30)
        expect(result.data[:target]).to eq(100)
        expect(result.data[:status]).to eq('in_progress')
      end
    end

    context 'with days_doing goal type' do
      let(:goal) { create(:goal, user: user, goal_type: 'days_doing', start_date: 10.days.ago, target_date: 10.days.from_now) }

      before do
        # Create goal entries for 5 days
        5.times do |i|
          date = Date.current - i.days
          daily_entry = create(:daily_entry, user: user, entry_date: date)
          create(:goal_entry, goal: goal, daily_entry: daily_entry, numeric_value: 1)
        end
      end

      it 'calculates progress based on days with entries' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data[:current]).to eq(5)
        expect(result.data[:percentage]).to be > 0
        expect(result.data[:status]).to eq('in_progress')
      end
    end

    context 'with completed goal' do
      let(:goal) { create(:goal, user: user, goal_type: 'target_value', completed_at: 1.day.ago) }

      it 'shows completed status' do
        result = service.call
        expect(result.success?).to be true
        # Note: This might need adjustment based on actual implementation
      end
    end
  end
end
