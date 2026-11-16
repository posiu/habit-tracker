require 'rails_helper'

RSpec.describe 'API v1 habits', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }
  let(:valid) { { habit: { name: 'Read', habit_type: 'boolean', start_date: Date.current.iso8601, reminder_days: [1, 3] } } }

  it 'creates a habit' do
    post '/api/v1/habits', params: valid, headers: headers, as: :json

    expect(response).to have_http_status(:created)
    expect(json['data']).to include('name' => 'Read', 'habit_type' => 'boolean', 'reminder_days' => [1, 3])
    expect(user.habits.count).to eq(1)
  end

  it 'returns validation errors in the standard format' do
    post '/api/v1/habits', params: { habit: { name: '' } }, headers: headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(json['error']).to include('code' => 'validation_failed')
    expect(json['error']['details']).to include('name')
  end

  it 'returns 400 for a missing top-level key' do
    post '/api/v1/habits', params: {}, headers: headers, as: :json
    expect(response).to have_http_status(:bad_request)
    expect(json['error']['code']).to eq('parameter_missing')
  end

  it 'lists only own active habits with pagination metadata' do
    create_list(:habit, 3, user: user)
    create(:habit, user: user, is_active: false)
    create(:habit, user: create(:user))

    get '/api/v1/habits', params: { per_page: 2 }, headers: headers

    expect(json['data'].size).to eq(2)
    expect(json['meta']).to include('page' => 1, 'per_page' => 2, 'total_count' => 3, 'total_pages' => 2)

    get '/api/v1/habits', params: { per_page: 2, page: 2 }, headers: headers
    expect(json['data'].size).to eq(1)
  end

  it 'caps per_page at 100' do
    get '/api/v1/habits', params: { per_page: 5000 }, headers: headers
    expect(json['meta']['per_page']).to eq(100)
  end

  it 'filters by status' do
    create(:habit, user: user, is_active: false, name: 'Old')
    get '/api/v1/habits', params: { status: 'inactive' }, headers: headers
    expect(json['data'].map { |h| h['name'] }).to eq(['Old'])
  end

  it 'shows a habit including its streak' do
    habit = create(:habit, user: user)
    get "/api/v1/habits/#{habit.id}", headers: headers

    expect(json['data']).to include('id' => habit.id, 'current_streak' => 0)
  end

  it 'supports partial updates' do
    habit = create(:habit, user: user, name: 'Old', description: 'keep me')
    patch "/api/v1/habits/#{habit.id}", params: { habit: { name: 'New' } }, headers: headers, as: :json

    expect(response).to have_http_status(:ok)
    expect(habit.reload).to have_attributes(name: 'New', description: 'keep me')
  end

  it 'archives and deletes' do
    habit = create(:habit, user: user)
    patch "/api/v1/habits/#{habit.id}/archive", headers: headers
    expect(habit.reload).not_to be_is_active

    delete "/api/v1/habits/#{habit.id}", headers: headers
    expect(response).to have_http_status(:no_content)
    expect(Habit.exists?(habit.id)).to be false
  end

  describe 'isolation between users' do
    let(:foreign) { create(:habit, user: create(:user)) }

    it 'answers 404 for other users habits on every member route' do
      get "/api/v1/habits/#{foreign.id}", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(json['error']['code']).to eq('not_found')

      patch "/api/v1/habits/#{foreign.id}", params: { habit: { name: 'x' } }, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)

      delete "/api/v1/habits/#{foreign.id}", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(Habit.exists?(foreign.id)).to be true
    end

    it 'does not let a habit be attached to another users category' do
      foreign_category = create(:category, user: create(:user))
      post '/api/v1/habits', params: { habit: valid[:habit].merge(category_id: foreign_category.id) }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
