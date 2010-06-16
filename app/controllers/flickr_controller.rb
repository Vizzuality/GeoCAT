class FlickrController < ApplicationController
  def search
    
    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      if !params['q'].empty? or !params['q'].nil?
        q = params['q']
        FlickRaw.api_key="ba21020f518d59d9d74b81af71b37e7c"
        FlickRaw.shared_secret="35b1704d1c3e1e6d"
        
        frob = flickr.auth.getFrob
        @list = flickr.photos.search(:tags=>q,:extras=>'geo,tags', :has_geo=>'1')
        
        render :json =>@list
      else
        render :json => "{'Status':'Error'}"
      end
    end
   
  end
end
