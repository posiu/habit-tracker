require 'rails_helper'

RSpec.describe 'Users::Profiles', type: :request do
  let(:user) { create(:user) }

  it 'redirects guests to sign in' do
    get users_profile_path
    expect(response).to redirect_to(new_user_session_path)
  end

  context 'when signed in' do
    before { sign_in user }

    it 'shows the profile' do
      get users_profile_path
      expect(response).to have_http_status(:ok)
    end

    it 'renders the edit form' do
      get edit_users_profile_path
      expect(response).to have_http_status(:ok)
    end

    it 'updates the profile' do
      patch users_profile_path, params: { user: { first_name: 'Anna', reminder_time: '08:30' } }
      expect(response).to redirect_to(users_profile_path)
      expect(user.reload.first_name).to eq('Anna')
      expect(user.reminder_time.strftime('%H:%M')).to eq('08:30')
    end
  end
end
