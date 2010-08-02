class FlickrController < ApplicationController
    
  #   DATA TO DEFINE:
        # - collector
        # - zoom level
        
        
  def search
  
    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      
      #   Search with ?q= in url => 'q' insead of :q (changing the routes file)
      
      if !params[:q].empty? or !params[:q].nil?
        name_specie = params[:q]
        FlickRaw.api_key="ba21020f518d59d9d74b81af71b37e7c"
        FlickRaw.shared_secret="35b1704d1c3e1e6d"
        
        frob = flickr.auth.getFrob
        @list = flickr.photos.search(:tags=>name_specie,:extras=>'geo,tags', :has_geo=>'1', :per_page => '50')

        # Filtering the json answer
         json_only = []
         @list.each do |photo|
           
           json_only << {:latitude => photo.latitude.to_s, :longitude => photo.longitude.to_s, :accuracy => photo.accuracy, "collector" => "111", "active" => "true", "removed" => "false",
             "catalogue_id" => "flickr_" + photo.id, "kind" => "flickr" }
         end
         
         @json_head = [{"id"=>"flickr_id","name"=>"flickr","points"=>json_only, "specie"=> name_specie, "zoom"=>"3"}]
         # end to filter
        
        render :json =>@json_head
        
      else
        render :json => "{'Status':'Error'}"
      end
    
    end
   
  end
end
