class DwcController < ApplicationController

  def search
    geocat_dwc = GeocatDWC.new(params[:qqfile], request.body)

    render :json => geocat_dwc.to_json
  end

end
