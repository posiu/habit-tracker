class AddJwtJtiToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :jwt_jti, :string
    add_index :users, :jwt_jti
  end
end
