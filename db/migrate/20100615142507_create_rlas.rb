class CreateRlas < ActiveRecord::Migration
  def self.up
    create_table :rlas do |t|
      t.string :name
      t.text :data

      t.timestamps
    end
  end

  def self.down
    drop_table :rlas
  end
end
