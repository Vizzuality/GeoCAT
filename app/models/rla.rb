class Rla < ActiveRecord::Base
  # attr_accessor :zoom, :specie, :center
  
  belongs_to :user
  
  validates_presence_of :name, :data  
  
  #From the bucket key, create a temporary authenticated download url for the user
  def get_download_url
      if url.present?
        AWS::S3::Base.establish_connection!(
                :access_key_id     => ENV['S3_KEY'],
                :secret_access_key => ENV['S3_SECRET']
        )
    
        AWS::S3::S3Object.url_for(
                url,
                UserUploadBucket
        )
      else
        ""
      end
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
