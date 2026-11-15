require 'rails_helper'

RSpec.describe 'Habits', type: :request do
  let(:user) { create(:user) }
  let(:habit) { create(:habit, user: user) }

  context 'when signed out' do
    it 'redirects index to sign in' do
      get habits_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  context 'when signed in' do
    before { sign_in user }

    it 'lists habits' do
      get habits_path
      expect(response).to have_http_status(:ok)
    end

    it 'shows a habit' do
      get habit_path(habit)
      expect(response).to have_http_status(:ok)
    end

    it 'renders the new form' do
      get new_habit_path
      expect(response).to have_http_status(:ok)
    end

    it 'renders the edit form' do
      get edit_habit_path(habit)
      expect(response).to have_http_status(:ok)
    end

    it 'does not expose habits of other users' do
      other = create(:habit, user: create(:user))
      expect { get habit_path(other) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end

RSpec.describe 'Habit reminder days', type: :request do
  let(:user) { create(:user) }
  let(:habit) { create(:habit, user: user, reminder_enabled: true, reminder_days: [1, 3]) }

  let(:base_params) do
    { name: habit.name, habit_type: 'boolean', start_date: habit.start_date.iso8601, reminder_enabled: '1', is_active: '1' }
  end

  before { sign_in user }

  it 'pre-checks the saved days in the edit form' do
    get edit_habit_path(habit)
    expect(response.body).to match(/id="habit_reminder_days_1"[^>]*checked/)
    expect(response.body).not_to match(/id="habit_reminder_days_2"[^>]*checked/)
  end

  it 'saves the chosen days and ignores the blank placeholder' do
    patch habit_path(habit), params: { habit: base_params.merge(reminder_days: ['', '2', '5']) }
    expect(habit.reload.reminder_days).to eq([2, 5])
  end

  it 'clears the days when none are chosen' do
    patch habit_path(habit), params: { habit: base_params.merge(reminder_days: ['']) }
    expect(habit.reload.reminder_days).to eq([])
  end
end
