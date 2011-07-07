class GeocatController < ApplicationController

  # This action is to store the id and the specie_name in the editor page
  def editor_params
    puts 'jamon'
    $geocat = ""
    if !params[:id].nil? && !params[:specie].nil?
      @geocat = Geocat.new
      @geocat.specie = params[:specie]
      @geocat.data = params[:id]
      $geocat = @geocat
      redirect_to :controller => "geocat", :action => "editor"
    else
      redirect_to :controller => "main"
    end
  end

  def editor
    if (!$geocat.nil?)||(!$file_content.nil?)
      @geocat = $geocat
      @geocat_json = $file_content
    else
      redirect_to :controller => "main"
    end
  end

  def create
    @geocat = Geocat.new(params[:geocat])

    if validate_geocat(params[:geocat]["name"])
        # go to Editor PAGE
        $geocat = @geocat
        redirect_to :action => "editor"
    else
      render :text => "File wrong"
    end
  end

  def show
    render :json =>Geocat.all, :callback => params[:callback]
  end

  # Validate Geocat method
  def validate_geocat(path)
    # invalid_file = false

    file = File.open(path, "r")
    file_content_JSON = []
    file_content = []

    file.each do |json_string|
      file_content_JSON << JSON.parse(json_string)
      file_content << json_string
    end

    $file_content = file_content[0]

    @geocat.reportName = file_content_JSON[0]["geocat"]["reportName"]
    @geocat.zoom = file_content_JSON[0]["geocat"]["viewPort"]['zoom']
    @geocat.center = file_content_JSON[0]["geocat"]["viewPort"]['center']
    @geocat.data = file_content_JSON[0]["geocat"]["sources"]


    file.close

    return true
    # if (invalid_file == true)
    #      return false
    #  else
    #      return true
    #  end
  end

  def upload_geocat
      #render :file => 'app/views/main/index.html'
      render :text => "download GeoCAT"
  end

  def make_screenshot
    width, height, bmp = Win32::Screenshot.foreground
    img = Magick::Image.from_blob(bmp)[0]
    img.write("./screenshot.png")
  end

end
