class FlickrController < ApplicationController

  #   DATA TO DEFINE:
        # - collector
        # - zoom level


  def search

    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      if !params[:q].empty? or !params[:q].nil?
        q = params[:q]
        response = Typhoeus.get("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d5446dd5567d62b2ac43d0ec66631668&text=#{q}+&has_geo=1&per_page=5000&format=json&extras=geo&nojsoncallback=1", headers: { "Accept" => "application/json" })

        json_only = JSON.parse(response.body)['photos']['photo'].map do |photo|
          {
            'latitude'                      => photo['latitude'],
            'longitude'                     => photo['longitude'],
            'coordinateUncertaintyInMeters' => 15000,
            "collector"                     => photo['owner'],
            "geocat_active"                 => true,
            "geocat_removed"                => false,
            "geocat_alias"                  => CGI.unescape(q),
            "catalogue_id"                  => "flickr_"+ q + "_" + photo['id'],
            "geocat_kind"                   => "flickr",
            "occurrenceRemarks"             => "#{photo['title']} / #{photo['description']}",
            "geocat_query"                  => CGI.unescape(q)
          }
        end

        @json_head = [{"id"=>"flickr_id","name"=>"flickr","points"=>json_only, "specie"=> q, "zoom"=>"3"}]
        render :json =>@json_head

      else
        render :json => "{'Status':'Error'}"
      end

    end

  end
end
