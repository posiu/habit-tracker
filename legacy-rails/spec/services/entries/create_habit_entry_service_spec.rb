require 'rails_helper'

RSpec.describe Entries::CreateHabitEntryService do
  let(:user) { create(:user) }
  let(:daily_entry) { create(:daily_entry, user: user) }
  let(:habit) { create(:habit, user: user) }

  describe '#call' do
    context 'with boolean habit and valid params' do
      let(:params) { { completed: true } }

      it 'creates habit entry' do
        result = described_class.new(daily_entry: daily_entry, habit: habit, params: params).call

        expect(result.success?).to be true
        expect(result.data).to be_a(HabitEntry)
        expect(result.data.completed).to be true
      end
    end

    context 'with numeric habit and valid params' do
      let(:numeric_habit) { create(:habit, user: user, habit_type: 'numeric', target_value: 30) }
      let(:params) { { value: 25 } }

      it 'creates habit entry with numeric value' do
        result = described_class.new(daily_entry: daily_entry, habit: numeric_habit, params: params).call

        expect(result.success?).to be true
        expect(result.data.numeric_value).to eq(25)
        expect(result.data.completed).to be true
      end
    end

    context 'with invalid params' do
      let(:numeric_habit) { create(:habit, user: user, habit_type: 'numeric') }
      let(:params) { { value: -5 } }

      it 'returns failure' do
        result = described_class.new(daily_entry: daily_entry, habit: numeric_habit, params: params).call

        expect(result.success?).to be false
      end
    end

    context 'with duplicate entry for same day' do
      let(:params) { { completed: true } }

      it 'prevents creating duplicate' do
        described_class.new(daily_entry: daily_entry, habit: habit, params: params).call

        result = described_class.new(daily_entry: daily_entry, habit: habit, params: params).call
        expect(result.success?).to be false
      end
    end
  end
end
