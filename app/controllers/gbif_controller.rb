class GbifController < ApplicationController  

    # begin SEARCH
    def search
      if params.empty?
        render :json => "{'Status':'Error'}"
      else
        if !params[:q].empty? or !params[:q].nil?
          q = params[:q]
        
          # TO TEST THE SEARCH
          # q = "13191720"
        
          # TO GET THE TAXON LIST
          # http://es.mirror.gbif.org/species/nameSearch?maxResults=30&amp;returnType=nameId&amp;startIndex=0&amp;view=json&amp;query=ESPECIE_A_BUSCAR
          # http://data.gbif.org/species/nameSearch?maxResults=1&view=json&returnType=nameIdMap&query=Lince%20americano&exactOnly=true

          # TO GET THE POINTS BY SPECIE - Puma con color in this case (13191720)
          q = "13191720"
          require 'open-uri'            
            open("http://es.mirror.gbif.org/ws/rest/density/list?taxonconceptkey="+ q) {|f| @list =  f.read
          }
          
          doc = Nokogiri::XML(@list)
                 
          # TO GET THE TOTAL REGISTERS
          @total_returned = doc.xpath("//gbif:summary")[0].attr('totalReturned').to_i

          # TO GET THE TAXONCONCEPKEY
          @taxonconceptkey = doc.xpath("//gbif:parameter[@name='taxonconceptkey']")[0].attr('value').to_i
                    
          points = []
          
          (0..@total_returned - 1).each do |node|
            
            @cellid = doc.xpath("//gbif:densityRecords/gbif:densityRecord")[node].attr('cellid')
            @minLatitude = doc.xpath("//gbif:minLatitude")[node].text.to_i
            @maxLatitude = doc.xpath("//gbif:maxLatitude")[node].text.to_i
            @latitude = ((@minLatitude + @maxLatitude) / 2).to_s
                        
            @minLongitude = doc.xpath("//gbif:minLongitude")[node].text.to_i
            @maxLongitude = doc.xpath("//gbif:maxLongitude")[node].text.to_i
            @longitude = ((@minLongitude + @maxLongitude) / 2).to_s

            points << {"latitude"=> @latitude,"longitude"=> @longitude,
              "accuracy"=>"14","collector"=>"111","active"=>true,"removed"=>false,"catalogue_id"=>"gbif_" + @cellid + "","kind"=>"gbif"}
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
