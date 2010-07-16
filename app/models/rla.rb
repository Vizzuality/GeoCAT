class Rla < ActiveRecord::Base
  
  # attr_accessor :zoom, :specie, :center
  
  Mime::Type.register "text/rla", :rla
  
  belongs_to :user
  
  validates_presence_of :name, :data  
  
  #From the bucket key, create a temporary authenticated download url for the user
  def get_download_url
      
    end
    
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
