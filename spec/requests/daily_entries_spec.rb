require 'rails_helper'

RSpec.describe 'DailyEntries', type: :request do
  let(:user) { create(:user) }
  let(:daily_entry) { create(:daily_entry, user: user) }

  context 'when signed out' do
    it 'redirects index to sign in' do
      get daily_entries_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  context 'when signed in' do
    before { sign_in user }

    it 'lists daily entries' do
      get daily_entries_path
      expect(response).to have_http_status(:ok)
    end

    it 'shows a daily entry' do
      get daily_entry_path(daily_entry)
      expect(response).to have_http_status(:ok)
    end

    it 'renders the new form' do
      get new_daily_entry_path
      expect(response).to have_http_status(:ok)
    end
  end
end
