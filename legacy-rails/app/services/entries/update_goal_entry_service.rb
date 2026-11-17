module Entries
  class UpdateGoalEntryService < BaseService
    def initialize(goal_entry:, goal:, daily_entry:, params: {})
      @goal_entry = goal_entry
      @goal = goal
      @daily_entry = daily_entry
      @params = params
    end

    def call
      form = GoalEntryForm.new(@goal_entry, goal: @goal, daily_entry: @daily_entry, attributes: form_attributes)

      if form.save
        Result.new(true, form.goal_entry, nil)
      else
        Result.new(false, nil, form.errors)
      end
    end

    private

    def form_attributes
      {
        value: @params[:value],
        boolean_value: @params[:boolean_value],
        is_increment: @params[:is_increment] == false ? false : true,
        notes: @params[:notes]
      }
    end
  end
end
