require 'rails_helper'

RSpec.feature 'Categories CRUD', type: :feature do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  before do
    sign_in user
  end

  scenario 'User creates a new category' do
    visit categories_path
    click_link 'New Category'

    fill_in 'Name', with: 'Health'
    fill_in 'Description', with: 'Health related activities'
    fill_in 'Color', with: '#FF0000'
    check 'Active'

    click_button 'Create Category'

    expect(page).to have_content('Category was successfully created')
    expect(page).to have_content('Health')
  end

  scenario 'User views category details' do
    category = create(:category, user: user, name: 'Work')
    
    visit categories_path
    click_link 'View'

    expect(page).to have_content('Work')
  end

  scenario 'User edits a category' do
    category = create(:category, user: user, name: 'Old Category')
    
    visit category_path(category)
    click_link 'Edit Category'

    fill_in 'Name', with: 'New Category'
    click_button 'Update Category'

    expect(page).to have_content('Category was successfully updated')
    expect(page).to have_content('New Category')
  end

  scenario 'User can delete empty category' do
    category = create(:category, user: user)
    
    visit categories_path
    click_link 'Delete'
    
    expect(page).to have_content('Category was successfully deleted')
  end

  scenario 'User cannot delete category with habits' do
    category = create(:category, user: user)
    habit = create(:habit, user: user, category: category)
    
    visit categories_path
    expect(page).not_to have_link('Delete', href: category_path(category))
  end
end
