#encoding: UTF-8

require 'spec_helper'

describe GeocatData do

  let(:rla_file){ File.open(Rails.root.join('spec/support/data/Luzula_Luzuloides.rla'))}

  it 'allows to import rla files' do
    rla = RlatData.new(rla_file)
    geocat = GeocatData.new(rla)

    geocat.should be_valid

    geocat.reportName.should be == rla.scientificname
    geocat.viewPort["zoom"].should be == rla.zoom
    geocat.viewPort["center"]["latitude"].should be == rla.center["latitude"]
    geocat.viewPort["center"]["longitude"].should be == rla.center["longitude"]

    geocat.sources.should have(1).source
    rla.sources.should have(1).source
    geocat.sources.first["type"].should be == rla.sources.first["name"]
    geocat.sources.first["query"].should be == rla.scientificname
    geocat.sources.first["points"].should have(200).points
    rla.sources.first["points"].should have(200).points

    geocat_point = geocat.sources.first["points"].first
    rla_point = rla.sources.first["points"].first
    geocat_point["ocurrenceDetails"].should be == rla_point["ocurrenceDetails"]
    geocat_point["latitude"].should be == rla_point["latitude"]
    geocat_point["collector"].should be == rla_point["collector"]
    geocat_point["country"].should be == rla_point["country"]
    geocat_point["collectionCode"].should be == rla_point["collectionCode"]
    geocat_point["ocurrenceRemarks"].should be == rla_point["ocurrenceRemarks"]
    geocat_point["catalogNumber"].should be == rla_point["catalogNumber"]
    geocat_point["county"].should be == rla_point["county"]
    geocat_point["stateProvince"].should be == rla_point["stateProvince"]
    geocat_point["locality"].should be == rla_point["locality"]
    geocat_point["recordedBy"].should be == rla_point["recordedBy"]
    geocat_point["catalogue_id"].should be == rla_point["catalogue_id"]
    geocat_point["basisOfRecord"].should be == rla_point["basisOfRecord"]
    geocat_point["longitude"].should be == rla_point["longitude"]
    geocat_point["coordinateUncertaintyMeters"].should be == rla_point["coordinateUncertaintyMeters"]
    geocat_point["institutionCode"].should be == rla_point["institutionCode"]
    geocat_point["eventDate"].should be == rla_point["eventDate"]
    geocat_point["verbatimElevation"].should be == rla_point["verbatimElevation"]
    geocat_point["geocat_active"].should be == rla_point["active"]
    geocat_point["geocat_query"].should be == rla.scientificname
    geocat_point["geocat_kind"].should be == rla_point["kind"]
    geocat_point["geocat_removed"].should be == rla_point["removed"]

    geocat.analysis["cellsize_type"].should be == rla.analysis["cellsize_type"]
    geocat.analysis["cellsize"].should be == rla.analysis["cellsize"]
    geocat.analysis["cellsize_step"].should be == rla.analysis["cellsize_step"]
  end
end
