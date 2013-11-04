class GeocatDWC
  extend ActiveModel::Callbacks
  include ActiveModel::Validations
  include ActiveModel::Validations::Callbacks

  attr_accessor :dwc, :types_and_specimen_extensions, :terms, :scientific_name_index, :taxon_rank_index, :species

  validates_presence_of :types_and_specimen_extensions
  validates_presence_of :terms
  validates_presence_of :scientific_name_index
  validates_presence_of :taxon_rank_index
  validates_presence_of :species
  validate :core_has_no_errors

  before_validation :process_file

  def initialize(file_name, file_data)
    file = generate_temp_file(file_name, file_data)
    self.dwc = DarwinCore.new(file)
  end

  def as_json(arguments)
    if valid?
      {:species => species}
    else
      {:errors => errors}
    end
  end

  private

  def process_file
    get_types_and_specimen_extensions
    get_terms
    get_scientific_name_index
    get_coords_index
    get_taxon_rank_index
    get_species
  end

  def get_types_and_specimen_extensions
    @types_and_specimen_extensions = dwc.extensions.select{|e| e.data[:attributes][:rowType] == 'http://rs.gbif.org/terms/1.0/TypesAndSpecimen'}
  end

  def get_terms
    return if @types_and_specimen_extensions.blank?

    fields = @types_and_specimen_extensions.map{|e| e.data[:field]}.flatten
    @terms  = fields.map{|f| f[:attributes][:term]} & %w(http://rs.tdwg.org/dwc/merms/decimalLatitude http://rs.tdwg.org/dwc/terms/decimalLongitude)
  end

  def get_scientific_name_index
    @scientific_name_index = dwc.core.data[:field].select{|f| f[:attributes][:term] == 'http://rs.tdwg.org/dwc/terms/scientificName'}.first[:attributes][:index] rescue nil
  end

  def get_coords_index
    @latitude_index = dwc.extensions[0].data[:field].select{|f| f[:attributes][:term] == 'http://rs.tdwg.org/dwc/terms/decimalLatitude'}.first[:attributes][:index]
    @longitude_index = dwc.extensions[0].data[:field].select{|f| f[:attributes][:term] == 'http://rs.tdwg.org/dwc/terms/decimalLongitude'}.first[:attributes][:index]
  end

  def get_taxon_rank_index
      @taxon_rank_index = dwc.core.data[:field].select{|f| f[:attributes][:term] == 'http://rs.tdwg.org/dwc/terms/taxonRank'}.first[:attributes][:index] rescue nil
    end

    def get_species
      core, @dwc_errors = dwc.core.read
    core = core.select{|d| d[3] == 'Species'}
    species_hash = Hash[core.map{|d| [ d[0], { :scientificName => d[@scientific_name_index], :data => []} ]}]

    ext, @ext_errors = dwc.extensions[0].read
    ext.each do |e|
      next unless e.present? && species_hash[e[0]].present?
      next if e[@latitude_index].blank? || e[@longitude_index].blank?

      species_hash[e[0]][:data] << {latitude: e[@latitude_index], longitude: e[@longitude_index]}
    end


    @species = species_hash.values.
      select{ |h| h[:data].present? }.
      map do |h|
        h[:data] = h[:data].select{|a| a[:latitude].present? && a[:longitude].present?}.first(1000)
        h
      end
  end

  def core_has_no_errors
    errors.add(:dwc_errors, :present) if @dwc_errors.present?
  end

  def generate_temp_file(name, data)
    dwc_stream = if data.respond_to?(:read)
                  data.read.force_encoding('UTF-8')
                else
                  data.to_s.force_encoding('UTF-8')
                end
    f = Tempfile.new(name, "#{Rails.root}/tmp")
    f.write dwc_stream
    f.close
    f.path
  end

end
