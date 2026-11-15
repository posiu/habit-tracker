require 'rails_helper'

RSpec.describe 'Dashboard', type: :request do
  describe 'GET /' do
    it 'redirects guests to sign in' do
      get root_path
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'renders for a signed-in user' do
      sign_in create(:user)
      get root_path
      expect(response).to have_http_status(:ok)
    end
  end
end
