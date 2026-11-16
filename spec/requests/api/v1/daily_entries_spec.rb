require 'rails_helper'

RSpec.describe 'API v1 daily entries', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  it 'creates an entry and updates it when posting the same date again' do
    post '/api/v1/daily_entries', params: { daily_entry: { entry_date: Date.current.iso8601, mood: 4, notes: 'a' } }, headers: headers, as: :json
    expect(response).to have_http_status(:created)

    post '/api/v1/daily_entries', params: { daily_entry: { entry_date: Date.current.iso8601, mood: 5 } }, headers: headers, as: :json
    expect(response).to have_http_status(:ok)
    expect(json['data']['mood']).to eq(5)
    expect(user.daily_entries.count).to eq(1)
  end

  it 'rejects future dates and invalid moods' do
    post '/api/v1/daily_entries', params: { daily_entry: { entry_date: 1.day.from_now.to_date.iso8601 } }, headers: headers, as: :json
    expect(response).to have_http_status(:unprocessable_content)

    post '/api/v1/daily_entries', params: { daily_entry: { entry_date: Date.current.iso8601, mood: 9 } }, headers: headers, as: :json
    expect(response).to have_http_status(:unprocessable_content)
  end

  it 'filters by date range and rejects malformed dates' do
    create(:daily_entry, user: user, entry_date: Date.current)
    create(:daily_entry, user: user, entry_date: Date.current - 10)

    get '/api/v1/daily_entries', params: { from: (Date.current - 3).iso8601 }, headers: headers
    expect(json['data'].size).to eq(1)

    get '/api/v1/daily_entries', params: { from: 'yesterday' }, headers: headers
    expect(response).to have_http_status(:bad_request)
  end

  it 'shows an entry with its habit and goal entries' do
    entry = create(:daily_entry, user: user)
    create(:habit_entry, daily_entry: entry, habit: create(:habit, user: user))

    get "/api/v1/daily_entries/#{entry.id}", headers: headers

    expect(json['data']['habit_entries'].size).to eq(1)
    expect(json['data']['goal_entries']).to eq([])
  end

  it 'patches and deletes' do
    entry = create(:daily_entry, user: user, mood: 2, notes: 'keep')
    patch "/api/v1/daily_entries/#{entry.id}", params: { daily_entry: { mood: 5 } }, headers: headers, as: :json
    expect(entry.reload).to have_attributes(mood: 5, notes: 'keep')

    delete "/api/v1/daily_entries/#{entry.id}", headers: headers
    expect(response).to have_http_status(:no_content)
  end

  it 'does not expose other users entries' do
    other = create(:daily_entry, user: create(:user))
    get "/api/v1/daily_entries/#{other.id}", headers: headers
    expect(response).to have_http_status(:not_found)
  end

  describe 'tracking habits and goals' do
    let(:entry) { create(:daily_entry, user: user) }

    it 'creates then updates a habit entry (upsert) and deletes it' do
      habit = create(:habit, user: user, habit_type: 'numeric', target_value: 10)

      post "/api/v1/daily_entries/#{entry.id}/habit_entries", params: { habit_id: habit.id, value: 4 }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(json['data']).to include('completed' => true)
      id = json['data']['id']

      post "/api/v1/daily_entries/#{entry.id}/habit_entries", params: { habit_id: habit.id, value: 7 }, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(HabitEntry.count).to eq(1)
      expect(HabitEntry.first.numeric_value).to eq(7)

      delete "/api/v1/habit_entries/#{id}", headers: headers
      expect(response).to have_http_status(:no_content)
    end

    it 'tracks goal progress and auto-completes the goal' do
      goal = create(:goal, user: user, goal_type: 'target_value')
      goal.goal_metric.update!(target_value: 10)

      post "/api/v1/daily_entries/#{entry.id}/goal_entries", params: { goal_id: goal.id, value: 10 }, headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(goal.reload).to be_completed
    end

    it 'refuses to track another users habit or entry' do
      foreign_habit = create(:habit, user: create(:user))
      post "/api/v1/daily_entries/#{entry.id}/habit_entries", params: { habit_id: foreign_habit.id }, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)

      foreign_entry = create(:habit_entry, daily_entry: create(:daily_entry, user: create(:user)))
      delete "/api/v1/habit_entries/#{foreign_entry.id}", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(HabitEntry.exists?(foreign_entry.id)).to be true
    end

    it 'returns validation errors for bad values' do
      habit = create(:habit, user: user, habit_type: 'numeric', target_value: 10)
      post "/api/v1/daily_entries/#{entry.id}/habit_entries", params: { habit_id: habit.id, value: -5 }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
