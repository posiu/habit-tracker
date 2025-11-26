require 'rails_helper'

RSpec.describe "Users::Profiles", type: :request do
  describe "GET /show" do
    it "returns http success" do
      get "/users/profiles/show"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /edit" do
    it "returns http success" do
      get "/users/profiles/edit"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update" do
    it "returns http success" do
      get "/users/profiles/update"
      expect(response).to have_http_status(:success)
    end
  end

end
