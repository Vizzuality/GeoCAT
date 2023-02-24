require 'active_support/all'
require File.expand_path("../../../lib/geocat_data_importer", __FILE__)

class GeocatData
  include GeocatDataImporter
end

describe GeocatDataImporter do
  let(:invalid_resourcename_geocat_file)   { File.open(File.expand_path("../../support/data/invalid_resource_name.geocat", __FILE__))  }
  let(:invalid_latlong_geocat_file)        { File.open(File.expand_path("../../support/data/invalid_latlong.geocat", __FILE__))        }
  let(:invalid_records_geocat_file)        { File.open(File.expand_path("../../support/data/invalid_records.geocat", __FILE__))        }
  let(:duplicated_catalogueid_geocat_file) { File.open(File.expand_path("../../support/data/duplicated_catalogueid.geocat", __FILE__)) }
  let(:ephedra_americana_csv)              { File.open(File.expand_path("../../support/data/Ephedra_americana.csv", __FILE__))         }

  it "shouldn't import geocat files without a valid resource type" do
    geocat_model = GeocatData.new(invalid_resourcename_geocat_file)
    expect(geocat_model).not_to be_valid
    expect(geocat_model.errors).not_to be_empty
    expect(geocat_model.errors[:sources].first).to include('you must provide a valid source type')
  end

  it "shouldn't import files without a single record with valid latitude/longitude coords" do
    geocat_model = GeocatData.new(invalid_latlong_geocat_file)
    expect(geocat_model).not_to be_valid
    expect(geocat_model.errors).not_to be_empty
    expect(geocat_model.errors[:sources].first).to include('you must provide at least one point with valid latitude and longitude fields')
  end

  it 'should store a warning for each record not being imported' do
    geocat_model = GeocatData.new(invalid_records_geocat_file)
    expect(geocat_model).to be_valid
    expect(geocat_model.errors).to be_empty
    expect(geocat_model.warnings).not_to be_empty
    expect(geocat_model.warnings[:sources]).to include('5 records were not imported because they were missing mandatory fields.')
  end

  it 'should store a warning for each record with a duplicated catalogue id' do
    geocat_model = GeocatData.new(duplicated_catalogueid_geocat_file)
    expect(geocat_model).to be_valid
    expect(geocat_model.errors).to be_empty
    expect(geocat_model.warnings).not_to be_empty
    expect(geocat_model.warnings[:sources]).to include("gbif source has duplicated catalogue_id's")
  end

  it 'should import a valid csv file' do
    geocat_model = GeocatData.new(ephedra_americana_csv)
    expect(geocat_model).to be_valid
    expect(geocat_model.errors).to be_empty
    expect(geocat_model.warnings).to be_empty
  end
end
