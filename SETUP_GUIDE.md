# Setup Guide - Habit Tracker Rails Application

Complete step-by-step guide to initialize the Rails project with all required dependencies and configurations.

---

## Prerequisites

Before starting, ensure you have installed:
- **Ruby** (latest stable version, check with `ruby -v`)
- **PostgreSQL** (check with `psql --version`)
- **Node.js** (for Tailwind CSS, check with `node -v`)
- **Bundler** (comes with Ruby, check with `bundle -v`)
- **Git** (check with `git --version`)

---

## Step 1: Create New Rails Project

### Command:
```bash
rails new . --database=postgresql --skip-test --skip-jbuilder --css=tailwind
```

### Explanation:
- `rails new .` - Creates new Rails app in current directory
- `--database=postgresql` - Configures PostgreSQL as database adapter
- `--skip-test` - Skips default Minitest (we'll use RSpec)
- `--skip-jbuilder` - We'll add it later if needed for API
- `--css=tailwind` - Adds Tailwind CSS automatically

### Expected Result:
- Rails project structure created
- `Gemfile` generated
- `config/database.yml` configured for PostgreSQL

---

## Step 2: Initialize Git Repository

### Commands:
```bash
git init
git add .
git commit -m "Initial Rails project setup"
```

### Explanation:
- Initialize Git repository for version control
- Initial commit with Rails boilerplate

### Expected Result:
- Git repository initialized
- All files tracked

---

## Step 3: Configure .gitignore

### Action:
Ensure `.gitignore` includes (Rails should generate this, but verify):

```
# Ignore database files
*.sqlite3
*.sqlite3-journal

# Ignore log files
log/*
tmp/*

# Ignore environment files
.env
.env.local
.env.*.local

# Ignore node modules (if using npm packages)
node_modules/

# Ignore IDE files
.vscode/
.idea/
*.swp
*.swo

# Ignore test coverage
coverage/

# Ignore Rails assets
/public/assets
/public/packs
/public/packs-test

# Ignore Sidekiq/Redis
*.rdb
```

---

## Step 4: Install Core Gems

### Action:
Add the following gems to `Gemfile`:

```ruby
# Authentication
gem 'devise'

# Authorization
gem 'pundit'

# Background Jobs
gem 'sidekiq'
gem 'sidekiq-cron'
gem 'redis', '~> 5.0'

# Testing
group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'capybara', '~> 3.39'
  gem 'factory_bot_rails', '~> 6.2'
  gem 'faker', '~> 3.0'
  gem 'shoulda-matchers', '~> 6.0'
  gem 'webmock', '~> 3.18'
  gem 'vcr', '~> 6.2'
  gem 'timecop', '~> 0.9'
end

# Code Quality
group :development do
  gem 'rubocop', '~> 1.57', require: false
  gem 'rubocop-rails', '~> 2.23', require: false
  gem 'rubocop-rspec', '~> 2.24', require: false
  gem 'brakeman', '~> 6.0', require: false
  gem 'bundler-audit', '~> 0.9', require: false
  gem 'bullet', '~> 7.0'
  gem 'annotate', '~> 3.2'
end

# Development Tools
group :development do
  gem 'pry-rails'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'letter_opener'
end

# Utilities
gem 'kaminari' # Pagination

# Hotwire (should be included by default, but verify)
gem 'turbo-rails'
gem 'stimulus-rails'

# API Support (for future iOS app)
gem 'jbuilder', '~> 2.11'
gem 'rack-cors'

# API Documentation (optional, for later)
# gem 'rswag'
```

### Command:
```bash
bundle install
```

### Explanation:
- Installs all required gems and their dependencies
- Creates `Gemfile.lock` with exact versions

### Expected Result:
- All gems installed successfully
- `Gemfile.lock` created/updated

---

## Step 5: Configure Database

### Commands:
```bash
# Create database
rails db:create

# Verify database connection
rails db:version
```

### Explanation:
- Creates development and test PostgreSQL databases
- Verifies connection is working

### Expected Result:
- Databases created successfully
- No connection errors

---

## Step 6: Configure Devise

### Commands:
```bash
# Generate Devise configuration
rails generate devise:install

# Generate User model with Devise
rails generate devise User

# Add custom fields to User model
# (We'll do this in migration later)
```

### Actions:
1. Create initializer file: `config/initializers/devise.rb` (auto-generated)
2. Add to `config/environments/development.rb`:
   ```ruby
   config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
   ```

3. Create `app/views/layouts/mailer.html.erb`:
   ```erb
   <!DOCTYPE html>
   <html>
     <head>
       <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
       <style>
         /* Email styles */
       </style>
     </head>
     <body>
       <%= yield %>
     </body>
   </html>
   ```

4. Create `app/views/layouts/mailer.text.erb`:
   ```erb
   <%= yield %>
   ```

### Explanation:
- Devise handles authentication (login, signup, password reset)
- User model will be extended with custom fields later

### Expected Result:
- Devise installed and configured
- User model created

---

## Step 7: Configure Pundit

### Commands:
```bash
# Generate Pundit installation
rails generate pundit:install
```

### Actions:
1. Verify `app/policies/application_policy.rb` was created
2. Add to `app/controllers/application_controller.rb`:
   ```ruby
   include Pundit::Authorization
   
   # Rescue from Pundit errors
   rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
   
   private
   
   def user_not_authorized
     flash[:alert] = "You are not authorized to perform this action."
     redirect_to(request.referrer || root_path)
   end
   ```

### Explanation:
- Pundit handles authorization (who can do what)
- Provides policy-based authorization system

### Expected Result:
- Pundit installed
- ApplicationPolicy created
- Authorization helpers available in controllers

---

## Step 8: Configure Sidekiq

### Actions:
1. Create `config/initializers/sidekiq.rb`:
   ```ruby
   Sidekiq.configure_server do |config|
     config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
   end
   
   Sidekiq.configure_client do |config|
     config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0') }
   end
   ```

2. Add to `config/application.rb`:
   ```ruby
   config.active_job.queue_adapter = :sidekiq
   ```

3. Create `config/schedule.rb` (for sidekiq-cron):
   ```ruby
   require 'sidekiq/cron/job'
   
   # Example scheduled jobs (add later as needed)
   # Sidekiq::Cron::Job.create(
   #   name: 'Daily Reminders',
   #   cron: '0 9 * * *',
   #   class: 'ReminderJob'
   # )
   ```

4. Add to `config/initializers/sidekiq.rb`:
   ```ruby
   # Load scheduled jobs
   schedule_file = "config/schedule.rb"
   if File.exist?(schedule_file) && Sidekiq.server?
     Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file)
   end
   ```

### Explanation:
- Sidekiq handles background job processing
- Redis required for job queue
- sidekiq-cron for scheduled/recurring jobs

### Note:
- Ensure Redis is running: `redis-server` or use Docker

### Expected Result:
- Sidekiq configured
- Background jobs can be enqueued

---

## Step 9: Configure RSpec

### Commands:
```bash
# Generate RSpec configuration
rails generate rspec:install
```

### Actions:
1. Update `spec/rails_helper.rb`:
   ```ruby
   # Add at the top
   require 'capybara/rails'
   require 'capybara/rspec'
   require 'factory_bot_rails'
   
   # Add to RSpec.configure block
   RSpec.configure do |config|
     # ... existing config ...
     
     # FactoryBot
     config.include FactoryBot::Syntax::Methods
     
     # Database Cleaner
     config.before(:suite) do
       DatabaseCleaner.strategy = :transaction
       DatabaseCleaner.clean_with(:truncation)
     end
     
     config.around(:each) do |example|
       DatabaseCleaner.cleaning do
         example.run
       end
     end
   end
   ```

2. Add `database_cleaner-active_record` to Gemfile:
   ```ruby
   group :test do
     gem 'database_cleaner-active_record', '~> 2.2'
   end
   ```

3. Create `spec/support/factory_bot.rb`:
   ```ruby
   RSpec.configure do |config|
     config.include FactoryBot::Syntax::Methods
   end
   ```

4. Create `spec/support/capybara.rb`:
   ```ruby
   Capybara.default_driver = :rack_test
   Capybara.javascript_driver = :selenium_chrome_headless
   Capybara.default_max_wait_time = 5
   ```

5. Create `spec/support/shoulda_matchers.rb`:
   ```ruby
   Shoulda::Matchers.configure do |config|
     config.integrate do |with|
       with.test_framework :rspec
       with.library :rails
     end
   end
   ```

### Commands:
```bash
bundle install
```

### Explanation:
- RSpec replaces Minitest for testing
- Capybara for integration/feature tests
- FactoryBot for test data
- DatabaseCleaner ensures clean test state

### Expected Result:
- RSpec configured
- Test helpers available

---

## Step 10: Configure RuboCop

### Commands:
```bash
# Generate RuboCop configuration
bundle exec rubocop --init
```

### Actions:
1. Create `.rubocop.yml` in project root:
   ```yaml
   require:
     - rubocop-rails
     - rubocop-rspec
   
   AllCops:
     TargetRubyVersion: 3.2
     NewCops: enable
     Exclude:
       - 'db/**/*'
       - 'bin/**/*'
       - 'config/**/*'
       - 'node_modules/**/*'
       - 'vendor/**/*'
   
   # Rails specific
   Rails:
     Enabled: true
   
   # RSpec specific
   RSpec:
     Enabled: true
   
   # Customize rules
   Metrics/BlockLength:
     Exclude:
       - 'spec/**/*'
       - 'config/routes.rb'
   
   Layout/LineLength:
     Max: 120
   
   Style/Documentation:
     Enabled: false
   ```

### Explanation:
- RuboCop enforces Ruby style guide
- Ensures consistent code style across project

### Test:
```bash
bundle exec rubocop
```

### Expected Result:
- RuboCop configuration created
- Can lint code (may show initial violations to fix)

---

## Step 11: Configure Brakeman

### Commands:
```bash
# Run Brakeman (no installation needed, just run)
bundle exec brakeman --init
```

### Actions:
1. Create `config/brakeman.ignore` (if needed, for known false positives)

### Test:
```bash
bundle exec brakeman
```

### Explanation:
- Brakeman scans for security vulnerabilities
- Should run regularly in CI/CD

### Expected Result:
- Brakeman configured
- Can scan for security issues

---

## Step 12: Configure Bullet (N+1 Detection)

### Actions:
1. Create `config/initializers/bullet.rb`:
   ```ruby
   if defined?(Bullet)
     Bullet.enable = true
     Bullet.alert = true
     Bullet.bullet_logger = true
     Bullet.console = true
     Bullet.rails_logger = true
   end
   ```

### Explanation:
- Detects N+1 query problems
- Helps optimize database queries

### Expected Result:
- Bullet will alert on N+1 queries in development

---

## Step 13: Configure Annotate

### Actions:
1. Create `lib/tasks/auto_annotate_models.rake` (if needed):
   - Annotate gem auto-generates this

2. Add to `lib/tasks/auto_annotate_models.rake`:
   ```ruby
   # Auto-annotate models on migration
   task :set_annotation_options do
     Annotate.set_defaults(
       'routes' => 'false',
       'position_in_routes' => 'before',
       'position_in_class' => 'before',
       'position_in_test' => 'before',
       'position_in_fixture' => 'before',
       'position_in_factory' => 'before',
       'show_indexes' => 'true',
       'simple_indexes' => 'false',
       'model_dir' => 'app/models',
       'include_version' => 'false',
       'require' => '',
       'exclude_tests' => 'true',
       'exclude_fixtures' => 'true',
       'ignore_model_sub_dir' => 'false',
       'skip_on_db_migrate' => 'false',
       'format_bare' => 'true',
       'format_rdoc' => 'false',
       'format_markdown' => 'false',
       'sort' => 'false',
       'force' => 'false',
       'classified_sort' => 'true',
       'trace' => 'false'
     )
   end
   ```

### Command:
```bash
bundle exec annotate
```

### Explanation:
- Auto-adds schema comments to models
- Keeps models documented with current schema

### Expected Result:
- Model files annotated with schema info

---

## Step 14: Configure Tailwind CSS

### Verification:
Check that `app/assets/stylesheets/application.tailwind.css` exists (should be created by `--css=tailwind`).

### Actions:
1. Verify Tailwind is imported in `app/assets/stylesheets/application.tailwind.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Ensure Tailwind is configured in `tailwind.config.js` (should exist)

3. Test compilation:
   ```bash
   bin/rails assets:precompile
   ```

### Explanation:
- Tailwind CSS for utility-first styling
- Already included via `--css=tailwind` flag

### Expected Result:
- Tailwind CSS working
- Can use Tailwind classes in views

---

## Step 15: Verify Hotwire (Turbo + Stimulus)

### Verification:

1. Check `Gemfile` includes:
   ```ruby
   gem 'turbo-rails'
   gem 'stimulus-rails'
   ```

2. Check `app/javascript/application.js` includes:
   ```javascript
   import "@hotwired/turbo-rails"
   import "controllers"
   ```

3. Check `app/javascript/controllers/index.js` exists:
   ```javascript
   import { application } from "controllers/application"
   ```

4. Verify `app/views/layouts/application.html.erb` includes:
   ```erb
   <%= javascript_importmap_tags %>
   <%= turbo_include_tags %>
   ```

### Explanation:
- Turbo enables SPA-like navigation without full page reloads
- Stimulus for JavaScript interactions
- Hotwire replaces need for heavy JS frameworks

### Expected Result:
- Turbo and Stimulus loaded
- Can use Turbo Streams and Stimulus controllers

---

## Step 16: Create Directory Structure

### Commands:
```bash
# Create service objects directory
mkdir -p app/services/habits
mkdir -p app/services/goals
mkdir -p app/services/entries
mkdir -p app/services/reports
mkdir -p app/services/notifications
mkdir -p app/services/analytics

# Create form objects directory
mkdir -p app/forms

# Create query objects directory
mkdir -p app/queries

# Create presenter objects directory
mkdir -p app/presenters

# Create jobs directory
mkdir -p app/jobs

# Create API controllers structure
mkdir -p app/controllers/api/v1
mkdir -p app/controllers/api/concerns
mkdir -p app/views/api/v1

# Create policies directory (should exist from Pundit)
mkdir -p app/policies

# Create concerns directory
mkdir -p app/models/concerns
mkdir -p app/controllers/concerns

# Create shared views
mkdir -p app/views/shared
mkdir -p app/views/components

# Create lib structure
mkdir -p lib/services
mkdir -p lib/modules
mkdir -p lib/utils
mkdir -p lib/errors

# Create spec structure
mkdir -p spec/services
mkdir -p spec/forms
mkdir -p spec/queries
mkdir -p spec/presenters
mkdir -p spec/jobs
mkdir -p spec/policies
mkdir -p spec/features
mkdir -p spec/factories
mkdir -p spec/support
```

### Explanation:
- Organizes code according to domain-driven architecture
- Separates concerns (services, queries, forms, presenters)
- API structure ready for future iOS app

### Expected Result:
- All directories created
- Ready for code organization

---

## Step 17: Create Base Classes

### Actions:

1. Create `app/services/base_service.rb`:
   ```ruby
   module Services
     class BaseService
       attr_reader :errors
       
       def initialize(*args)
         @errors = []
       end
       
       def call
         raise NotImplementedError, "#{self.class} must implement #call"
       end
       
       def success?
         @errors.empty?
       end
       
       protected
       
       def add_error(message)
         @errors << message
       end
       
       def add_errors(error_messages)
         @errors.concat(Array(error_messages))
       end
     end
   end
   ```

2. Create `app/controllers/api/base_controller.rb`:
   ```ruby
   module Api
     class BaseController < ApplicationController
       skip_before_action :verify_authenticity_token
       before_action :authenticate_api_user
       
       private
       
       def authenticate_api_user
         # Will be implemented with JWT in Stage 6
         head :unauthorized unless current_user
       end
       
       def render_success(data, status: :ok)
         render json: {
           success: true,
           data: data
         }, status: status
       end
       
       def render_error(errors, status: :unprocessable_entity)
         render json: {
           success: false,
           errors: errors
         }, status: status
       end
     end
   end
   ```

3. Create `app/controllers/api/v1/base_controller.rb`:
   ```ruby
   module Api
     module V1
       class BaseController < Api::BaseController
       end
     end
   end
   ```

4. Create `app/controllers/concerns/authenticatable.rb`:
   ```ruby
   module Authenticatable
     extend ActiveSupport::Concern
     
     included do
       before_action :authenticate_user!
     end
   end
   ```

### Explanation:
- Base classes provide common functionality
- Services have consistent interface
- API controllers ready for future implementation

### Expected Result:
- Base classes created
- Can inherit from them in new classes

---

## Step 18: Configure Routes

### Actions:
1. Update `config/routes.rb`:
   ```ruby
   Rails.application.routes.draw do
     devise_for :users
     
     root 'dashboard#index'
     
     resources :habits
     resources :goals
     resources :categories
     resources :daily_entries
     
     namespace :api do
       namespace :v1 do
         # API routes will be added in Stage 6
         # post 'auth/login', to: 'authentication#create'
         # resources :habits
       end
     end
   end
   ```

### Explanation:
- Defines application routes
- Devise routes for authentication
- API namespace prepared for future

### Expected Result:
- Routes configured
- Can access routes via `rails routes`

---

## Step 19: Create Basic Layout

### Actions:
1. Update `app/views/layouts/application.html.erb`:
   ```erb
   <!DOCTYPE html>
   <html>
     <head>
       <title>Habit Tracker</title>
       <meta name="viewport" content="width=device-width,initial-scale=1">
       <%= csrf_meta_tags %>
       <%= csp_meta_tag %>
       
       <%= stylesheet_link_tag "application", "data-turbo-track": "reload" %>
       <%= javascript_importmap_tags %>
       <%= turbo_include_tags %>
     </head>
     
     <body>
       <% if user_signed_in? %>
         <nav class="bg-gray-800 text-white p-4">
           <div class="container mx-auto flex justify-between items-center">
             <div>
               <%= link_to "Habit Tracker", root_path, class: "text-xl font-bold" %>
             </div>
             <div class="space-x-4">
               <%= link_to "Dashboard", root_path, class: "hover:text-gray-300" %>
               <%= link_to "Habits", habits_path, class: "hover:text-gray-300" %>
               <%= link_to "Goals", goals_path, class: "hover:text-gray-300" %>
               <%= link_to "Settings", edit_user_registration_path, class: "hover:text-gray-300" %>
               <%= link_to "Logout", destroy_user_session_path, method: :delete, class: "hover:text-gray-300" %>
             </div>
           </div>
         </nav>
       <% end %>
       
       <main class="container mx-auto p-4">
         <% if notice %>
           <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
             <%= notice %>
           </div>
         <% end %>
         
         <% if alert %>
           <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
             <%= alert %>
           </div>
         <% end %>
         
         <%= yield %>
       </main>
     </body>
   </html>
   ```

### Explanation:
- Basic layout with navigation
- Flash messages for notices/alerts
- Responsive with Tailwind CSS

### Expected Result:
- Layout renders correctly
- Navigation visible for authenticated users

---

## Step 20: Environment Variables

### Actions:
1. Add `dotenv-rails` to Gemfile:
   ```ruby
   gem 'dotenv-rails', groups: [:development, :test]
   ```

2. Create `.env` file (don't commit):
   ```bash
   # Database
   DATABASE_URL=postgresql://localhost/habit_tracker_development
   
   # Redis
   REDIS_URL=redis://localhost:6379/0
   
   # Secret Key (Rails generates this, but you can override)
   # SECRET_KEY_BASE=
   
   # Email (for development)
   SMTP_HOST=localhost
   SMTP_PORT=1025
   ```

3. Create `.env.example` (commit this):
   ```bash
   # Database
   DATABASE_URL=postgresql://localhost/habit_tracker_development
   
   # Redis
   REDIS_URL=redis://localhost:6379/0
   ```

4. Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   ```

### Explanation:
- Environment variables for configuration
- `.env.example` shows required variables without secrets

### Expected Result:
- Environment variables accessible via `ENV['KEY']`

---

## Step 21: Create README.md

### Actions:
1. Create/update `README.md` with setup instructions:

```markdown
# Habit Tracker

Personal habit and performance tracking application built with Ruby on Rails.

## Tech Stack

- Ruby on Rails (latest stable)
- PostgreSQL
- Hotwire (Turbo + Stimulus)
- Tailwind CSS
- Devise (Authentication)
- Pundit (Authorization)
- Sidekiq (Background Jobs)
- RSpec (Testing)

## Setup

1. Install dependencies:
   \`\`\`bash
   bundle install
   npm install  # if needed
   \`\`\`

2. Setup database:
   \`\`\`bash
   rails db:create
   rails db:migrate
   \`\`\`

3. Start services:
   \`\`\`bash
   # Terminal 1: Rails server
   rails server
   
   # Terminal 2: Redis (for Sidekiq)
   redis-server
   
   # Terminal 3: Sidekiq
   bundle exec sidekiq
   \`\`\`

4. Visit http://localhost:3000

## Testing

\`\`\`bash
bundle exec rspec
bundle exec rubocop
bundle exec brakeman
\`\`\`

## Development

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.
See [ARCHITECTURE.md](ARCHITECTURE.md) for architecture documentation.
See [DOMAIN_MODEL.md](DOMAIN_MODEL.md) for domain model.
See [ROADMAP.md](ROADMAP.md) for project roadmap.
```

### Expected Result:
- README with setup instructions

---

## Step 22: Verify Installation

### Commands:
```bash
# Check Rails version
rails -v

# Check if all gems installed
bundle check

# Test database connection
rails db:version

# Run RSpec (should pass - no tests yet)
bundle exec rspec

# Run RuboCop (may have violations to fix)
bundle exec rubocop

# Run Brakeman
bundle exec brakeman

# Start Rails server (test if it starts)
rails server
# Visit http://localhost:3000
# Should see Rails welcome page or error (if no root route)
```

### Expected Result:
- All tools working
- No critical errors
- Ready to start development

---

## Step 23: Initial Commit

### Commands:
```bash
git add .
git commit -m "Complete project setup with all dependencies and configurations"
```

---

## Directory Structure Summary

After setup, your project should have this structure:

```
app/
├── controllers/
│   ├── api/
│   │   ├── base_controller.rb
│   │   └── v1/
│   │       └── base_controller.rb
│   ├── concerns/
│   │   └── authenticatable.rb
│   └── application_controller.rb
├── models/
│   ├── concerns/
│   └── user.rb (Devise)
├── services/
│   ├── base_service.rb
│   ├── habits/
│   ├── goals/
│   ├── entries/
│   ├── reports/
│   ├── notifications/
│   └── analytics/
├── forms/
├── queries/
├── presenters/
├── jobs/
├── policies/
│   └── application_policy.rb (Pundit)
├── views/
│   ├── layouts/
│   │   ├── application.html.erb
│   │   └── mailer.html.erb
│   └── shared/
├── mailers/
└── assets/
    └── stylesheets/
        └── application.tailwind.css

config/
├── initializers/
│   ├── devise.rb
│   ├── pundit.rb
│   ├── sidekiq.rb
│   ├── bullet.rb
│   └── ...
├── routes.rb
├── database.yml
└── schedule.rb

lib/
├── services/
├── modules/
├── utils/
└── errors/

spec/
├── factories/
├── support/
│   ├── factory_bot.rb
│   ├── capybara.rb
│   ├── database_cleaner.rb
│   └── shoulda_matchers.rb
├── models/
├── controllers/
├── services/
├── features/
└── rails_helper.rb

.rubocop.yml
.gitignore
Gemfile
Gemfile.lock
README.md
```

---

## Next Steps

After completing this setup:

1. ✅ Proceed to **Stage 1** from ROADMAP.md:
   - Create database migrations for all models
   - Implement all ActiveRecord models
   - Set up associations and validations

2. ✅ Start with database migrations based on DOMAIN_MODEL.md

3. ✅ Begin implementing models according to architecture

---

## Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# If not, start PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
redis-server
# or with Docker: docker run -d -p 6379:6379 redis
```

### Bundle Install Errors
```bash
# Update bundler
gem update bundler

# Clear bundle cache
bundle clean --force
```

### Asset Compilation Errors
```bash
# Rebuild Tailwind
bin/rails tailwindcss:build

# Clear assets
rails assets:clobber
rails assets:precompile
```

---

## Quick Reference Commands

```bash
# Start development
rails server
redis-server
bundle exec sidekiq

# Run tests
bundle exec rspec

# Code quality
bundle exec rubocop
bundle exec brakeman
bundle exec bundler-audit

# Database
rails db:migrate
rails db:rollback
rails db:reset

# Annotate models
bundle exec annotate

# Generate
rails generate model Name
rails generate controller Name
rails generate migration Name

# Console
rails console
rails dbconsole
```

---

Setup complete! 🚀

