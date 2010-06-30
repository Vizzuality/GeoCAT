
	/*========================================================================================================================*/
	/*  																																																											*/
	/*  																																																											*/

	
	/*  																																																											*/	
	/*  																																																											*/
	/*========================================================================================================================*/



		function RLA (specie, flickr, gbif, own, markers, map_properties, upload_obj) {
			this.flickr_ = flickr;
			this.gbif_ = gbif;
			this.own_ = own;
			this.specie_ = specie;
		
			this.upload_data_ = upload_obj;
		
			this.markers_ = markers;
		
			this.zoom = (map_properties==null)? null : map_properties.zoom;
			this.center = (map_properties==null)? null : map_properties.center;
		}


		/*========================================================================================================================*/
		/*  */
		/*========================================================================================================================*/
		RLA.prototype.download = function() {
		  var dataset = new Object();
			dataset.scientificname = this.specie_;
			dataset.zoom = this.zoom;
			dataset.center = this.center;
			dataset.sources = [];
		
			this.addMarkers(dataset,this.markers_);		
		
			console.log(dataset);

			$.ajax({
							url: "/download/rla",
						      type: "POST",
						      data: ({rla: JSON.stringify(dataset)}),
						      success: function(result){
						         console.log(result);
						      }
						});
		}
	


		/*========================================================================================================================*/
		/*  */
		/*========================================================================================================================*/
		RLA.prototype.addMarkers = function(obj,markers) {
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
	
	
	
		/*========================================================================================================================*/
		/*  */
		/*========================================================================================================================*/
		RLA.prototype.upload = function() {
			//loop object and give all the objects.
			var result = [];
		
			var obj = new Object();
			obj.name = "map";
			obj.center = this.upload_data_.rla.center;
			obj.zoom = this.upload_data_.rla.zoom;
			obj.specie = this.upload_data_.rla.specie;
		
			result.push(obj);
		
			for (var i=0; i<this.upload_data_.rla.source.length; i++) {
				result.push(this.upload_data_.rla.source[i]);
			}
			return result;
		}
	
	
	