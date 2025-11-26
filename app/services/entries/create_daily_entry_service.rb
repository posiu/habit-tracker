module Entries
  class CreateDailyEntryService < BaseService
    def initialize(user:, params:)
      @user = user
      @params = params
      @form = DailyEntryForm.new(nil, user: user, attributes: params)
    end

    def call
      return failure(@form.errors) unless @form.valid?

      if @form.save
        success(@form.daily_entry)
      else
        failure(@form.daily_entry.errors)
      end
    end

    private

    attr_reader :user, :params, :form
  end
end
