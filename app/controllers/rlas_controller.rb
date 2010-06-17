class RlasController < ApplicationController
  
  # POST /rlas
  # POST /rlas.xml

  def create
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
  
  
end
