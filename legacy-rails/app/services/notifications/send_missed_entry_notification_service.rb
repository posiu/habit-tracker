module Notifications
  class SendMissedEntryNotificationService < BaseService
    def initialize(user, date)
      @user = user
      @date = date
    end

    def call
      return failure('Entry exists') if entry_exists?
      MissedEntryMailer.with(user: user, date: date).missed_entry.deliver_later
      success(true)
    end

    private

    attr_reader :user, :date

    def entry_exists?
      user.daily_entries.exists?(entry_date: date)
    end
  end
end
