require 'rails_helper'

RSpec.describe CategoryPolicy do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:category) { create(:category, user: user) }
  let(:other_category) { create(:category, user: other_user) }

  describe 'permissions' do
    it 'allows index for authenticated users' do
      expect(CategoryPolicy.new(user, Category).index?).to be true
    end

    it 'allows user to view their own category' do
      expect(CategoryPolicy.new(user, category).show?).to be true
    end

    it 'prevents user from viewing other users category' do
      expect(CategoryPolicy.new(user, other_category).show?).to be false
    end

    it 'allows user to create categories' do
      expect(CategoryPolicy.new(user, Category.new).create?).to be true
    end

    it 'allows user to update their own category' do
      expect(CategoryPolicy.new(user, category).update?).to be true
    end

    it 'prevents user from updating other users category' do
      expect(CategoryPolicy.new(user, other_category).update?).to be false
    end

    it 'allows user to delete category without dependencies' do
      expect(CategoryPolicy.new(user, category).destroy?).to be true
    end

    it 'prevents deletion of category with habits' do
      create(:habit, user: user, category: category)
      expect(CategoryPolicy.new(user, category).destroy?).to be false
    end

    it 'prevents deletion of category with goals' do
      create(:goal, user: user, category: category)
      expect(CategoryPolicy.new(user, category).destroy?).to be false
    end
  end

  describe 'Scope' do
    it 'returns only users categories' do
      create(:category, user: user)
      create(:category, user: other_user)
      
      scope = CategoryPolicy::Scope.new(user, Category).resolve
      expect(scope).to include(category)
      expect(scope).not_to include(other_category)
    end
  end
end
