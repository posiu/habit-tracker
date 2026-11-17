require 'rails_helper'

RSpec.describe "DailyEntries", type: :request do
  describe "GET /show" do
    it "returns http success" do
      get "/daily_entries/show"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /new" do
    it "returns http success" do
      get "/daily_entries/new"
      expect(response).to have_http_status(:success)
    end
  end

end
