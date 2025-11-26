require 'rails_helper'

RSpec.describe UserPolicy, type: :policy do
  subject { described_class }

  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  permissions :show? do
    it "grants access if user is the same as record" do
      expect(subject).to permit(user, user)
    end

    it "denies access if user is different from record" do
      expect(subject).not_to permit(user, other_user)
    end
  end

  permissions :update? do
    it "grants access if user is the same as record" do
      expect(subject).to permit(user, user)
    end

    it "denies access if user is different from record" do
      expect(subject).not_to permit(user, other_user)
    end
  end

  permissions :destroy? do
    it "grants access if user is the same as record" do
      expect(subject).to permit(user, user)
    end

    it "denies access if user is different from record" do
      expect(subject).not_to permit(user, other_user)
    end
  end
end
