require 'rails_helper'

RSpec.feature 'Goals CRUD', type: :feature do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }
  let(:category) { create(:category, user: user) }

  before do
    sign_in user
  end

  scenario 'User creates a new goal' do
    visit goals_path
    click_link 'New Goal'

    fill_in 'Name', with: 'Run 10K'
    select 'Health', from: 'Category'
    select 'Target Value', from: 'Goal Type'
    fill_in 'Start date', with: Date.current
    check 'Active'

    click_button 'Create Goal'

    expect(page).to have_content('Goal was successfully created')
    expect(page).to have_content('Run 10K')
  end

  scenario 'User views goal details' do
    goal = create(:goal, user: user, name: 'Read Book')
    
    visit goals_path
    click_link 'View'

    expect(page).to have_content('Read Book')
  end

  scenario 'User edits a goal' do
    goal = create(:goal, user: user, name: 'Old Goal')
    
    visit goal_path(goal)
    click_link 'Edit Goal'

    fill_in 'Name', with: 'New Goal'
    click_button 'Update Goal'

    expect(page).to have_content('Goal was successfully updated')
    expect(page).to have_content('New Goal')
  end

  scenario 'User deletes a goal' do
    goal = create(:goal, user: user)
    
    visit goals_path
    click_link 'Delete'
    
    expect(page).to have_content('Goal was successfully deleted')
  end

  scenario 'User completes a goal' do
    goal = create(:goal, user: user, is_active: true)
    
    visit goal_path(goal)
    click_link 'Complete Goal'
    
    expect(goal.reload.completed?).to be true
  end
end
