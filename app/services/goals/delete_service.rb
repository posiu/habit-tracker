module Goals
  class DeleteService < BaseService
    def initialize(goal:)
      @goal = goal
    end

    def call
      if @goal.destroy
        success(@goal)
      else
        failure(@goal.errors)
      end
    end

    private

    attr_reader :goal
  end
end
