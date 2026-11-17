module Categories
  class DeleteService < BaseService
    def initialize(category:)
      @category = category
    end

    def call
      # Check if category has associated habits or goals
      if category_has_dependencies?
        return failure(["Cannot delete category with associated habits or goals"])
      end

      if @category.destroy
        success(@category)
      else
        failure(@category.errors)
      end
    end

    private

    attr_reader :category

    def category_has_dependencies?
      @category.habits.exists? || @category.goals.exists?
    end
  end
end
