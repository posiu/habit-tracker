module Habits
  class UpdateService < BaseService
    def initialize(habit:, params:)
      @habit = habit
      @params = params
      @form = HabitForm.new(habit.user, habit, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save
        success(@form.habit)
      else
        failure(@form.habit.errors)
      end
    end

    private

    attr_reader :habit, :params, :form
  end
end
