class GbifController < ApplicationController  

    # begin SEARCH
    def search
      if params.empty?
        render :json => "{'Status':'Error'}"
      else
        if !params[:q].empty? or !params[:q].nil?
          q = params[:q]
          
          @list = [{"id"=>"gbif_id","name"=>"gbif","data"=>[
            {"latitude"=>"40.543026","longitude"=>"3.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"40.543026","longitude"=>"-3.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"-40.543026","longitude"=>"3.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"-40.543026","longitude"=>"-3.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"50.543026","longitude"=>"5.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"50.543026","longitude"=>"-5.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"-50.543026","longitude"=>"5.055573","accuracy"=>"14","collector"=>"111"},
            {"latitude"=>"-50.543026","longitude"=>"-5.055573","accuracy"=>"14","collector"=>"111"}            
            ]}]
            
          #@list = [{"id"=>"gbif_id","name"=>"gbif","data"=>[{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"}]},{"id"=>"flickr_id","name"=>"flickr","data"=>[{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"}]},{"id"=>"own_data_id","name"=>"own_data","data"=>[{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"},{"lat"=>"40.543026","lng"=>"-3.055573","accuracy"=>"14","collector"=>"111"}]}]
          render :json =>@list
        else
          render :json => "{'Status':'Error'}"
        end
      end

    end
    # end SEARCH
    
end
