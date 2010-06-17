class FlickrController < ApplicationController
    
  def search
  
    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      
      #   Search with ?q= in url => 'q' insead of :q (changing the routes file)
      
      if !params[:q].empty? or !params[:q].nil?
        a = params[:q]
        FlickRaw.api_key="ba21020f518d59d9d74b81af71b37e7c"
        FlickRaw.shared_secret="35b1704d1c3e1e6d"
        
        frob = flickr.auth.getFrob
        @list = flickr.photos.search(:tags=>a,:extras=>'geo,tags', :has_geo=>'1')
        
        
        # Filtering the json answer
         json_only = []
         @list.each do |photo|
           json_only << {:id => photo.id, :latitude => photo.latitude, :longitude => photo.longitude, :accuracy => photo.accuracy}
         end
       # end to filter
        
        render :json =>json_only
        
      else
        render :json => "{'Status':'Error'}"
      end
    
    end
   
  end
end
