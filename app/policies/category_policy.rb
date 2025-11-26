class CategoryPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    owner?
  end

  def create?
    true
  end

  def new?
    create?
  end

  def update?
    owner?
  end

  def edit?
    update?
  end

  def destroy?
    owner? && !has_dependencies?
  end

  private

  def owner?
    record.user == user
  end

  def has_dependencies?
    record.habits.exists? || record.goals.exists?
  end

  class Scope < Scope
    def resolve
      scope.where(user: user)
    end
  end
end
