module Api
  class BaseController < ActionController::API
    include Pundit::Authorization
    include Api::Responsable
    include Api::ErrorHandler
    include Api::Authenticatable
  end
end
