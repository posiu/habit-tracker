module Categories
  class CreateService < BaseService
    def initialize(user:, params:)
      @user = user
      @params = params
      @form = CategoryForm.new(nil, params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save(user: @user)
        success(@form.category)
      else
        failure(@form.category.errors)
      end
    end

    private

    attr_reader :user, :params, :form
  end
end
