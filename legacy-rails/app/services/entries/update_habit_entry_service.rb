module Entries
  class UpdateHabitEntryService < BaseService
    def initialize(habit_entry:, habit:, daily_entry:, params: {})
      @habit_entry = habit_entry
      @habit = habit
      @daily_entry = daily_entry
      @params = params
    end

    def call
      form = HabitEntryForm.new(@habit_entry, habit: @habit, daily_entry: @daily_entry, attributes: form_attributes)

      if form.save
        Result.new(true, form.habit_entry, nil)
      else
        Result.new(false, nil, form.errors)
      end
    end

    private

    def form_attributes
      {
        value: @params[:value],
        completed: @params[:completed],
        notes: @params[:notes]
      }
    end
  end
end
