module Entries
  # Creates the user's entry for a date. Only one entry per user and day is
  # allowed, so when one already exists it is updated instead (idempotent).
  class CreateDailyEntryService < BaseService
    def initialize(user:, params:)
      @user = user
      @params = params
    end

    def call
      form = DailyEntryForm.new(existing_entry, user: user, attributes: params)

      if form.save
        success(form.daily_entry)
      else
        failure(form.errors.any? ? form.errors : form.daily_entry.errors)
      end
    end

    private

    attr_reader :user, :params

    def existing_entry
      date = params[:entry_date]
      return nil if date.blank?

      parsed = date.respond_to?(:to_date) ? date.to_date : Date.parse(date.to_s)
      user.daily_entries.find_by(entry_date: parsed)
    rescue ArgumentError, TypeError
      nil
    end
  end
end
