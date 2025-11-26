class AddCustomFieldsToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :first_name, :string, limit: 100
    add_column :users, :last_name, :string, limit: 100
    add_column :users, :time_zone, :string, limit: 50, default: 'UTC'
    add_column :users, :locale, :string, limit: 10, default: 'en'
    add_column :users, :email_notifications_enabled, :boolean, default: true
    add_column :users, :reminder_time, :time
    
    add_index :users, :created_at
  end
end
