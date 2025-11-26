class CreateHabitEntries < ActiveRecord::Migration[6.1]
  def change
    create_table :habit_entries do |t|
      t.references :daily_entry, null: false, foreign_key: true, index: true
      t.references :habit, null: false, foreign_key: true, index: true
      t.boolean :boolean_value
      t.decimal :numeric_value, precision: 12, scale: 4
      t.integer :time_value # Time in seconds
      t.boolean :completed, default: false, null: false
      t.text :notes

      t.timestamps
    end
    
    add_index :habit_entries, [:daily_entry_id, :habit_id], unique: true
    add_index :habit_entries, [:habit_id, :completed]
    add_index :habit_entries, [:daily_entry_id, :completed]
    add_index :habit_entries, [:habit_id, :created_at]
  end
end
