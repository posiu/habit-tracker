// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

Rails.start()
Turbolinks.start()
ActiveStorage.start()

// User menu dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
  initializeDropdown();
});

// Also initialize on Turbolinks page loads
document.addEventListener('turbolinks:load', function() {
  initializeDropdown();
});

function initializeDropdown() {
  const userMenuButton = document.getElementById('user-menu-button');
  const userMenu = document.getElementById('user-menu');
  
  if (userMenuButton && userMenu) {
    // Remove existing listeners to prevent duplicates
    userMenuButton.replaceWith(userMenuButton.cloneNode(true));
    const newUserMenuButton = document.getElementById('user-menu-button');
    
    newUserMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      userMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!newUserMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add('hidden');
      }
    });
  }
}