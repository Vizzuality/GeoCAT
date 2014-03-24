class RlatData
  include ActiveModel::Validations

  attr_accessor :scientificname, :zoom, :center, :analysis, :format, :sources
  attr_writer :warnings

  validate :sources_must_be_valid

  def initialize(file = nil)
    return if file.blank?

    begin
      process_as_hash file
    rescue JSON::ParserError => e
      begin
        process_as_csv file
      rescue Exception => ex
        errors.add(:file, 'file is not valid')
      end
    end
  end

  def warnings
    @warnings = {} unless @warnings
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

  def to_csv
    return '' unless self.valid?

    data = []
    sources.each do |source|
      data += source['points'].collect do |point|
        {
          'recordSource'                  => point['recordSource'],
          'scientificname'                => scientificname,
          'latitude'                      => point['latitude'],
          'longitude'                     => point['longitude'],
          'changed'                       => point['geocat_changed'],
          'collector'                     => point['collector'],
          'collectorNumber'               => point['collectorNumber'],
          'coordinateuncertaintyinmeters' => point['coordinateUncertaintyInMeters'],
          'catalogue_id'                  => point['catalogue_id'],
          'collectionCode'                => point['collectionCode'],
          'institutionCode'               => point['institutionCode'],
          'catalogNumber'                 => point['catalogNumber'],
          'basisOfRecord'                 => point['basisOfRecord'],
          'eventDate'                     => point['eventDate'],
          'country'                       => point['country'],
          'stateProvince'                 => point['stateProvince'],
          'county'                        => point['county'],
          'verbatimElevation'             => point['verbatimElevation'],
          'locality'                      => point['locality'],
          'coordinateUncertaintyText'     => point['coordinateUncertaintyText'],
          'identifiedBy'                  => point['identifiedBy'],
          'occurrenceRemarks'             => point['occurrenceRemarks'],
          'occurrenceDetails'             => point['occurrenceDetails']
        }
      end
    end

    columns = data.first.keys.sort

    output = FasterCSV.generate do |csv|
      csv << columns
      data.each do |row|
        csv << columns.collect { |column| row[column] }
      end
    end
    output
  end

  private
    def process_as_hash(data)
      hash = if data.is_a? Hash
        data
      else
        JSON.parse(data.read)
      end

      self.scientificname = hash['scientificname']
      self.zoom           = hash['zoom']
      self.format         = 'rla'
      self.center         = hash['center']
      self.analysis       = hash['analysis']
      self.sources        = hash['sources']
    end

    def process_as_csv(file)
      buffer = file

      buffer.rewind if buffer.respond_to?(:rewind)
      buffer = StringIO.new(file.read) if file.respond_to?(:read)

      csv = CsvMapper.import(buffer, {:type => :io}) do
        read_attributes_from_file
      end
      return if csv.blank?

      reportName = csv.first.scientificname if csv.first.respond_to?(:scientificname)
      query = "#{reportName}_#{Time.now.to_i}"

      self.scientificname = reportName
      self.zoom           = csv.first.zoom if csv.first.respond_to?(:zoom)
      self.format         = 'csv'
      self.center         = {
        "latitude"  => csv.first.respond_to?(:center_latitude)  ? csv.first.center_latitude  : nil,
        "longitude" => csv.first.respond_to?(:center_longitude) ? csv.first.center_longitude : nil
      }
      self.sources        = [{
        'type'   => 'csv',
        'name'   => reportName,
        'query'  => query,
        'points' => []
      }]
      csv.each do |row|
        self.sources.first['points'].push({
          'recordSource'                  => row.respond_to?(:recordsource)                                       ? row.recordsource                                       : 'Added by user',
          'latitude'                      => row.respond_to?(:latitude)                                           ? row.latitude                                           : nil,
          'longitude'                     => row.respond_to?(:longitude)                                          ? row.longitude                                          : nil,
          'collector'                     => row.respond_to?(:collector)                                          ? row.collectioncode                                     : nil,
          'collectorNumber'               => row.respond_to?(:collectorNumber)                                    ? row.collectornumber                                    : nil,
          'coordinateUncertaintyInMeters' => row.respond_to?(:coordinateuncertaintyinmeters)                      ? row.coordinateuncertaintyinmeters                      : nil,
          'catalogue_id'                  => row.respond_to?(:catalogue_id)                                       ? row.catalogue_id                                       : nil,
          'collectionCode'                => row.respond_to?(:collectioncode)                                     ? row.collectioncode                                     : nil,
          'institutionCode'               => row.respond_to?(:institutioncode)                                    ? row.institutioncode                                    : nil,
          'catalogNumber'                 => row.respond_to?(:catalognumber)                                      ? row.catalognumber                                      : nil,
          'basisOfRecord'                 => row.respond_to?(:basisofrecord)                                      ? row.basisofrecord                                      : nil,
          'eventDate'                     => row.respond_to?(:eventdate)                                          ? row.eventdate                                          : nil,
          'country'                       => row.respond_to?(:country)                                            ? row.country                                            : nil,
          'stateProvince'                 => row.respond_to?(:stateprovince)                                      ? row.stateprovince                                      : nil,
          'county'                        => row.respond_to?(:county)                                             ? row.county                                             : nil,
          'verbatimElevation'             => row.respond_to?(:verbatimelevation)                                  ? row.verbatimelevation                                  : nil,
          'locality'                      => row.respond_to?(:locality)                                           ? row.locality                                           : nil,
          'coordinateUncertaintyText'     => row.respond_to?(:coordinateuncertaintytext)                          ? row.coordinateuncertaintytext                          : nil,
          'identifiedBy'                  => row.respond_to?(:identifiedby)                                       ? row.identifiedby                                       : nil,
          'occurrenceRemarks'             => row.respond_to?(:occurrenceremarks)                                  ? row.occurrenceremarks                                  : nil,
          'occurrenceDetails'             => row.respond_to?(:occurrencedetails)                                  ? row.occurrencedetails                                  : nil,
          'geocat_query'                  => query,
          'geocat_kind'                   => 'csv',
          'geocat_alias'                  => reportName
        })
      end
    end

    def sources_must_be_valid
      invalid_points   = []
      sources_errors   = []
      sources_warnings = []
      if self.sources.present?
        self.sources.each do |source|
          sources_errors << 'you must provide a source name' if source['points'].select{|p| p['recordSource'].blank?}.present?
          source['points'].each do |point|
            if point['latitude'].blank? || point['longitude'].blank?
               invalid_points.push(point)
            end
          end
          if invalid_points.present?
            source['points'] = source['points'] - invalid_points
            if source['points'].blank?
              sources_errors << 'you must provide at least one point with valid latitude and longitude fields'
            else
              sources_warnings << "#{invalid_points.length} records were not imported because they were missing mandatory fields."
            end
          end
          removed_dupes = Hash[source['points'].select{|x| x['catalogue_id'].present?}.map{|x| [x['catalogue_id'], x]}].values
          if source['points'].length > removed_dupes.length
            source['points'] = source['points'] - removed_dupes
            sources_warnings << "#{source['recordSource']} source has duplicated catalogue_id's"
          end
        end
      else
        sources_errors << 'you must provide at least one point with valid latitude and longitude fields'
      end
      warnings[:sources] = sources_warnings if sources_warnings.present?
      errors.add(:sources, sources_errors) if sources_errors.present?
    end

end
