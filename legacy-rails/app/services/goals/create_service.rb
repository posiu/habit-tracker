module Goals
  class CreateService < BaseService
    def initialize(user:, params:)
      @user = user
      @params = params
      @form = GoalForm.new(user, nil, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save
        goal = @form.goal
        # Schedule goal metric update job
        GoalMetricUpdateJob.perform_async(goal.id) if defined?(GoalMetricUpdateJob)
        success(goal)
      else
        failure(@form.goal.errors)
      end
    end

    private

    attr_reader :user, :params, :form
  end
end
