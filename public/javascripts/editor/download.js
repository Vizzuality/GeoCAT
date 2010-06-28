


	function DownloadRLA (specie,flickr, gbif, own, markers, map_inf) {
		this.flickr_ = flickr;
		this.gbif_ = gbif;
		this.own_ = own;
		this.specie_ = specie;
		
		this.markers_ = markers;
		
		this.zoom = map_inf.zoom;
		this.center = map_inf.center;
	}
	
	DownloadRLA.prototype.download = function() {
	  var dataset = new Object();
		dataset.scientificname = this.specie_;
		dataset.zoom = this.zoom;
		dataset.center = this.center;
		dataset.sources = [];
		
		this.addMarkers(dataset,this.markers_);		
		
		console.log(dataset);
		
		$.ajax({
			url: "/download/RLA",
      type: "POST",
      data: ({rla: dataset}),
      success: function(result){
         console.log(result);
      }
		});
	}
	
	
	DownloadRLA.prototype.addMarkers = function(obj,markers) {
		for (var i=0; i<markers.length; i++) {
			var find = false;
			for (var j=0; j<obj.sources.length; j++) {
				if (obj.sources[j].name == markers[i].data.kind) {
					obj.sources[j].data.push(markers[i].data.item);
					find = true;
					break;
				}
			}
			
			if (!find) {
				var new_source = new Object();
				new_source.name = markers[i].data.kind;
				new_source.data = [];
				new_source.data.push(markers[i].data.item);
				obj.sources.push(new_source);
			}

		}
	}
	
	
	