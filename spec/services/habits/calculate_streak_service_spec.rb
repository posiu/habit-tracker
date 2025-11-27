require 'rails_helper'

RSpec.describe Habits::CalculateStreakService do
  let(:user) { create(:user) }
  let(:habit) { create(:habit, user: user) }
  let(:service) { described_class.new(habit) }

  describe '#call' do
    context 'when habit has no entries' do
      it 'returns 0 streak' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data).to eq(0)
      end
    end

    context 'when habit has consecutive completed entries' do
      before do
        # Create daily entries for the last 5 days
        (0..4).each do |days_ago|
          date = Date.current - days_ago.days
          daily_entry = create(:daily_entry, user: user, entry_date: date)
          create(:habit_entry, habit: habit, daily_entry: daily_entry, completed: true)
        end
      end

      it 'calculates correct streak' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data).to eq(5)
      end
    end

    context 'when habit has a gap in entries' do
      before do
        # Create entries for today and yesterday, skip day before yesterday, then 2 more days
        [0, 1, 3, 4].each do |days_ago|
          date = Date.current - days_ago.days
          daily_entry = create(:daily_entry, user: user, entry_date: date)
          create(:habit_entry, habit: habit, daily_entry: daily_entry, completed: true)
        end
      end

      it 'calculates streak only until the gap' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data).to eq(2) # Only today and yesterday
      end
    end

    context 'when latest entry is not recent' do
      before do
        # Create entry from 3 days ago
        date = Date.current - 3.days
        daily_entry = create(:daily_entry, user: user, entry_date: date)
        create(:habit_entry, habit: habit, daily_entry: daily_entry, completed: true)
      end

      it 'returns 0 streak' do
        result = service.call
        expect(result.success?).to be true
        expect(result.data).to eq(0)
      end
    end
  end
end
