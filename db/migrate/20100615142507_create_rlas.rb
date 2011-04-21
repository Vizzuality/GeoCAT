class CreateGeocat < ActiveRecord::Migration
  def self.up
    create_table :geocat do |t|
      t.string :name
      t.text :data      
      t.timestamps
      t.integer :zoom
      t.text :specie 
      t.text :center
    end
  end
  
  def self.down
    drop_table :geocat
  end
end
