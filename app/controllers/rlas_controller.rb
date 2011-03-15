class RlasController < ApplicationController
  
  # This action is to store the id and the specie_name in the editor page
  def editor_params 
    $rla = ""
    if !params[:id].nil? && !params[:specie].nil?
      @rla = Rla.new
      @rla.specie = params[:specie]
      @rla.data = params[:id]
      $rla = @rla
      redirect_to :controller => "rlas", :action => "editor"
    else
      redirect_to :controller => "main"
    end
  end
  
  def editor
    if (!$rla.nil?)||(!$file_content.nil?)     
      @rla = $rla    
      @rla_json = $file_content
    else
      redirect_to :controller => "main"
    end
  end
  
  def create
    @rla = Rla.new(params[:rla])

    if validate_rla(params[:rla]["name"])
        # go to Editor PAGE        
        $rla = @rla
        redirect_to :action => "editor"
    else
      render :text => "File wrong"
    end
  end
  
  def show
    render :json =>Rla.all, :callback => params[:callback]
  end

  # Validate RLA method
  def validate_rla(path)
    # invalid_file = false
    
    file = File.open(path, "r")
    file_content_JSON = []
    file_content = []
    
    file.each do |json_string| 
      file_content_JSON << JSON.parse(json_string)
      file_content << json_string
    end
    
    $file_content = file_content[0]
    
    @rla.reportName = file_content_JSON[0]["rla"]["reportName"]
    @rla.zoom = file_content_JSON[0]["rla"]["viewPort"]['zoom']
    @rla.center = file_content_JSON[0]["rla"]["viewPort"]['center']
    @rla.data = file_content_JSON[0]["rla"]["sources"]
    
    # Get the header     
    # file_content_hash = JSON.parse(file.readline)
    # 
    #  if (file_content_hash == ({'zoom' => nil} || {'specie' => nil})) 
    #     invalid_file = true
    #   else
    #     @rla.zoom = file_content_hash[0]["zoom"].to_i
    #     @rla.specie = file_content_hash[0]["specie"]
    #     @rla.data = {}
    #     file.each do |json_string| 
    #       file_content_hash = JSON.parse(json_string)
    #       @rla.data[file_content_hash[0]["name"]] = file_content_hash 
    #     end
    #     @rla.updated_at = Time.now    
    # end
    
    file.close
    
    return true
    # if (invalid_file == true)
    #      return false
    #  else
    #      return true 
    #  end  
  end

  def upload_rla 
      #render :file => 'app/views/main/index.html'
      render :text => "download RLA"
  end
    
  def make_screenshot
    width, height, bmp = Win32::Screenshot.foreground
    img = Magick::Image.from_blob(bmp)[0]
    img.write("./screenshot.png")
  end 
  
end
