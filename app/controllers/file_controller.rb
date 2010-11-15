class FileController < ApplicationController
  verify  :only => :download,
          :params => [:format, :rla],
          :flash => {
            :error => 'There were a problem downloading the file'
          },
          :redirect_to => {:controller => 'main', :action => 'index'}

  def download
    format = params[:format]
    @rla = JSON.parse(params[:rla])

    case format.downcase
    when 'rla'
      file_name = filename_escape(@rla['scientificname'])

      headers["Content-Type"]        = "text/rla"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.rla\""

      render :text => params[:rla]
    when 'kml'
      file_name = filename_escape(@rla['scientificname'])

      @analysis = JSON.parse(params[:analysis]) unless params[:analysis].blank?

      headers["Content-Type"]        = "application/vnd.google-earth.kml+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.kml\""

      render :action => :kml
    end
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

end

def filename_escape(string)
  string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
    '%' + $1.unpack('H2' * $1.size).join('%').upcase
  end.tr(' ', '_')
end