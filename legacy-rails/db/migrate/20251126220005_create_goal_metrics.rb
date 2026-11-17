class CreateGoalMetrics < ActiveRecord::Migration[6.1]
  def change
    create_table :goal_metrics do |t|
      t.references :goal, null: false, foreign_key: true, index: { unique: true }
      t.integer :days_doing_target
      t.integer :days_without_target
      t.decimal :target_value, precision: 12, scale: 4
      t.date :target_date
      t.decimal :current_value, precision: 12, scale: 4, default: 0
      t.integer :current_days_doing, default: 0
      t.integer :current_days_without, default: 0

      t.timestamps
    end
    
    add_index :goal_metrics, :target_date
  end
end
