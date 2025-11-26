require 'rails_helper'

RSpec.describe "Users::Settings", type: :request do
  describe "GET /show" do
    it "returns http success" do
      get "/users/settings/show"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update" do
    it "returns http success" do
      get "/users/settings/update"
      expect(response).to have_http_status(:success)
    end
  end

end
