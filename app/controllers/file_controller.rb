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
    @geocat = JSON.parse(params[:geocat])

    # Removes 'removed' points from each datasource
    @geocat['sources'].each do |source|
      source['points'].reject!{|point| point['removed']}
    end

    case format.downcase
    when 'geocat'
      file_name = filename_escape(@geocat['reportName'])
      headers["Content-Type"]        = "application/geocat.geocat+json"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.geocat\""

      render :text => params[:geocat]
    when 'kml'
      file_name = filename_escape(@geocat['reportName'])

      @analysis = @geocat["analysis"]

      headers["Content-Type"]        = "application/vnd.google-earth.kml+xml"
      headers["Content-Disposition"] = "attachment; filename=\"#{file_name}.kml\""

      render :action => :kml
    when 'print'
      @RED_LIST_CATEGORIES = @@RED_LIST_CATEGORIES

      @analysis = @geocat["analysis"]

      @flickr_points, @gbif_points, @user_points = []
      if @geocat['sources']
        @flickr_points = @geocat['sources'].select{|s| s['type'] == 'flickr'}.map{|s| s['points']}.flatten
        @gbif_points   = @geocat['sources'].select{|s| s['type'] == 'gbif'}.map{|s| s['points']}.flatten
        @user_points   = @geocat['sources'].select{|s| s['type'] == 'user'}.map{|s| s['points']}.flatten

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
      file_name = filename_escape(@geocat['reportName'])
      @geocat = GeocatData.new(@geocat)

      send_data @geocat.to_csv,
        :type => 'text/csv; charset=iso-8859-1; header=present',
        :disposition => "attachment; filename=#{file_name}.csv"
    end
  end

  def upload
    @report_name = params[:report_name] if params[:report_name].present?

    geocat = case
    when params[:file]
      if upload_file_extname == '.geocat'
        GeocatData.new(params[:file])
      elsif upload_file_extname == '.rla'
        rla = RlatData.new(params[:file])
        GeocatData.new(rla)
      end
    when params[:qqfile]
      GeocatData.new(request.body)
    when params[:geocat_url]
      uri = URI.parse(params[:geocat_url])
      GeocatData.new(StringIO.new uri.read) if uri.present?
    when params[:dwc_url]
      uri = URI.parse(params[:dwc_url])
      GeocatDWC.new('url.dwc', open(uri).read)
    else
      GeocatData.new
    end

    # HACK! HACK! HACK!
    # Since valums file upload lib doesn't send a valid http-accept header,
    # we cannot use respond_to

    render :json => geocat.to_json and return if params[:qqfile] && request.xhr?

    invalid_geocat_file and return if params[:file] && geocat.invalid?

    @geocat_json = geocat.to_json
    render :template => 'geocat/editor'
  end

  private
    def verify_download_params
      if params[:format].blank? && params[:geocat]
        flash[:error] = 'There were a problem downloading the file'
        redirect_to :controller => 'main', :action => 'index'
      end
    end

    def verify_upload_extension
      invalid_geocat_file unless upload_file_path.blank? || %w(.geocat .rla).include?(upload_file_extname)
    end

    def upload_file_path
      params[:file].original_filename if params[:file] && params[:file].respond_to?(:original_filename)
    end

    def upload_file_extname
      File.extname(upload_file_path) if upload_file_path
    end

    def invalid_geocat_file
      flash[:error] = 'Invalid file. You must provide a valid GeoCAT file.'
      redirect_to :controller => 'main', :action => 'index'
    end

    def filename_escape(string)
      string.gsub(/([^ a-zA-Z0-9_.-]+)/n) do
        '%' + $1.unpack('H2' * $1.size).join('%').upcase
      end.tr(' ', '_')
    end
end

