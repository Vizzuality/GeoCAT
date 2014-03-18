class DwcController < ApplicationController

  def search
    geocat_dwc = GeocatDWC.new(params[:qqfile].original_filename, params[:qqfile])

    render :json => geocat_dwc.to_json
  end

end
