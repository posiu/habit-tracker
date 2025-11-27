require 'rails_helper'

RSpec.feature 'Habits CRUD', type: :feature do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }
  let(:category) { create(:category, user: user) }

  before do
    sign_in user
  end

  scenario 'User creates a new habit' do
    visit habits_path
    click_link 'New Habit'

    fill_in 'Name', with: 'Morning Jog'
    select 'Health', from: 'Category'
    select 'Yes/No (Boolean)', from: 'Habit Type'
    fill_in 'Start date', with: Date.current
    check 'Active'

    click_button 'Create Habit'

    expect(page).to have_content('Habit was successfully created')
    expect(page).to have_content('Morning Jog')
  end

  scenario 'User views habit details' do
    habit = create(:habit, user: user, name: 'Evening Reading')
    
    visit habits_path
    click_link 'View'

    expect(page).to have_content('Evening Reading')
    expect(page).to have_content('Boolean')
  end

  scenario 'User edits a habit' do
    habit = create(:habit, user: user, name: 'Old Name')
    
    visit habit_path(habit)
    click_link 'Edit Habit'

    fill_in 'Name', with: 'New Name'
    click_button 'Update Habit'

    expect(page).to have_content('Habit was successfully updated')
    expect(page).to have_content('New Name')
  end

  scenario 'User deletes a habit' do
    habit = create(:habit, user: user)
    
    visit habits_path
    click_link 'Delete'
    
    expect(page).to have_content('Habit was successfully deleted')
  end

  scenario 'User cannot view other users habits' do
    other_user = create(:user)
    other_habit = create(:habit, user: other_user)
    
    visit habit_path(other_habit)
    
    expect(page).to have_content('not authorized')
  end
end
