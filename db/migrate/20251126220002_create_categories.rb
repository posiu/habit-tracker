class CreateCategories < ActiveRecord::Migration[6.1]
  def change
    create_table :categories do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :name, limit: 100, null: false
      t.string :color, limit: 7 # Hex color code
      t.string :icon, limit: 50
      t.text :description
      t.integer :position

      t.timestamps
    end
    
    add_index :categories, [:user_id, :name], unique: true
    add_index :categories, :position
  end
end
