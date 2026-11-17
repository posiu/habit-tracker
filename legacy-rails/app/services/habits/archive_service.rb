module Habits
  class ArchiveService < BaseService
    def initialize(habit:)
      @habit = habit
    end

    def call
      if @habit.archive!
        success(@habit)
      else
        failure(@habit.errors)
      end
    end

    private

    attr_reader :habit
  end
end
