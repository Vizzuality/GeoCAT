class AddUserToGeocat < ActiveRecord::Migration
  def self.up
    add_column :geocat, :user_id, :integer
  end

  def self.down
    remove_column :geocat, :user_id
  end
end
