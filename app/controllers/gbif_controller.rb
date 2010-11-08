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
          
          open("http://de.mirror.gbif.org/ws/rest/Occurrence/list?georeferencedonly=true&maxresults=200&coordinateissues=false&scientificname="+ q) {
            |f| @list =  f.read
          }

          doc = Nokogiri::XML(@list)

          # TO GET THE TOTAL REGISTERS
          @total_returned = doc.xpath("//gbif:summary")[0].attr('totalReturned').to_i

          # TO GET THE TAXONCONCEPKEY
          #@taxonconceptkey = doc.xpath("//gbif:parameter[@name='taxonconceptkey']")[0].attr('value').to_i
                    
          points = []
          
          (0..@total_returned - 1).each do |node|
            
            @catalogNumber = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:catalogNumber")[node].text
            @gbifKey = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence")[node].attr('gbifKey')
            @latitude = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:decimalLatitude")[node].text.to_f            
            @longitude = doc.xpath("//gbif:occurrenceRecords/to:TaxonOccurrence/to:decimalLongitude")[node].text.to_f

            points << {"latitude"=> @latitude,"longitude"=> @longitude,
              "accuracy"=>"5","collector"=>@gbifKey,"active"=>true,"removed"=>false,"catalogue_id"=>"gbif_" + @catalogNumber + "","kind"=>"gbif","description" => "description"}
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
