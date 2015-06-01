class AquamapsController < ApplicationController

    # begin SEARCH
    def search
      @points = []

      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]

      # get actual_table_name
      require 'uri'
      api_url = URI.encode("http://eubon-geocat.cartodb.com/api/v2/sql?q=SELECT species FROM mapping_table WHERE species iLIKE '#{q}%' LIMIT 1")
      response = JSON.parse(Typhoeus.get(api_url).body)
      @species_name = response['rows'] && response['rows'].first['species']
      render :json => "{'Status':'Error'}" and return unless @species_name

      table_name = "exp_#{@species_name.gsub(" ", "_")}"
      for i in 0..2
        offset = 300 * i
        request_uri = URI.encode("http://eubon-geocat.cartodb.com/api/v2/sql?q=SELECT * FROM #{table_name} LIMIT 300 OFFSET #{offset}")
        response = Typhoeus.get(request_uri,
          headers: { "Accept" => "application/json" })
        populate(response, q)
      end

      @list =  [{"id"=>"gbif_id","specie"=>q,"name"=>"gbif","points"=> @points, "zoom"=>"3" }]
      render :json =>@list
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH

    def populate(response, q)
      JSON.parse(response.body)['rows'].map do |item|
        @points.push({
          'latitude'                      => item['centerlat'],
          'longitude'                     => item['centerlong'],
          'institutionCode'               => 'AquaMaps',
          'scientificName'                => @species_name.titleize,
          'geocat_active'                 => true,
          'geocat_removed'                => false,
          'geocat_kind'                   => 'aquamaps',
          'geocat_alias'                  => CGI.unescape(q),
          'geocat_query'                  => CGI.unescape(q)
        })
      end
    end

end
