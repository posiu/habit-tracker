require 'rails_helper'

RSpec.describe 'Users::Settings', type: :request do
  let(:user) { create(:user) }

  it 'redirects guests to sign in' do
    get users_settings_path
    expect(response).to redirect_to(new_user_session_path)
  end

  context 'when signed in' do
    before { sign_in user }

    it 'shows settings' do
      get users_settings_path
      expect(response).to have_http_status(:ok)
    end

    it 'saves the report frequency' do
      patch users_settings_path, params: { user: { report_frequency: 'weekly' } }
      expect(user.reload.report_frequency).to eq('weekly')
    end

    it 'rejects an unknown report frequency' do
      patch users_settings_path, params: { user: { report_frequency: 'hourly' } }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.report_frequency).to eq('none')
    end

    it 'updates settings' do
      patch users_settings_path, params: { user: { email_notifications_enabled: '0' } }
      expect(response).to redirect_to(users_settings_path)
      expect(user.reload.email_notifications_enabled).to be(false)
    end
  end
end
