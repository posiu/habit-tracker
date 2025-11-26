module Categories
  class UpdateService < BaseService
    def initialize(category:, params:)
      @category = category
      @params = params
      @form = CategoryForm.new(category, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save(user: @category.user)
        success(@form.category)
      else
        failure(@form.category.errors)
      end
    end

    private

    attr_reader :category, :params, :form
  end
end
