class RlatData
  include ActiveModel::Validations

  attr_accessor :scientificname, :zoom, :center, :analysis, :sources
  attr_writer :warnings

  validates_presence_of :scientificname
  validates_presence_of :zoom
  validates_presence_of :center
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
        errors.add(:file, 'are not valid')
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
      self.center         = json['center']
      self.analysis        = json['analysis']
      self.sources        = json['sources']
    end

    def process_as_csv(file)
      csv = CsvMapper.import(file.path) do
        read_attributes_from_file
      end

      self.scientificname = csv.first.scientificname
      self.zoom           = csv.first.zoom
      self.center         = {
        "latitude" => csv.first.center_latitude,
        "longitude" => csv.first.center_longitude
      }
      self.sources        = [{
        'name'   => 'csv',
        'points' => []
      }]
      csv.each do |file|
        self.sources.first['points'].push({
          'kind'         => file.kind,
          'latitude'     => file.latitude,
          'longitude'    => file.longitude,
          'collector'    => file.collector,
          'accuracy'     => file.accuracy,
          'description'  => file.description,
          'catalogue_id' => file.catalogue_id
        })
      end
    end

    def sources_must_be_valid
      if self.sources.present?
        self.sources.each do |source|
          errors.add(:sources, 'are not valid') and return if source['name'].blank? || source['points'].blank?
          source['points'].each do |point|
            if point['kind'].blank?        ||
               point['latitude'].blank?    ||
               point['longitude'].blank?   ||
               point['collector'].blank?   ||
               point['accuracy'].blank?    ||
               point['description'].blank? ||
               point['catalogue_id'].blank?
                errors.add(:sources, 'are not valid') and return
            end
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