require 'rails_helper'

RSpec.describe 'Dashboard with Heatmap', type: :feature do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  before do
    sign_in user
  end

  describe 'viewing dashboard' do
    let!(:habit) { create(:habit, user: user) }
    let!(:goal) { create(:goal, user: user) }
    let!(:category) { create(:category, user: user) }

    it 'displays dashboard with stats' do
      visit root_path

      expect(page).to have_text('Dashboard')
      expect(page).to have_text('1')  # active habits count
      expect(page).to have_text('1')  # active goals count
      expect(page).to have_text('1')  # categories count
    end

    it 'displays heatmap container' do
      visit root_path

      expect(page).to have_css('.heatmap-container')
      expect(page).to have_css('.heatmap-day')
    end

    it 'displays quick actions' do
      visit root_path

      expect(page).to have_link('Add New Habit')
      expect(page).to have_link('Create Goal')
      expect(page).to have_link('Log Today\'s Entry')
    end
  end

  describe 'daily entries in dashboard' do
    let!(:today_entry) { create(:daily_entry, user: user, entry_date: Date.current, mood: 4) }

    it 'displays today\'s entry' do
      visit root_path

      expect(page).to have_text('Today\'s entry completed!')
      expect(page).to have_text('😊')
      expect(page).to have_link('View Entry')
    end
  end

  describe 'recent entries section' do
    let!(:entries) { create_list(:daily_entry, 3, user: user, entry_date: Date.current) }

    it 'displays recent entries' do
      visit root_path

      expect(page).to have_text('Recent Entries')
      entries.each do |entry|
        expect(page).to have_text(entry.entry_date.strftime("%b %d"))
      end
    end
  end
end
