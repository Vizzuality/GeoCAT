class GbifController < ApplicationController

    # begin SEARCH
    def search
      
      render :json => "{'Status':'Error'}" and return if params.empty?
      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]
      
      require 'open-uri'
      
      gbif_mirrors = %w(data.gbif.org es.mirror.gbif.org de.mirror.gbif.org)
      
      gbif_mirrors.each do |mirror|
        begin
          gbif_url = URI.escape(
            "http://#{mirror}/ws" +
            "/rest/Occurrence/list?georeferencedonly=true&format=darwin" +
            "&maxresults=200&coordinateissues=false&scientificname=#{q}"
          )
          puts "trying #{gbif_url}"
          open(gbif_url) {|f| @list =  f.read }
          break
        rescue Exception=>e
        end
      end
      
      doc = Nokogiri::XML(@list)
      
      points = []

      doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence").each do |node|
                    
        @institutionCode          = node.xpath("to:institutionCode").text
        @collectionCode           = node.xpath("to:collectionCode").text
        @catalogNumber            = node.xpath("to:catalogNumber").text
        @basisOfRecord            = node.xpath("to:basisOfRecordString").text
        @recordedBy               = node.xpath("to:collector").text
        @eventDate                = node.xpath("to:earliestDateCollected").text
        @country                  = node.xpath("to:country").text
        @stateProvince            = node.xpath("to:stateProvince").text
        @county                   = node.xpath("to:county").text
        @verbatimElevation        = ""
        @locality                 = node.xpath("to:locality").text
        @coordinateUncertaintyInMeters = node.xpath("to:coordinateUncertaintyInMeters").text
        @identifiedBy             = ""
        @occurrenceRemarks        = node.xpath("to:gbifNotes").text
        @occurrenceDetails        = ""
        
        
        @gbifKey                  = node.xpath("to:gbifNotes").attr('gbifKey')
        @latitude                 = node.xpath("to:decimalLatitude").text.to_f
        @longitude                = node.xpath("to:decimalLongitude").text.to_f
        
        if (@institutionCode =="LSUMZ" and @collectionCode=="Mammals" and @catalogNumber=="4115")
          points << {"latitude"=> @latitude,"longitude"=> @longitude,
            "institutionCode"=>@institutionCode,
            "collectionCode"=>@collectionCode,
            "catalogNumber"=>@catalogNumber,
            "basisOfRecord"=>@basisOfRecord,
            "recordedBy"=>@recordedBy,
            "eventDate" =>@eventDate,
            "country"=>@country,
            "stateProvince"=>@stateProvince,
            "county"=>@county,
            "verbatimElevation"=>@verbatimElevation,
            "locality"=>@locality,
            "coordinateUncertaintyInMeters"=>@coordinateUncertaintyInMeters,
            "identifiedBy"=>@identifiedBy,
            "occurrenceRemarks"=>@occurrenceRemarks,
            "occurrenceDetails"=>@occurrenceDetails,
            "coordinateUncertaintyInMeters"=>"15","collector"=>@gbifKey,"active"=>true,"removed"=>false,
            "catalogue_id"=>"gbif_#{@institutionCode}-#{@collectionCode}-#{@catalogNumber}",
            "kind"=>"gbif",
            "description" => ""}
        end
      end

      @list =  [{"id"=>"gbif_id","name"=>"gbif","points"=> points }]

      render :json =>@list
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH
end
