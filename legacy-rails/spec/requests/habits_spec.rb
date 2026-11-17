require 'rails_helper'

RSpec.describe "Habits", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/habits/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      get "/habits/show"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /new" do
    it "returns http success" do
      get "/habits/new"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /edit" do
    it "returns http success" do
      get "/habits/edit"
      expect(response).to have_http_status(:success)
    end
  end

end
