class AddUserToRlas < ActiveRecord::Migration
  def self.up
    add_column :rlas, :user_id, :integer
  end

  def self.down
    remove_column :rlas, :user_id
  end
end
