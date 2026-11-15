require 'rails_helper'

RSpec.describe 'Categories', type: :request do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  context 'when signed out' do
    it 'redirects index to sign in' do
      get categories_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  context 'when signed in' do
    before { sign_in user }

    it 'lists categories' do
      get categories_path
      expect(response).to have_http_status(:ok)
    end

    it 'renders the new form' do
      get new_category_path
      expect(response).to have_http_status(:ok)
    end

    it 'renders the edit form' do
      get edit_category_path(category)
      expect(response).to have_http_status(:ok)
    end
  end
end
