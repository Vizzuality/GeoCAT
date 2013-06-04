class DWCController < ApplicationController

  def search
    geocat_dwc = GeocatDWC.new(params[:qqfile], request.body)

    if geocat_dwc.valid?
      render :json => {:species => geocat_dwc.species}
    else
      render :json => {:errors => geocat_dwc.errors}
    end
  end

end
