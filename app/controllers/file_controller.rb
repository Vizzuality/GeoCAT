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
      headers["Content-Type"]        = "application/vizzuality-rlat.rla+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.rla\""

      render :text => params[:rla]
    when 'kml'
      file_name = filename_escape(@rla['scientificname'])

      @analysis = @rla["analysis"]

      headers["Content-Type"]        = "application/vnd.google-earth.kml+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.kml\""

      render :action => :kml
    when 'print'
      @RED_LIST_CATEGORIES = {
        'EX' => 'Extinct',
        'EW' => 'Extinct in the Wild',
        'CR' => 'Critically Endangered',
        'EN' => 'Endangered',
        'VU' => 'Vulnerable',
        'NT' => 'Near Threatened',
        'LC' => 'Least Concern',
        'DD' => 'Data Deficient',
        'NE' => 'Not Evaluated'
      }
      @analysis = @rla["analysis"]

      @flickr_points, @gbif_points, @your_points = []
      if @rla['sources']
        @flickr_points = @rla['sources'].select{|s| s['name'] == 'flickr'}.first['points'] if @rla['sources'].select{|s| s['name'] == 'flickr'}.present?
        @gbif_points   = @rla['sources'].select{|s| s['name'] == 'gbif'}.first['points'] if @rla['sources'].select{|s| s['name'] == 'gbif'}.present?
        @your_points   = @rla['sources'].select{|s| s['name'] == 'yours'}.first['points'] if @rla['sources'].select{|s| s['name'] == 'yours'}.present?
        @flickr_coords = @flickr_points.map{|c| "#{c['latitude']}|#{c['longitude']}"}.join('|')
        @gbif_coords   = @flickr_points.map{|c| "#{c['latitude']}|#{c['longitude']}"}.join('|')
        @your_coords   = @flickr_points.map{|c| "#{c['latitude']}|#{c['longitude']}"}.join('|')
      end
      all_sources  = @flickr_points || [] + @gbif_points || [] + @your_points || []
      @collections = all_sources.select{|c| c['collectionCode']}
      @localities  = all_sources.map{|l| [l['latitude'], l['longitude']]}.uniq

      render :action => :print
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