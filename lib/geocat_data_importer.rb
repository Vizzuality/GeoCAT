# encoding: utf-8
require 'active_model'
require './app/models/rlat_data'
require 'json'
require 'csv-mapper'

module GeocatDataImporter
  IUCN_ORIGIN = [
    "native",
    "reintroduced",
    "introduced",
    "vagrant",
    "origin uncertain",
    "assisted colonisation"
  ]

  IUCN_PRESENCE = [
    "extant",
    "probably extant",
    "possibly extant",
    "possibly extinct",
    "extinct",
    "presence uncertain"
  ]

  IUCN_SEASONAL = [
    "resident",
    "breeding season",
    "non-breeding season",
    "passage",
    "seasonal occurrence uncertain"
  ]

  SYMBOLS_ARRAY = ['♥','☓','⚊','⚬','☐']

  def self.included(base)

    base.class_eval do
      include ActiveModel::Validations

      attr_accessor :reportName, :viewPort, :analysis, :format, :center, :sources, :layers
      attr_writer :warnings

      validate :sources_must_be_valid

    end

    base.send :include, InstanceMethods
    base.send :extend, ClassMethods

  end

  module InstanceMethods

    def initialize(data = nil)
      return if data.blank?

      case data
      when RlatData
        process_as_rla data
      else
        begin
          process_as_hash data
        rescue JSON::ParserError => e
          begin
            process_as_csv data
          rescue Exception => ex
            errors.add(:file, 'file is not valid')
          end
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
          :reportName => reportName || 'CSV file',
          :viewPort => viewPort,
          :analysis => analysis,
          :sources => sources,
          :layers => layers
        },
        :errors => errors,
        :warnings => warnings
      }.to_json
    end

    def to_csv
      return '' unless self.valid?

      data = []
      sources.each do |source|
        data += source['points'].reject{|p| p["geocat_removed"]}.collect do |point|
          if SYMBOLS_ARRAY.include?(point['group_name'][0])
            point['group_name'].slice!(0)
          end
          {
            'scientificname'                => source['alias'].empty? ? source['query'] : source['alias'],
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
            'occurrenceDetails'             => point['occurrenceDetails'],
            'geocat_kind'                   => point['geocat_kind'],
            'presence'                      => point['presence'] || 'Extant',
            'seasonal'                      => point['seasonal'] || 'Resident',
            'origin'                        => point['origin'] || 'Native',
            'group_name'                    => point['group_name']
          }
        end
      end

      return if data.first.nil?

      columns = data.first.keys.sort

      output = FasterCSV.generate do |csv|
        csv << columns
        data.each do |row|
          csv << columns.collect { |column| row[column] }
        end
      end
      output
    end

    def to_sis
      return '' unless self.valid?
      require 'date'
      data = []
      sources.each do |source|
        data += source['points'].reject{|p| p["geocat_removed"]}.collect do |point|
          if SYMBOLS_ARRAY.include?(point['group_name'][0])
            point['group_name'].slice!(0)
          end

          eventDate = if point['eventDate'].present?
                        begin
                          DateTime.parse(point['eventDate']).try(:year)
                        rescue
                          point['eventDate']
                        end
                      else
                        point['year']
                      end

          {
            'CatalogNo'                     => point['catalogNumber'],
            'Dist_comm'                     => point['occurrenceRemarks'],
            'Data_sens'                     => point['data_sens'],
            'Sens_comm'                     => point['sens_comm'],
            'Binomial'                => source['alias'].empty? ? source['query'] : source['alias'],
            'Presence'                      => map_iucn_presence(point['presence'] || "Extant"),
            'Origin'                        => map_iucn_origin(point['origin'] || 'Native'),
            'Seasonal'                      => map_iucn_seasonal(point['seasonal'] || 'Resident'),
            'Compiler'                      => point['compiler'],
            'YrCompiled'                    => point['YrCompiled'] ? point['YrCompiled'] : Date.today.year,
            'Dec_Lat'                       => point['latitude'],
            'Dec_Long'                      => point['longitude'],
            'SpatialRef'                    => 'WGS 84',
            'Event_Year'                    => eventDate,
            'Citation'                      => point['institutionCode'],
            'BasisOfRec'                    => point['basisOfRecord'],
            'CollectID'                     => point['catalogue_id'],
            'recordedBy'                    => point['collector'],
            'group_name'                    => point['group_name']
          }
        end
      end

      return if data.first.nil?

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
          JSON.parse(data.read.gsub(/\bundefined\b/, '"Added by user"'))
        end

        self.reportName     = hash['reportName']
        self.viewPort       = hash['viewPort']
        self.format         = 'geocat'
        self.analysis       = hash['analysis']
        self.sources        = hash['sources']
        self.layers         = hash['layers']

      end

      def process_as_csv(file)
        buffer = fix_encoding(file)

        csv = CsvMapper.import(buffer, {:type => :io}) do
          read_attributes_from_file
        end
        return if csv.blank?

        reportName = "CSV occs"
        query = "#{reportName}_#{Time.now.to_i}"

        self.reportName     = reportName
        self.zoom           = csv.first.zoom if csv.first.respond_to?(:zoom)
        self.format         = 'csv'
        self.center         = {
          "latitude"  => csv.first.respond_to?(:center_latitude)  ? csv.first.center_latitude  : nil,
          "longitude" => csv.first.respond_to?(:center_longitude) ? csv.first.center_longitude : nil
        }

        def set_geocat_kind(type)
          case type
          when type["flickr"]
            "flickr"
          when type["inaturalist"]
            "inaturalist"
          when type["picasa"]
            "picasa"
          when type["gbif"]
            "gbif"
          else
            "user"
          end
        end

        self.sources = []

        species_name_method = if csv.first.respond_to?(:scientificname)
                                   :scientificname
                                 elsif csv.first.respond_to?(:scientific_name)
                                   :scientific_name
                                 elsif csv.first.respond_to?(:binomial)
                                   :binomial
                                 else
                                   nil
                                 end
        data_by_species = csv.group_by{|t| species_name_method ? t.send(species_name_method) || "Unknown" : "Unknown" }

        data_by_species.sort.each do |species_name, spc_data|
          source = {
            'type' => 'csv',
            'name' => species_name,
            'query' => species_name,
            'points' => []
          }
          lat_method = ([:latitude, :lat, :dec_lat] & spc_data.first.members).first
          long_method = ([:longitude, :long, :dec_long] & spc_data.first.members).first
          spc_data.each do |row|
            lat = lat_method ? row.send(lat_method) : nil
            lon = long_method ? row.send(long_method) : nil
            source['points'] << {
              'latitude' => lat,
              'longitude' => lon,
              'collector' => (row.members.include?(:collector) ? row.collector : nil),
              'coordinateUncertaintyInMeters' => (row.members.include?(:coordinateuncertaintyinmeters) ? row.coordinateuncertaintyinmeters : nil),
              'catalogue_id' => nil,
              'collectionCode' => (row.members.include?(:collectioncode) ? row.collectioncode : nil),
              'institutionCode' => (row.members.include?(:institutioncode) ? row.institutioncode : nil),
              'catalogNumber' => (row.members.include?(:catalognumber) ? row.catalognumber : nil),
              'basisOfRecord' => (row.members.include?(:basisofrecord) ? row.basisofrecord : nil),
              'presence' => (row.members.include?(:presence) ? row.presence : 'Extant'),
              'seasonal' => (row.members.include?(:seasonal) ? row.seasonal : 'Resident'),
              'origin' => (row.members.include?(:origin) ? row.origin : 'Native'),
              'eventDate' => (row.members.include?(:eventdate) ? row.eventdate :  nil),
              'country' => (row.members.include?(:country) ? row.country : nil),
              'stateProvince' => (row.members.include?(:stateprovince) ? row.stateprovince : nil),
              'county' => (row.members.include?(:county) ? row.county : nil),
              'verbatimElevation' => (row.members.include?(:verbatimelevation) ? row.verbatimelevation : nil),
              'locality' => (row.members.include?(:locality) ? row.locality : nil),
              'coordinateUncertaintyText' => (row.members.include?(:coordinateuncertaintytext) ? row.coordinateuncertaintytext : nil),
              'identifiedBy' => (row.members.include?(:identifiedby) ? row.identifiedby : nil),
              'occurrenceRemarks' => (row.members.include?(:occurrenceremarks) ? row.occurrenceremarks : nil),
              'occurrenceDetails' => (row.members.include?(:occurrencedetails) ? row.occurrencedetails : nil),
              'geocat_query' => species_name,
              'geocat_kind' => row.members.include?(:geocat_kind) ? row.geocat_kind : row.members.include?(:catalogue_id) ? set_geocat_kind(row.catalogue_id): nil,
              'geocat_alias' => species_name,
              'group' => row.members.include?(:group_name) ? row.group_name : "Group",
              'species_name' => species_name
            }
          end
          self.sources << source
        end
      end

      def process_as_rla(rla)
        self.reportName = rla.scientificname
        self.viewPort = {
          'zoom' => rla.zoom,
          'center' => rla.center
        }
        self.sources = rla.sources.map do |source|
          {
            "type" => source["name"],
            "query" => rla.scientificname,
            "points" => source["points"].map do |point|
              point_hash = point.slice(
                "ocurrenceDetails",
                "latitude",
                "collector",
                "country",
                "collectionCode",
                "ocurrenceRemarks",
                "catalogNumber",
                "county",
                "stateProvince",
                "locality",
                "recordedBy",
                "catalogue_id",
                "basisOfRecord",
                "seasonal",
                "origin",
                "presence",
                "longitude",
                "coordinateUncertaintyMeters",
                "institutionCode",
                "eventDate",
                "verbatimElevation",
                "geocat_kind"
              )
              point_hash["geocat_active"] = point["active"]
              point_hash["geocat_query"] = rla.scientificname
              point_hash["geocat_kind"] = point["geocat_kind"]
              point_hash["geocat_removed"] = point["removed"]
              point_hash["geocat_alias"] = rla.scientificname
              point_hash
            end
          }
        end
        self.analysis = {
          'AOO' => rla.analysis.slice(*%w(cellsize_type cellsize cellsize_step))
        } if rla.analysis.present?
      end

      def sources_must_be_valid
        invalid_points   = []
        sources_errors   = []
        sources_warnings = []

        if self.sources.present?
          self.sources.each do |source|
            sources_errors << 'you must provide a valid source type' if source['type'].blank?
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
            removed_dupes = Hash[source['points'].select{|x| x['catalogue_id'].present?}.map{|x| [x['catalogue_id'], x]}].values || []
            if removed_dupes.present? && source['points'].length > removed_dupes.length
              source['points'] = source['points'] - removed_dupes
              sources_warnings << "#{source['type']} source has duplicated catalogue_id's"
            end
          end
        else
          sources_errors << 'you must provide at least one point with valid latitude and longitude fields'
        end
        warnings[:sources] = sources_warnings if sources_warnings.present?
        errors.add(:sources, sources_errors) if sources_errors.present?
      end

      def fix_encoding(file)
        buffer = file

        buffer.rewind if buffer.respond_to?(:rewind)
        buffer = StringIO.new(file.read) if file.respond_to?(:read)

        buffer_encoding = CharDet.detect(buffer.read).try(:[], 'encoding')
        buffer.rewind
        if RUBY_VERSION.to_f < 1.9
          StringIO.new(Iconv.conv('utf-8', buffer_encoding, buffer.read))
        else
          StringIO.new(buffer.read.encode(Encoding::UTF_8, :invalid => :replace, :undef => :replace, :replace => ''))
        end rescue nil
      end
      private :fix_encoding

      [:origin, :presence, :seasonal].each do |method_name|
        define_method "map_iucn_#{method_name}" do |arg|
          "GeocatDataImporter::IUCN_#{method_name.to_s.upcase}".
            constantize.index(arg.downcase.strip).
            try { |t| t + 1 } || "#VALUE NOT VALID"
        end
      end

    end

    module ClassMethods

    end

end
