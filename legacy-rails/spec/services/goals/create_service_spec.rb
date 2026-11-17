require 'rails_helper'

RSpec.describe Goals::CreateService do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }
  
  let(:valid_params) do
    {
      name: 'Run 10K',
      goal_type: 'target_value',
      start_date: Date.current,
      unit: 'km',
      is_active: true
    }
  end

  let(:invalid_params) do
    {
      name: '',
      goal_type: 'invalid_type',
      start_date: nil
    }
  end

  describe '#call' do
    context 'with valid params' do
      it 'creates a new goal' do
        service = described_class.new(user: user, params: valid_params)
        result = service.call

        expect(result.success?).to be true
        expect(result.data).to be_a(Goal)
        expect(user.goals.count).to eq 1
        expect(user.goals.first.name).to eq 'Run 10K'
      end

      it 'creates goal_metric' do
        service = described_class.new(user: user, params: valid_params)
        result = service.call

        expect(result.data.goal_metrics).to be_any
      end
    end

    context 'with invalid params' do
      it 'returns failure' do
        service = described_class.new(user: user, params: invalid_params)
        result = service.call

        expect(result.success?).to be false
        expect(result.data).to be_nil
      end
    end

    context 'with target_date goal' do
      let(:target_date_params) do
        valid_params.merge(
          goal_type: 'target_date',
          target_date: 30.days.from_now
        )
      end

      it 'creates goal with target date' do
        service = described_class.new(user: user, params: target_date_params)
        result = service.call

        expect(result.success?).to be true
        expect(result.data.target_date).to be_present
      end
    end
  end
end
