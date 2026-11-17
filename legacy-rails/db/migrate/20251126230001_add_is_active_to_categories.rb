class AddIsActiveToCategories < ActiveRecord::Migration[6.1]
  def change
    add_column :categories, :is_active, :boolean, default: true, null: false
    
    # Set existing categories to active
    Category.reset_column_information
    Category.update_all(is_active: true)
  end
end
