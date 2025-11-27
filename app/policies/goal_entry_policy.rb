class GoalEntryPolicy < ApplicationPolicy
  def create?
    # User can create goal entry for their own daily entry
    record.daily_entry.user == user
  end

  def update?
    # User can update their own goal entry
    record.daily_entry.user == user
  end

  def destroy?
    # User can delete their own goal entry
    record.daily_entry.user == user
  end

  private

  def owner?
    record.daily_entry.user == user
  end

  class Scope < Scope
    def resolve
      scope.joins(:daily_entry).where(daily_entries: { user_id: user.id })
    end
  end
end
