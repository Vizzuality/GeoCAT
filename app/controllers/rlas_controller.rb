class RlasController < ApplicationController
  
  # POST /rlas
  # POST /rlas.xml
  
  
  # HTTP ACTIONS
  def create
    
    @rla = Rla.new(params[:rla])

    #@name_file = File.basename(params[:rla]["name"])
    
    if validate_rla(params[:rla]["name"])
        # go to Editor PAGE
        render :file => 'app/views/main/editor.html'
    else
  
    # if @rla.save
    #       render :json => params[:rla][:data], callback => params[:callback]
      render :text => "Archivo incorrecto"
    end
  end
  
  def show
    render :json =>Rla.all , :callback => params[:callback]
  end

  # Validate RLA method
  def validate_rla(path)
    invalid_file = false
    
    file = File.open(path, "r")
    # Get the header 
    file_content_hash = JSON.parse(file.readline)
    
     if (file_content_hash == ({'zoom' => nil} || {'specie' => nil})) 
        invalid_file = true
      else
        @rla.zoom = file_content_hash[0]["zoom"].to_i
        @rla.specie = file_content_hash[0]["specie"]
        @rla.data = {}
        file.each do |json_string| 
          file_content_hash = JSON.parse(json_string)
          @rla.data[file_content_hash[0]["name"]] = file_content_hash 
        end
        @rla.updated_at = Time.now    
        
        debugger
    end
    
    file.close
    
    if (invalid_file == true)
        return false
    else
        return true 
    end  
    
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
