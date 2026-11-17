class CreateHabits < ActiveRecord::Migration[6.1]
  def change
    create_table :habits do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.references :category, null: true, foreign_key: true, index: true
      t.string :name, limit: 200, null: false
      t.text :description
      t.string :habit_type, limit: 50, default: 'boolean'
      t.string :unit, limit: 50
      t.decimal :target_value, precision: 10, scale: 2
      t.boolean :is_active, default: true, null: false
      t.date :start_date, null: false
      t.date :end_date
      t.boolean :reminder_enabled, default: false
      t.integer :reminder_days, array: true, default: []
      t.integer :position

      t.timestamps
    end
    
    add_index :habits, [:user_id, :is_active]
    add_index :habits, [:user_id, :start_date]
    add_index :habits, :created_at
    
    add_check_constraint :habits, 'end_date IS NULL OR end_date >= start_date', name: 'habits_end_date_after_start_date'
  end
end
