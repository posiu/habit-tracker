require 'rails_helper'

RSpec.feature "Authentication", type: :feature do
  describe "User registration" do
    scenario "User can sign up with valid information" do
      visit new_user_registration_path
      
      fill_in "First name", with: "John"
      fill_in "Last name", with: "Doe"
      fill_in "Email", with: "john@example.com"
      fill_in "Password", with: "password123"
      fill_in "Password confirmation", with: "password123"
      
      click_button "Sign up"
      
      expect(page).to have_content("Welcome! You have signed up successfully.")
      expect(current_path).to eq(root_path)
    end
    
    scenario "User cannot sign up with invalid email" do
      visit new_user_registration_path
      
      fill_in "Email", with: "invalid-email"
      fill_in "Password", with: "password123"
      fill_in "Password confirmation", with: "password123"
      
      click_button "Sign up"
      
      expect(page).to have_content("Email is invalid")
    end
  end
  
  describe "User sign in" do
    let(:user) { create(:user) }
    
    scenario "User can sign in with valid credentials" do
      visit new_user_session_path
      
      fill_in "Email", with: user.email
      fill_in "Password", with: "password123"
      
      click_button "Sign in"
      
      expect(page).to have_content("Signed in successfully.")
      expect(current_path).to eq(root_path)
    end
    
    scenario "User cannot sign in with invalid credentials" do
      visit new_user_session_path
      
      fill_in "Email", with: "wrong@example.com"
      fill_in "Password", with: "wrongpassword"
      
      click_button "Sign in"
      
      expect(page).to have_content("Invalid Email or password.")
    end
  end
  
  describe "User profile management" do
    let(:user) { create(:user) }
    
    before { sign_in user }
    
    scenario "User can view their profile" do
      visit users_profile_path
      
      expect(page).to have_content("Profile")
      expect(page).to have_content(user.email)
    end
    
    scenario "User can edit their profile" do
      visit edit_users_profile_path
      
      fill_in "First name", with: "Updated"
      fill_in "Last name", with: "Name"
      select "UTC", from: "Time zone"
      
      click_button "Update Profile"
      
      expect(page).to have_content("Profile updated successfully.")
      expect(user.reload.first_name).to eq("Updated")
    end
  end
  
  describe "User settings" do
    let(:user) { create(:user) }
    
    before { sign_in user }
    
    scenario "User can update notification settings" do
      visit users_settings_path
      
      uncheck "Enable email notifications"
      fill_in "Daily reminder time", with: "09:00"
      
      click_button "Save Settings"
      
      expect(page).to have_content("Settings updated successfully.")
      expect(user.reload.email_notifications_enabled).to be_falsey
    end
  end
end
