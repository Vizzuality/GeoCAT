class FlickrController < ApplicationController

  #   DATA TO DEFINE:
        # - collector
        # - zoom level


  def search

    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      if !params[:q].empty? or !params[:q].nil?
        @name_specie = params[:q]
        response = Typhoeus.get("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=536b7dd52fb0348e3cb6e94d02f94b95&text=#{@name_specie}+&has_geo=1&per_page=5000&format=json&nojsoncallback=1", headers: { "Accept" => "application/json" })

         puts JSON.parse(response.body)
         # end to filter

        render :json =>JSON.parse(response.body)

      else
        render :json => "{'Status':'Error'}"
      end

    end

  end
end
