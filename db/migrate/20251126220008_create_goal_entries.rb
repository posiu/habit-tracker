class CreateGoalEntries < ActiveRecord::Migration[6.1]
  def change
    create_table :goal_entries do |t|
      t.references :daily_entry, null: false, foreign_key: true, index: true
      t.references :goal, null: false, foreign_key: true, index: true
      t.decimal :value, precision: 12, scale: 4
      t.boolean :boolean_value
      t.boolean :is_increment, default: true
      t.text :notes

      t.timestamps
    end
    
    add_index :goal_entries, [:daily_entry_id, :goal_id], unique: true
    add_index :goal_entries, [:goal_id, :created_at]
    add_index :goal_entries, [:daily_entry_id, :goal_id, :boolean_value], name: 'index_goal_entries_on_daily_goal_boolean'
  end
end
