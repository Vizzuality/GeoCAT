class FileController < ApplicationController

  before_filter :check_upload_params, :only => :upload

  def download

    json = JSON.parse(params[:rla])

    file_name = filename_escape(json["scientificname"])

    headers["Content-Type"]        = "text/rlat"
    headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.rlat\"";

    render :text => params[:rla]
  end

  def upload
    @species_name = params[:species] if params[:species].present?

    if params[:file]
      rlat_data = RlatData.new(params[:file])

      if rlat_data.valid?
        @rlat_json = rlat_data.to_json
      else
        @rlat_json = rlat_data.errors.to_json
      end
    end

    render :template => 'rlas/editor'
  end

  private
    def check_upload_params
      if params[:species].blank? && params[:file].blank?
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