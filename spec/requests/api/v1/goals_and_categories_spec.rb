require 'rails_helper'

RSpec.describe 'API v1 goals and categories', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'categories' do
    it 'supports full CRUD' do
      post '/api/v1/categories', params: { category: { name: 'Health', color: '#00ff00' } }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      id = json['data']['id']

      patch "/api/v1/categories/#{id}", params: { category: { name: 'Fitness' } }, headers: headers, as: :json
      expect(json['data']).to include('name' => 'Fitness', 'color' => '#00ff00')

      get '/api/v1/categories', headers: headers
      expect(json['data'].map { |c| c['id'] }).to eq([id])

      delete "/api/v1/categories/#{id}", headers: headers
      expect(response).to have_http_status(:no_content)
    end

    it 'refuses to delete a category in use with 409' do
      category = create(:category, user: user)
      create(:habit, user: user, category: category)

      delete "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:conflict)
      expect(Category.exists?(category.id)).to be true
    end

    it 'hides other users categories' do
      other = create(:category, user: create(:user))
      get "/api/v1/categories/#{other.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'goals' do
    it 'creates a goal with its metric and progress' do
      post '/api/v1/goals', params: { goal: { name: 'Save', goal_type: 'target_value', start_date: Date.current.iso8601 } },
                            headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(json['data']).to include('name' => 'Save', 'goal_type' => 'target_value')
      expect(json['data']['metric']).to be_present
      expect(json['data']['progress']).to include('percentage')
    end

    it 'updates, completes and deletes' do
      goal = create(:goal, user: user, name: 'Old')
      patch "/api/v1/goals/#{goal.id}", params: { goal: { name: 'New' } }, headers: headers, as: :json
      expect(goal.reload.name).to eq('New')

      patch "/api/v1/goals/#{goal.id}/complete", headers: headers
      expect(json['data']['completed_at']).to be_present

      delete "/api/v1/goals/#{goal.id}", headers: headers
      expect(response).to have_http_status(:no_content)
    end

    it 'filters completed goals and hides foreign ones' do
      create(:goal, :completed, user: user, name: 'Done')
      create(:goal, user: user, name: 'Open')
      foreign = create(:goal, user: create(:user))

      get '/api/v1/goals', params: { status: 'completed' }, headers: headers
      expect(json['data'].map { |g| g['name'] }).to eq(['Done'])

      get "/api/v1/goals/#{foreign.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
