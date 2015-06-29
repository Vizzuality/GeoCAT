class InaturalistController < ApplicationController

    # begin SEARCH
    def search

      render :json => "{'Status':'Error'}" and return if params.empty?
      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]

      require 'open-uri'

      inaturalist_url = URI.escape(
        "http://www.inaturalist.org/observations.json?q=#{q}" +
        "&per_page=500&page=1&has[]=geo"
      )
      open(inaturalist_url) {|f| @list =  f.read }
      @list = JSON.parse(@list)

      # Filtering the json answer
      json_only = @list.map do |occ|
        {
          'latitude'                      => occ['latitude'],
          'longitude'                     => occ['longitude'],
          'coordinateUncertaintyInMeters' => occ['positional_accuracy'] || 15000,
          'occurrenceDetails'             => occ['uri'],
          'collector'                     => occ['user_login'],
          'locality'                      => occ['place_guess'],
          'catalogNumber'                 => occ['id'],
          'basisOfRecord'                 => 'HumanObservation',
          'geocat_active'                 => true,
          'geocat_removed'                => false,
          'geocat_alias'                  => CGI.unescape(q),
          'catalogue_id'                  => "inaturalist_#{occ['id']}-#{occ['user_id']}",
          'geocat_kind'                   => "inaturalist",
          'occurrenceRemarks'             => "",
          'seasonality'                   => occ['seasonality'] || 'N/A',
          'origin'                        => occ['origin'] || 'N/A',
          'presence'                      => occ['presence'] || 'N/A',
          'geocat_query'                  => CGI.unescape(q)
        }
      end

      @json_head = [{"id"=>"inaturalist_id","name"=>"inaturalist","points"=>json_only, "specie"=> CGI.unescape(q), "zoom"=>"3"}]
      # end to filter

      render :json =>@json_head
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH
end
