class CreateDailyEntries < ActiveRecord::Migration[6.1]
  def change
    create_table :daily_entries do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.date :entry_date, null: false
      t.text :notes
      t.integer :mood # 1-5 scale

      t.timestamps
    end
    
    add_index :daily_entries, [:user_id, :entry_date], unique: true
    add_index :daily_entries, :entry_date
    add_index :daily_entries, [:user_id, :entry_date], order: { entry_date: :desc }, name: 'index_daily_entries_on_user_recent'
  end
end
