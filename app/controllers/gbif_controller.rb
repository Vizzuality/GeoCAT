class GbifController < ApplicationController

    # begin SEARCH
    def search
      if params.empty?
        render :json => "{'Status':'Error'}"
      else
        if !params[:q].empty? or !params[:q].nil?
          q = params[:q]

          # TO GET THE POINTS BY SPECIE -
          # Puma in this case (13191720)
          # Lepidoptera (13141205)

          # q = "13191720"
          require 'open-uri'

          gbif_url = URI.escape(
            "http://de.mirror.gbif.org/ws" +
            "/rest/Occurrence/list?georeferencedonly=true&format=darwin" +
            "&maxresults=200&coordinateissues=false&scientificname=#{q}"
          )
          open(gbif_url) {|f| @list =  f.read }

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

        else
          render :json => "{'Status':'Error'}"
        end
      end

    end
    # end SEARCH
end
