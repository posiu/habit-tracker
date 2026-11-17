class CreateGoals < ActiveRecord::Migration[6.1]
  def change
    create_table :goals do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.references :category, null: true, foreign_key: true, index: true
      t.string :name, limit: 200, null: false
      t.text :description
      t.string :goal_type, limit: 50, default: 'target_value'
      t.string :unit, limit: 50
      t.date :start_date, null: false
      t.date :target_date
      t.boolean :is_active, default: true, null: false
      t.datetime :completed_at
      t.integer :position

      t.timestamps
    end
    
    add_index :goals, [:user_id, :is_active]
    add_index :goals, [:user_id, :target_date]
    add_index :goals, [:user_id, :completed_at]
    add_index :goals, :created_at
    
    add_check_constraint :goals, 'target_date IS NULL OR target_date >= start_date', name: 'goals_target_date_after_start_date'
  end
end
