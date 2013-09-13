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
    self.dwc = DarwinCore.new(generate_temp_file(file_name, file_data))
  end

  def to_json
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

  def get_taxon_rank_index
    @taxon_rank_index = dwc.core.data[:field].select{|f| f[:attributes][:term] == 'http://rs.tdwg.org/dwc/terms/taxonRank'}.first[:attributes][:index] rescue nil
  end

  def get_species
    data, @dwc_errors = dwc.core.read
    @species = data.select{|d| d[3] == 'Species'}.map{|d| d[@scientific_name_index]}
  end

  def core_has_no_errors
    errors.add(:dwc_errors, :present) if @dwc_errors.present?
  end

  def generate_temp_file(name, data)
    Tempfile.new(name) do |f|
      f.write data
    end.path
  end
end
