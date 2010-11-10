
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				RLA => Class to download and upload .rla files.																																		*/
	/*						*Params ->	specie: name of the specie.																																				*/
	/*												markers: whole markers of the map.																																*/
	/*  											map_properties: zoom and center of the map.																												*/
	/*												upload_obj: only if you want to make an upload of this file have to be distinct null.							*/	
	/*  																																																												*/
	/*==========================================================================================================================*/



		function RLA (specie, markers, map_properties, upload_obj) {
			this.specie_ = specie;
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
			dataset.zoom = this.zoom;
			dataset.center = new Object();
			dataset.center.latitude = this.center.lat();
			dataset.center.longitude = this.center.lng();
			dataset.sources = [];
			this.addMarkers(dataset,this.markers_);		
		
      $("#rla_input").attr("value",JSON.stringify(dataset));
      $("#download_form").submit();
			changeApplicationTo(2);
		}



		/*========================================================================================================================*/
		/* Create the object for download later as a .rla file. */
		/*========================================================================================================================*/
		RLA.prototype.addMarkers = function(obj,markers) {
			for (var i in markers) {
				var find = false;
				for (var j=0; j<obj.sources.length; j++) {
					if (obj.sources[j].name == markers[i].data.kind) {
						obj.sources[j].points.push(markers[i].data);
						find = true;
						break;
					}
				}

				if (!find) {
					var new_source = new Object();
					new_source.name = markers[i].data.kind;
					new_source.points = [];
					new_source.points.push(markers[i].data);
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
			obj.center = this.upload_data_.center;
			obj.zoom = this.upload_data_.zoom;
			obj.specie = this.upload_data_.scientificname;
			result.push(obj);
		
			for (var i=0; i<this.upload_data_.sources.length; i++) {
				result.push(this.upload_data_.sources[i]);
			}
			
			return result;
		}
		


		/*===============================================================================================================*/
		/* Download to your computer one .rla file with all the points and properties you have at the moment in the map. */
		/*===============================================================================================================*/
		
		function downloadRLA() {
			var map_inf = new Object();
			map_inf.zoom = map.getZoom();
			map_inf.center = map.getCenter();
			var rla = new RLA(specie,_markers,map_inf,null);
			rla.download();		
		}
		
		
		
		
		/*===============================================================*/
		/* Restore the application thanks to the file you have uploaded. */
		/*===============================================================*/
		
		function uploadRLA(upload_data) {
			var rla = new RLA(null,null,null,upload_data);
			var app_data = rla.upload();
			var sources = [];
			
			//Trick for showing loader while uploading observations;
			var sources_length = app_data.length-1;
			var count = 0;
			
			$('body').bind('hideMamufas', function(ev){
				count++;
				if (sources_length==count) {
					$('body').unbind('hideMamufas');
					hideMamufasMap(true);
				}
			});
			
			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					sources.push(app_data[i].name);
					
					//Get last id from "your points"
					if (app_data[i].name=='your') {
						var obs_data = app_data[i].points[app_data[i].points.length-1].catalogue_id.split('_');
						global_id = parseInt(obs_data[1]);
					}
					
					addSourceToMap(app_data[i],false,true);
					showMamufasMap();
				} else {
					map.setCenter(new google.maps.LatLng(app_data[0].center.latitude,app_data[0].center.longitude));
					map.setZoom(parseInt(app_data[0].zoom));				
				}
			}

			
			$('div.header h1').html(app_data[0].specie+'<sup>(saved)</sup>');
			changeApplicationTo(2);
			
			//Merge points from service
			merge_object = new MergeOperations(sources);
			setTimeout(function(){merge_object.checkSources();},1000);
				
		}
		
		
		
		
		
		
	
	
	