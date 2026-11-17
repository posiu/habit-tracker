class GoalQuery
  def initialize(user)
    @user = user
  end

  def active
    @user.goals.where(is_active: true).ordered
  end

  def completed
    @user.goals.completed.ordered
  end

  def incomplete
    @user.goals.incomplete.ordered
  end

  def by_category(category_id)
    active.where(category_id: category_id)
  end

  def by_type(goal_type)
    active.where(goal_type: goal_type).ordered
  end

  def with_deadlines
    active.with_deadlines.ordered
  end

  def approaching_deadline
    active.approaching_deadline.ordered
  end

  def all
    @user.goals.ordered
  end

  private

  attr_reader :user
end
