class GbifController < ApplicationController

    # begin SEARCH
    def search
      @points = []

      render :json => "{'Status':'Error'}" and return if params.empty?
      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]

      for i in 0..2
        offset = 300 * (i * 1)
        response = Typhoeus.get("http://api.gbif.org/v1/occurrence/search?hasCoordinate=true&format=darwin&limit=300&hasGeospatialIssue=false&scientificName=#{q}&offset=#{offset}", headers: { "Accept" => "application/json" })
        populate(response, q)
      end

      @list =  [{"id"=>"gbif_id","specie"=>q,"name"=>"gbif","points"=> @points, "zoom"=>"3" }]
      render :json =>@list
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH

    def populate(response, q)
      JSON.parse(response.body)['results'].map do |item|
        if item['decimalLatitude'] && item['decimalLatitude'] != 0
          @points.push({
            'latitude'                      => item['decimalLatitude'],
            'longitude'                     => item['decimalLongitude'],
            'institutionCode'               => item['institutionCode'],
            'collectionCode'                => item['collectionCode'],
            'catalogNumber'                 => item['catalogNumber'],
            'scientificName'                => item['scientificName'],
            'gbifKey'                       => item['key'],
            'basisOfRecord'                 => item['basisOfRecord'],
            'recordedBy'                    => item['recordedBy'],
            'eventDate'                     => item['eventDate'],
            'country'                       => item['country'],
            'locality'                      => item['verbatimLocality'],
            'coordinateUncertaintyInMeters' => item['coordinateUncertaintyInMeters'] || 15000,
            'identifiedBy'                  => item['identifiedBy'],
            'occurrenceRemarks'             => item['occurrenceRemarks'],
            'collector'                     => item['recordedBy'],
            'collectorNumber'               => item['collectorNumber'],
            'seasonal'                      => item['seasonal'] || 'Resident',
            'origin'                        => item['origin'] || 'Native',
            'presence'                      => item['occurrenceStatus'] || 'Extant',
            'geocat_active'                 => true,
            'geocat_removed'                => false,
            'geocat_kind'                   => 'gbif',
            'geocat_alias'                  => CGI.unescape(q),
            'geocat_query'                  => CGI.unescape(q)
          })
        end
      end
    end
end
