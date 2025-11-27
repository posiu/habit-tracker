module Habits
  class DeleteService < BaseService
    def initialize(habit:)
      @habit = habit
    end

    def call
      if @habit.destroy
        success(@habit)
      else
        failure(@habit.errors)
      end
    end

    private

    attr_reader :habit
  end
end
