class FlickrController < ApplicationController
  def search
    
    if params['q'] != NIL
      search_text = params['q']
      FlickRaw.api_key="ba21020f518d59d9d74b81af71b37e7c"
      FlickRaw.shared_secret="35b1704d1c3e1e6d"
      frob = flickr.auth.getFrob
      @list = flickr.photos.getRecent
      render :json =>@list
    else
      puts "jamon"
    end 
    
    

  end
end
