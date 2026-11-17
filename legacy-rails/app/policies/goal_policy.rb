class GoalPolicy < ApplicationPolicy
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
    owner?
  end

  def complete?
    owner?
  end

  private

  def owner?
    record.user == user
  end

  class Scope < Scope
    def resolve
      scope.where(user: user)
    end
  end
end
