require File.expand_path("../../../lib/geocat_data_importer", __FILE__)

class GeocatData
  include GeocatDataImporter
end

describe GeocatDataImporter do
  let(:invalid_resourcename_geocat_file)   { File.open(File.expand_path("../../support/data/invalid_resource_name.geocat", __FILE__))  }
  let(:invalid_latlong_geocat_file)        { File.open(File.expand_path("../../support/data/invalid_latlong.geocat", __FILE__))        }
  let(:invalid_records_geocat_file)        { File.open(File.expand_path("../../support/data/invalid_records.geocat", __FILE__))        }
  let(:duplicated_catalogueid_geocat_file) { File.open(File.expand_path("../../support/data/duplicated_catalogueid.geocat", __FILE__)) }

  it "shouldn't import geocat files without a valid resource type" do
    geocat_model = GeocatData.new(invalid_resourcename_geocat_file)
    geocat_model.should_not be_valid
    geocat_model.errors.should_not be_empty
    geocat_model.errors[:sources].first.should include('you must provide a valid source type')
  end

  it "shouldn't import files without a single record with valid latitude/longitude coords" do
    geocat_model = GeocatData.new(invalid_latlong_geocat_file)
    geocat_model.should_not be_valid
    geocat_model.errors.should_not be_empty
    geocat_model.errors[:sources].first.should include('you must provide at least one point with valid latitude and longitude fields')
  end

  it 'should store a warning for each record not being imported' do
    geocat_model = GeocatData.new(invalid_records_geocat_file)
    geocat_model.should be_valid
    geocat_model.errors.should be_empty
    geocat_model.warnings.should_not be_empty
    geocat_model.warnings[:sources].should include('5 records were not imported because they were missing mandatory fields.')
  end

  it 'should store a warning for each record with a duplicated catalogue id' do
    geocat_model = GeocatData.new(duplicated_catalogueid_geocat_file)
    geocat_model.should be_valid
    geocat_model.errors.should be_empty
    geocat_model.warnings.should_not be_empty
    geocat_model.warnings[:sources].should include("gbif source has duplicated catalogue_id's")
  end

end
