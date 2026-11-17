RSpec.configure do |config|
  config.include Devise::Test::IntegrationHelpers, type: :feature
  config.include Devise::Test::ControllerHelpers, type: :controller

  config.include Warden::Test::Helpers
end

Warden.on_block do |proxy|
  proxy.redirect_to new_user_session_path
end
