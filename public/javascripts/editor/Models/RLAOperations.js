
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				RLA => Class to download and upload .rla files.																																		*/
	/*						*Params ->	specie: name of the specie.																																				*/
	/*												flickr: flickr data information.																																	*/
	/*												gbif: gbif data information.																																			*/
	/*												own: your own data information.																																		*/
	/*												markers: whole markers of the map.																																*/
	/*  											map_properties: zoom and center of the map.																												*/
	/*												upload_obj: only if you want to make an upload of this file have to be distinct null.							*/	
	/*  																																																												*/
	/*==========================================================================================================================*/



		function RLA (specie, markers, map_properties, upload_obj) {
			this.specie_ = specie;
			this.gbif_id_ = gbif_if; 
			this.upload_data_ = upload_obj;
		
			this.markers_ = markers;
		
			this.zoom = (map_properties==null)? null : map_properties.zoom;
			this.center = (map_properties==null)? null : map_properties.center;
		}


		/*========================================================================================================================*/
		/* Download all the data thanks to a .rla file. */
		/*========================================================================================================================*/
		RLA.prototype.download = function() {
		  var dataset = new Object();
			dataset.scientificname = this.specie_;
			dataset.gbif_id = this.gbif_id_;
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
		/* Create the object for download later as a .rla file. */
		/*========================================================================================================================*/
		RLA.prototype.addMarkers = function(obj,markers) {
			for (var i=0; i<markers.length; i++) {
				var find = false;
				for (var j=0; j<obj.sources.length; j++) {
					if (obj.sources[j].name == markers[i].data.kind) {
						obj.sources[j].points.push(markers[i].data.item);
						find = true;
						break;
					}
				}
			
				if (!find) {
					var new_source = new Object();
					new_source.name = markers[i].data.kind;
					new_source.points = [];
					new_source.points.push(markers[i].data.item);
					obj.sources.push(new_source);
				}

			}
		}
	
	
	
		/*========================================================================================================================*/
		/* Upload the application from a .rla file. */
		/*========================================================================================================================*/
		RLA.prototype.upload = function() {
			
			//loop object and give all the parameters.
			var result = [];
		
			var obj = new Object();
			obj.name = "map";
			obj.center = this.upload_data_.rla.center;
			obj.zoom = this.upload_data_.rla.zoom;
			obj.specie = this.upload_data_.rla.specie;
		
			result.push(obj);
		
			for (var i=0; i<this.upload_data_.rla.sources.length; i++) {
				result.push(this.upload_data_.rla.sources[i]);
			}
			return result;
		}
	
	
	