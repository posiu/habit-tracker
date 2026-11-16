require 'rails_helper'

RSpec.describe 'Analytics stats and insights' do
  let(:user) { create(:user) }
  let(:habit) { create(:habit, user: user) }

  def complete(habit, date)
    entry = user.daily_entries.find_or_create_by!(entry_date: date)
    HabitEntry.create!(daily_entry: entry, habit: habit, completed: true, boolean_value: true)
  end

  describe Analytics::CalculateStatsService do
    it 'returns zeroed stats for a user without data' do
      data = described_class.new(user, days: 7).call.data
      expect(data[:summary][:completions]).to eq(0)
      expect(data[:summary][:change_percent]).to be_nil
      expect(data[:daily_series].size).to eq(7)
      expect(data[:weekly_trend].size).to eq(12)
      expect(data[:weekday_distribution].size).to eq(7)
    end

    it 'counts completions and compares with the previous period' do
      3.times { |i| complete(habit, Date.current - i) }
      complete(habit, Date.current - 10)
      data = described_class.new(user, days: 7).call.data
      expect(data[:summary][:completions]).to eq(3)
      expect(data[:summary][:previous_completions]).to eq(1)
      expect(data[:summary][:change_percent]).to eq(200.0)
      expect(data[:habits].first).to include(name: habit.name, completions: 3)
    end

    it 'ignores other users' do
      other = create(:user)
      entry = other.daily_entries.create!(entry_date: Date.current)
      HabitEntry.create!(daily_entry: entry, habit: create(:habit, user: other), completed: true, boolean_value: true)
      expect(described_class.new(user, days: 7).call.data[:summary][:completions]).to eq(0)
    end

    it 'clamps the number of days' do
      expect(described_class.new(user, days: 99_999).call.data[:period][:days]).to eq(365)
    end
  end

  describe Analytics::GenerateInsightsService do
    it 'reports an upward trend' do
      stats = { summary: { change_percent: 50.0, active_day_rate: 50, completions: 10 } }
      messages = described_class.new(stats).call.data.map { |i| i[:message] }
      expect(messages.join).to include('up 50.0%')
    end

    it 'warns about a decline' do
      stats = { summary: { change_percent: -30.0 } }
      expect(described_class.new(stats).call.data.first[:type]).to eq(:warning)
    end

    it 'returns no insights for empty stats' do
      expect(described_class.new({}).call.data).to eq([])
    end
  end

  describe 'dashboard', type: :request do
    it 'renders analytics and the API endpoint returns stats with insights' do
      complete(habit, Date.current)
      sign_in user
      get root_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include('chart-daily', 'Analytics')

      get '/api/v1/dashboard/stats', params: { days: 7 }, headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json['data']).to include('summary', 'insights', 'weekly_trend')
    end
  end
end
