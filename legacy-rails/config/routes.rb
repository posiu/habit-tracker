Rails.application.routes.draw do
  devise_for :users
  
  namespace :users do
    resource :profile, only: [:show, :edit, :update], controller: 'profiles'
    resource :settings, only: [:show, :update], controller: 'settings'
  end

  # Root route - redirect to dashboard (authentication handled by controller)
  root 'dashboard#index'

  resources :habits do
    member do
      patch :archive
    end
  end
  resources :goals do
    member do
      patch :complete
    end
  end
  resources :categories
  resources :daily_entries do
    resources :habit_entries, only: [:create, :update, :destroy]
    resources :goal_entries, only: [:create, :update, :destroy]
  end

  # keep top-level entry routes for backward compatibility
  resources :habit_entries, only: [:create, :update, :destroy]
  resources :goal_entries, only: [:create, :update, :destroy]
  resources :reports, only: [:index, :show]

  namespace :api do
    namespace :v1 do
      # API routes will be added in Stage 6
      # post 'auth/login', to: 'authentication#create'
      # resources :habits
    end
  end
end

