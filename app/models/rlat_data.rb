class RlatData
  include ActiveModel::Validations

  attr_accessor :scientificname, :zoom, :center, :analysis, :format, :sources
  attr_writer :warnings

  validates_presence_of :sources
  validate :sources_must_be_valid

  def initialize(file = nil)
    return if file.blank?

    begin
      process_as_json file
    rescue JSON::ParserError => e
      begin
        process_as_csv file
      rescue
        errors.add(:file, 'file is not valid')
      end
    end
  end

  def warnings
    @warnings = [] unless @warnings
    @warnings
  end

  def to_json
    {
      :success => valid?,
      :format => format,
      :data => {
        :scientificname => scientificname,
        :zoom => zoom,
        :center => center,
        :analysis => analysis,
        :sources => sources
      },
      :errors => errors,
      :warnings => warnings
    }.to_json
  end

  private
    def process_as_json(file)
      json = JSON.parse(file.read)

      self.scientificname = json['scientificname']
      self.zoom           = json['zoom']
      self.format         = 'rla'
      self.center         = json['center']
      self.analysis       = json['analysis']
      self.sources        = json['sources']
    end

    def process_as_csv(file)
      options = {}
      options[:type] = :io and file.rewind if file.is_a?(StringIO)

      csv = CsvMapper.import(file.path || file, options) do
        read_attributes_from_file
      end
      return if csv.blank?

      self.scientificname = csv.first.scientificname if csv.first.respond_to?(:scientificname)
      self.zoom           = csv.first.zoom if csv.first.respond_to?(:zoom)
      self.format         = 'csv'
      self.center         = {
        "latitude"  => csv.first.respond_to?(:center_latitude) ? csv.first.center_latitude : nil,
        "longitude" => csv.first.respond_to?(:center_longitude) ? csv.first.center_longitude : nil
      }
      self.sources        = [{
        'name'   => 'csv',
        'points' => []
      }]
      csv.each do |row|
        self.sources.first['points'].push({
          'kind'         => 'your',
          'latitude'     => row.respond_to?(:latitude) ? row.latitude : nil,
          'longitude'    => row.respond_to?(:longitude) ? row.longitude : nil,
          'collector'    => row.respond_to?(:collectioncode) ? row.collectioncode : nil,
          'coordinateUncertaintyInMeters'     => row.respond_to?(:coordinateuncertaintyinmeters) ? row.coordinateuncertaintyinmeters : nil,
          'catalogue_id' => row.respond_to?(:catalognumber) ? row.catalognumber : nil
        })
      end
    end

    def sources_must_be_valid
      invalid_points = []
      if self.sources.present?
        self.sources.each do |source|
          errors.add(:sources, 'are not valid') and return if source['name'].blank? || source['points'].blank?
          source['points'].each do |point|
            if point['latitude'].blank? || point['longitude'].blank?
               invalid_points.push(point)
            end
          end
          if invalid_points.present?
            source['points'] = source['points'] - invalid_points
            warnings.push(:sources, "#{invalid_points.length} records were not imported because they were missing mandatory fields.")
          end
          removed_dupes = Hash[source['points'].map{|x| [x['catalogue_id'], x]}].values
          if source['points'].length > removed_dupes.length
            source['points'] = removed_dupes
            warnings.push([:sources, "#{source['name']} source has duplicated catalogue_id's"])
          end
        end
      end
    end

end