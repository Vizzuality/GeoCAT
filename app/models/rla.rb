class Rla < ActiveRecord::Base
  # attr_accessor :zoom, :specie, :center
  
  belongs_to :user
  
  validates_presence_of :name, :data  
    
    
  # def self.save
  #     
  #     name =  rlas['datafile'].original_filename
  #     directory = "public/data"
  #     # create the file path
  #     path = File.join(directory, name)
  #     # write the file
  #     File.open(path, "wb") { |f| f.write(rlas['datafile'].read) }
  # 
  # end
  
  
end
