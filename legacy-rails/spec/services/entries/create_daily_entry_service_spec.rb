require 'rails_helper'

RSpec.describe Entries::CreateDailyEntryService do
  let(:user) { create(:user) }

  describe '#call' do
    context 'with valid params' do
      let(:params) { { entry_date: Date.current, mood: 4, notes: 'Great day!' } }

      it 'creates a daily entry' do
        result = described_class.new(user: user, params: params).call

        expect(result.success?).to be true
        expect(result.data).to be_a(DailyEntry)
        expect(result.data.mood).to eq(4)
        expect(result.data.notes).to eq('Great day!')
      end

      it 'finds or creates entry for the same date' do
        first_result = described_class.new(user: user, params: params).call
        updated_params = params.merge(mood: 5)
        second_result = described_class.new(user: user, params: updated_params).call

        expect(first_result.data.id).to eq(second_result.data.id)
        expect(second_result.data.mood).to eq(5)
      end
    end

    context 'with invalid params' do
      let(:params) { { entry_date: 1.day.from_now, mood: 4 } }

      it 'returns failure' do
        result = described_class.new(user: user, params: params).call

        expect(result.success?).to be false
        expect(result.error_messages).to include(match(/can't be in the future/))
      end
    end

    context 'with invalid mood' do
      let(:params) { { entry_date: Date.current, mood: 10 } }

      it 'returns failure' do
        result = described_class.new(user: user, params: params).call

        expect(result.success?).to be false
      end
    end
  end
end
