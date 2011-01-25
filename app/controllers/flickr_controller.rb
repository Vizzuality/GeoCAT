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
        @list = flickr.photos.search(
          :text     => name_specie,
          :extras   => 'geo,tags,owner_name,machine_tags,description',
          :has_geo  => '1',
          :per_page => '50'
        )

        # Filtering the json answer
        json_only = @list.map do |photo|
          {
            'latitude'                      => photo['latitude'],
            'longitude'                     => photo['longitude'],
            'coordinateUncertaintyInMeters' => photo['accuracy'],
            "occurrenceDetails"             => FlickRaw.url_photopage(photo),
            "collector"                     => photo['ownername'],
            "active"                        => true,
            "removed"                       => false,
            "catalogue_id"                  => "flickr_" + photo['id'],
            "kind"                          => "flickr",
            "occurrenceRemarks"             => "#{photo['title']} / #{photo['description']}"
          }
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
