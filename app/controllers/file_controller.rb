class FileController < ApplicationController

  before_filter :check_upload_params, :only => :upload

  def download

    json = JSON.parse(params[:rla])

    file_name = filename_escape(json["scientificname"])

    headers["Content-Type"]        = "text/rlat"
    headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.rla\"";

    render :text => params[:rla]
  end

  def upload
    @species_name = params[:species] if params[:species].present?

    rlat = case
    when params[:file]
      RlatData.new(params[:file])
    when params[:qqfile]
      RlatData.new(request.body)
    else
      RlatData.new
    end

    # HACK! HACK! HACK!
    # Since valums file upload lib doesn't send a valid http-accept header,
    # we cannot use respond_to

    render :json => rlat.to_json and return if params[:qqfile] && request.xhr?

    @rlat_json = rlat.to_json
    render :template => 'rlas/editor'
  end

  private
    def check_upload_params
      if params[:species].blank? && params[:file].blank? && params[:qqfile].blank?
        flash[:error] = 'You must provide an species name or upload a previous report.'
        redirect_to root_url
      end
    end
end

def filename_escape(string)
  string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
    '%' + $1.unpack('H2' * $1.size).join('%').upcase
  end.tr(' ', '_')
end