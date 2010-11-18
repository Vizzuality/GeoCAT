class FileController < ApplicationController
  before_filter :verify_download_params, :only => :download

  @@RED_LIST_CATEGORIES = {
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
      @RED_LIST_CATEGORIES = @@RED_LIST_CATEGORIES

      @analysis = @rla["analysis"]

      @flickr_points, @gbif_points, @your_points = []
      if @rla['sources']
        @flickr_points = @rla['sources'].select{|s| s['name'] == 'flickr'}.map{|s| s['points']}.flatten
        @gbif_points   = @rla['sources'].select{|s| s['name'] == 'gbif'}.map{|s| s['points']}.flatten
        @your_points   = @rla['sources'].select{|s| s['name'] == 'your'}.map{|s| s['points']}.flatten

        @flickr_coords = @flickr_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
        @gbif_coords   = @gbif_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
        @your_coords   = @your_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
      end

      all_sources  = @flickr_points + @gbif_points + @your_points
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

  private
    def verify_download_params
      if params[:format].blank? && params[:rla]
        flash[:error] = 'There were a problem downloading the file'
        redirect_to :controller => 'main', :action => 'index'
      end
    end

end

def filename_escape(string)
  string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
    '%' + $1.unpack('H2' * $1.size).join('%').upcase
  end.tr(' ', '_')
end