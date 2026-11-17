module Goals
  class UpdateService < BaseService
    def initialize(goal:, params:)
      @goal = goal
      @params = params
      @form = GoalForm.new(goal.user, goal, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save
        success(@form.goal)
      else
        failure(@form.goal.errors)
      end
    end

    private

    attr_reader :goal, :params, :form
  end
end
