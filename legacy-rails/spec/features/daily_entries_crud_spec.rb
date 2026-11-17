require 'rails_helper'

RSpec.describe 'Daily Entries CRUD', type: :feature do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  before do
    sign_in user
  end

  describe 'viewing daily entry' do
    let(:daily_entry) { create(:daily_entry, user: user, entry_date: Date.current, mood: 4) }

    it 'displays daily entry with mood and notes' do
      visit daily_entry_path(daily_entry)

      expect(page).to have_text(daily_entry.entry_date.strftime("%A, %B %d, %Y"))
      expect(page).to have_text('😊')
      expect(page).to have_text(daily_entry.notes)
    end
  end

  describe 'creating habit entry from daily entry view' do
    let(:daily_entry) { create(:daily_entry, user: user) }
    let(:habit) { create(:habit, user: user, habit_type: 'boolean') }

    it 'creates habit entry for daily entry' do
      visit daily_entry_path(daily_entry)

      expect(page).to have_text(habit.name)
      click_button 'Track'
      check 'Mark as completed'
      click_button 'Save'

      expect(page).to have_text('Habit entry saved')
      expect(daily_entry.habit_entries.count).to eq(1)
    end
  end

  describe 'creating goal entry from daily entry view' do
    let(:daily_entry) { create(:daily_entry, user: user) }
    let(:goal) { create(:goal, user: user, goal_type: 'days_doing') }

    it 'creates goal entry for daily entry' do
      visit daily_entry_path(daily_entry)

      expect(page).to have_text(goal.name)
      click_button 'Track'
      check 'Made progress today'
      click_button 'Save'

      expect(page).to have_text('Goal entry saved')
      expect(daily_entry.goal_entries.count).to eq(1)
    end
  end

  describe 'updating daily entry' do
    let(:daily_entry) { create(:daily_entry, user: user, mood: 3, notes: 'Original notes') }

    it 'updates daily entry notes and mood' do
      visit edit_daily_entry_path(daily_entry)

      select '😄 Great', from: 'daily_entry_form_mood'
      fill_in 'Notes', with: 'Updated notes'
      click_button 'Save'

      expect(page).to have_text('Daily entry was successfully updated')
      daily_entry.reload
      expect(daily_entry.mood).to eq(5)
      expect(daily_entry.notes).to eq('Updated notes')
    end
  end

  describe 'deleting daily entry' do
    let(:daily_entry) { create(:daily_entry, user: user) }

    it 'deletes daily entry' do
      visit daily_entry_path(daily_entry)

      click_link 'All Entries'
      expect(page).to have_text(daily_entry.entry_date.strftime("%b %d"))

      visit daily_entry_path(daily_entry)
      click_button 'Delete'

      expect(page).to have_text('Daily entry was successfully deleted')
      expect(DailyEntry.find_by(id: daily_entry.id)).to be_nil
    end
  end

  describe 'authorization' do
    let(:other_user) { create(:user, email: 'other@example.com') }
    let(:other_daily_entry) { create(:daily_entry, user: other_user) }

    it 'prevents viewing other user\'s daily entry' do
      visit daily_entry_path(other_daily_entry)

      expect(page).to have_text('not authorized')
    end
  end
end
