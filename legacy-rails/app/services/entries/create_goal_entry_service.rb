module Entries
  class CreateGoalEntryService < BaseService
    def initialize(daily_entry:, goal:, params: {})
      @daily_entry = daily_entry
      @goal = goal
      @params = params
    end

    def call
      form = GoalEntryForm.new(nil, goal: @goal, daily_entry: @daily_entry, attributes: form_attributes)

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
