class AddReportFrequencyToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :report_frequency, :string, default: 'none', null: false
  end
end
