class FileController < ApplicationController
  before_filter :verify_download_params, :only => :download
  before_filter :verify_upload_extension, :only => :upload

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

    # Removes 'removed' points from each datasource
    @rla['sources'].each do |source|
      source['points'].reject!{|point| point['removed']}
    end

    case format.downcase
    when 'geocat'
      file_name = filename_escape(@rla['reportName'])
      headers["Content-Type"]        = "application/vizzuality-geocat.geocat+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.geocat\""

      render :text => params[:rla]
    when 'kml'
      file_name = filename_escape(@rla['reportName'])

      @analysis = @rla["analysis"]

      headers["Content-Type"]        = "application/vnd.google-earth.kml+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.kml\""

      render :action => :kml
    when 'print'
      @RED_LIST_CATEGORIES = @@RED_LIST_CATEGORIES

      @analysis = @rla["analysis"]

      @flickr_points, @gbif_points, @user_points = []
      if @rla['sources']
        @flickr_points = @rla['sources'].select{|s| s['type'] == 'flickr'}.map{|s| s['points']}.flatten
        @gbif_points   = @rla['sources'].select{|s| s['type'] == 'gbif'}.map{|s| s['points']}.flatten
        @user_points   = @rla['sources'].select{|s| s['type'] == 'user'}.map{|s| s['points']}.flatten

        @flickr_coords = @flickr_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
        @gbif_coords   = @gbif_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
        @user_coords   = @user_points[0,25].map{|c| "#{c['latitude']},#{c['longitude']}"}.join('|')
      end

      all_sources  = @flickr_points + @gbif_points + @user_points
      @collections = all_sources.select{|c| c['collectionCode']}.length
      @collections += 1 if @user_points.present?
      @localities  = all_sources.map{|l| [l['latitude'], l['longitude']]}.uniq.length

      render :action => :print
    when 'csv'
      file_name = filename_escape(@rla['reportName'])
      @rla = RlatData.new(@rla)

      send_data @rla.to_csv,
        :type => 'text/csv; charset=iso-8859-1; header=present',
        :disposition => "attachment; filename=#{file_name}.csv"
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

    invalid_rla_file and return if params[:file] && rlat.invalid?

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

    def verify_upload_extension
      file_path = params[:file].original_filename if params[:file] && params[:file].respond_to?(:original_filename)
      invalid_rla_file if file_path && (not file_path.match(/^.*\.geocat$/))
    end

    def invalid_rla_file
      flash[:error] = 'Invalid file. You must provide a valid GeoCAT file.'
      redirect_to :controller => 'main', :action => 'index'
    end

    def filename_escape(string)
      string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
        '%' + $1.unpack('H2' * $1.size).join('%').upcase
      end.tr(' ', '_')
    end
end

