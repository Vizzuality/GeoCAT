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

          # TO GET THE TOTAL REGISTERS
          @total_returned = doc.xpath("//gbif:summary")[0].attr('totalReturned').to_i

          # TO GET THE TAXONCONCEPKEY
          #@taxonconceptkey = doc.xpath("//gbif:parameter[@name='taxonconceptkey']")[0].attr('value').to_i

          points = []

          (0..@total_returned - 1).each do |node|
            
            @institutionCode          = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:institutionCode")[node].try(:text)
            @collectionCode           = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:collectionCode")[node].try(:text)
            @catalogNumber            = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:catalogNumber")[node].try(:text)
            @basisOfRecord            = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:basisOfRecordString")[node].try(:text)
            @recordedBy               = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:collector")[node].try(:text)
            @eventDate                = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:earliestDateCollected")[node].try(:text)
            @country                  = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:country")[node].try(:text)
            @stateProvince            = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:stateProvince")[node].try(:text)
            @county                   = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:county")[node].try(:text)
            @verbatimElevation        = ""
            @locality                 = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:locality")[node].try(:text)
            @coordinateUncertaintyInMeters = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:coordinateUncertaintyInMeters")[node].try(:text)
            @identifiedBy             = ""
            @occurrenceRemarks        = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:gbifNotes")[node].try(:text)
            @occurrenceDetails        = ""
            
            
            @gbifKey                  = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence")[node].attr('gbifKey')
            @latitude                 = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:decimalLatitude")[node].text.to_f
            @longitude                = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:decimalLongitude")[node].text.to_f
            
            

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
              "coordinateUncertaintyInMeters"=>"15","collector"=>@gbifKey,"active"=>true,"removed"=>false,"catalogue_id"=>"gbif_" + @catalogNumber + "","kind"=>"gbif","description" => "description"}
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
