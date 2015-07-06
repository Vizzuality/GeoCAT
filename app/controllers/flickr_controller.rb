class FlickrController < ApplicationController

  #   DATA TO DEFINE:
        # - collector
        # - zoom level


  def search
    @points = []
    if params.empty?
      render :json => "{'Status':'Error'}"
    else
      if !params[:q].empty? or !params[:q].nil?
        q = params[:q]
        for i in 1..4
          response = Typhoeus.get("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d5446dd5567d62b2ac43d0ec66631668&text=#{q}+&has_geo=1&perpage=250&format=json&extras=geo&nojsoncallback=1&page=#{i}", headers: { "Accept" => "application/json" })
          populate(response, q)
        end

        @json_head = [{"id"=>"flickr_id","name"=>"flickr","points"=>@points, "specie"=> q, "zoom"=>"3"}]
        render :json =>@json_head

      else
        render :json => "{'Status':'Error'}"
      end
    end

  end
  # end SEARCH

  def populate(response, q)
    JSON.parse(response.body)['photos']['photo'].map do |photo|
      @points.push({
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
          "seasonal"                      => photo['seasonal'] || 'Resident',
          "origin"                        => photo['origin'] || 'N/A',
          "presence"                      => photo['presence'] || 'N/A',
          "geocat_query"                  => CGI.unescape(q)
        })
    end
  end
end
