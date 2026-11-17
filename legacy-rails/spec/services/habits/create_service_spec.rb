require 'rails_helper'

RSpec.describe Habits::CreateService do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }
  
  let(:valid_params) do
    {
      name: 'Morning Exercise',
      habit_type: 'boolean',
      start_date: Date.current,
      is_active: true
    }
  end

  let(:invalid_params) do
    {
      name: '',
      habit_type: 'invalid_type',
      start_date: nil
    }
  end

  describe '#call' do
    context 'with valid params' do
      it 'creates a new habit' do
        service = described_class.new(user: user, params: valid_params)
        result = service.call

        expect(result.success?).to be true
        expect(result.data).to be_a(Habit)
        expect(user.habits.count).to eq 1
        expect(user.habits.first.name).to eq 'Morning Exercise'
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

    context 'with numeric habit' do
      let(:numeric_params) do
        valid_params.merge(
          habit_type: 'numeric',
          target_value: 30,
          unit: 'minutes'
        )
      end

      it 'creates habit with target value' do
        service = described_class.new(user: user, params: numeric_params)
        result = service.call

        expect(result.success?).to be true
        expect(result.data.target_value).to eq 30
        expect(result.data.unit).to eq 'minutes'
      end
    end
  end
end
