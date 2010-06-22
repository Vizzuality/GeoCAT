class RlasController < ApplicationController
  
  # POST /rlas
  # POST /rlas.xml
  
  
  # HTTP ACTIONS
  def create
    
    # @name_file = File.basename(params[:rla]["data"])
    
    @rla = Rla.new(params[:rla])
    
    if @rla.save
      render :json => params[:rla][:data], callback => params[:callback]
    else
      render :json => {:status => 'error'}.to_json, :callback => params[:callback]
    end
  end
  
  def show
    render :json =>Rla.all , :callback => params[:callback]
  end

  # TODO Add validates
  
  def download_rla 
    
      File.open('./public/data.rla', 'w') {|f| f.write('prueba') }
      render :nothing => true
    
  end
  
  def upload_rla
      
      #render :file => 'app/views/main/index.html'
      render :text => "download RLA"
      
    end
  
  
end
