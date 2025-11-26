module Entries
  class UpdateDailyEntryService < BaseService
    def initialize(daily_entry:, params:)
      @daily_entry = daily_entry
      @params = params
      @form = DailyEntryForm.new(daily_entry, user: daily_entry.user, attributes: params)
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

    attr_reader :daily_entry, :params, :form
  end
end
