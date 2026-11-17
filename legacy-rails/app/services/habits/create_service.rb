module Habits
  class CreateService < BaseService
    def initialize(user:, params:)
      @user = user
      @params = params
      @form = HabitForm.new(user, nil, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save
        habit = @form.habit
        # Schedule streak calculation for new habit
        StreakCalculationJob.perform_async(habit.id) if defined?(StreakCalculationJob)
        success(habit)
      else
        failure(@form.habit.errors)
      end
    end

    private

    attr_reader :user, :params, :form
  end
end
