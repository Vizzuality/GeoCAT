class GbifController < ApplicationController

    # begin SEARCH
    def search

      render :json => "{'Status':'Error'}" and return if params.empty?
      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]

      require 'open-uri'

      response = Typhoeus.get("http://api.gbif.org/v1/occurrence/search?georeferencedonly=true&format=darwin&maxresults=1000&coordinateissues=false&scientificName=#{q}", headers: { "Accept" => "application/json" })

      points = JSON.parse(response.body)['results'].map do |item|
        {
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
          'geocat_active'                 => true,
          'geocat_removed'                => false,
          'geocat_kind'                   => 'gbif',
          'geocat_alias'                  => CGI.unescape(q),
          'geocat_query'                  => CGI.unescape(q)
        }
      end

      @list =  [{"specie"=>q,"name"=>"gbif","points"=> points, "zoom"=>"3" }]
      render :json =>@list
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH
end
