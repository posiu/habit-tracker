module Entries
  class CreateHabitEntryService < BaseService
    def initialize(daily_entry:, habit:, params: {})
      @daily_entry = daily_entry
      @habit = habit
      @params = params
    end

    def call
      form = HabitEntryForm.new(nil, habit: @habit, daily_entry: @daily_entry, attributes: form_attributes)

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
