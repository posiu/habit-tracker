require 'rails_helper'

RSpec.describe 'Goals', type: :request do
  let(:user) { create(:user) }
  let(:goal) { create(:goal, user: user) }

  context 'when signed out' do
    it 'redirects index to sign in' do
      get goals_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  context 'when signed in' do
    before { sign_in user }

    it 'lists goals' do
      get goals_path
      expect(response).to have_http_status(:ok)
    end

    it 'shows a goal' do
      get goal_path(goal)
      expect(response).to have_http_status(:ok)
    end

    it 'renders the new form' do
      get new_goal_path
      expect(response).to have_http_status(:ok)
    end

    it 'renders the edit form' do
      get edit_goal_path(goal)
      expect(response).to have_http_status(:ok)
    end
  end
end
