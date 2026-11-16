Rails.application.routes.draw do
  devise_for :users
  
  namespace :users do
    resource :profile, only: [:show, :edit, :update], controller: 'profiles'
    resource :settings, only: [:show, :update], controller: 'settings'
  end

  # Root route - redirect to dashboard (authentication handled by controller)
  root 'dashboard#index'

  # Liveness/readiness probe for load balancers (no auth).
  get 'up', to: 'health#show'

  # Sidekiq monitoring UI, admins only.
  require 'sidekiq/web'
  authenticate :user, ->(user) { user.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

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
      post 'auth/login', to: 'authentication#create'
      post 'auth/refresh', to: 'authentication#refresh'
      delete 'auth/logout', to: 'authentication#destroy'

      resource :profile, only: [:show, :update]
      resources :categories
      resources :habits do
        member { patch :archive }
      end
      resources :goals do
        member { patch :complete }
      end
      resources :daily_entries do
        resources :habit_entries, only: :create
        resources :goal_entries, only: :create
      end
      resources :habit_entries, only: [:update, :destroy]
      resources :goal_entries, only: [:update, :destroy]

      get 'dashboard', to: 'dashboard#show'
      get 'dashboard/heatmap', to: 'dashboard#heatmap'
      get 'dashboard/stats', to: 'dashboard#stats'
      resources :reports, only: [:index, :show]
    end
  end
end
