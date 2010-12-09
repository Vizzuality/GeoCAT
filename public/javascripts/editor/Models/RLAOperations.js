
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
		RLA.prototype.download = function(format) {
		  var dataset = new Object();
			dataset.scientificname = unescape(this.specie_);
			dataset.zoom = this.zoom;
			dataset.center = new Object();
			dataset.center.latitude = this.center.lat();
			dataset.center.longitude = this.center.lng();
			dataset.sources = [];
			this.addMarkers(dataset,this.markers_);
			
			var analysis = new Object();
			
			// Send analysis if it is visible
			if (convex_hull.isVisible()) {
			  dataset.analysis = new Object();
			  analysis.cellsize_type = (convex_hull.cellsize==0)?'auto':'user_defined';
			  analysis.cellsize = convex_hull.cellsize;
			  analysis.cellsize_step = $("div.cellsize div.slider").slider('value');
			  analysis.EOO = new Object();
			  analysis.EOO.status = convex_hull.EOOkind;
			  analysis.EOO.result = convex_hull.EOO;
			  analysis.EOO.convex_hull = [];
			  for (var i=0; i<convex_hull.polygon.getPath().getLength(); i++) {
			    var point = convex_hull.polygon.getPath().getAt(i);
			    analysis.EOO.convex_hull.push({latitude:point.lat(), longitude:point.lng()});
			  }
			  
			  analysis.AOO = new Object();
			  analysis.AOO.status = convex_hull.AOOkind;
			  analysis.AOO.result = convex_hull.AOO;
			  analysis.AOO.grids = [];
			  
			  for (var id in convex_hull.Cells) {
  			  
  			  var path_points = [];
  			  for (var i=0; i<convex_hull.Cells[id].getPath().getLength(); i++) {
  			    var point = convex_hull.Cells[id].getPath().getAt(i);
  			    path_points.push({latitude:point.lat(), longitude:point.lng()});
  			  }
			    analysis.AOO.grids.push(path_points);
				}
				dataset.analysis = analysis;
			}
			
		
		  $("#format_input").attr("value",format);
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
					  
					  for (var prop in markers[i].data) {
  					  if (markers[i].data[prop]=='' || markers[i].data[prop]==null) {
      					delete markers[i].data[prop];
  					  }
            }
					  
  					delete markers[i].data.init_latlng;
						obj.sources[j].points.push(markers[i].data);
						find = true;
						break;
					}
				}

				if (!find) {
					var new_source = new Object();
					new_source.name = markers[i].data.kind;
					new_source.points = [];
					
					for (var prop in markers[i].data) {
					  if (markers[i].data[prop]=='' || markers[i].data[prop]==null) {
    					delete markers[i].data[prop];
					  }
          }
					
					delete markers[i].data.init_latlng;
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
			obj.center = this.upload_data_.data.center;
			obj.zoom = this.upload_data_.data.zoom;
			obj.specie = this.upload_data_.data.scientificname;
			
			//If there is analysis
			if (this.upload_data_.data.analysis!=undefined) {
			  $('a#toggle_analysis').trigger('click');
			  $('body').unbind('getBounds');
			  if (this.upload_data_.data.analysis.cellsize_type=='auto') {
			    $('#auto_value').trigger('click');
			  } else {
			    $("div.cellsize div.slider").slider('value',this.upload_data_.data.analysis.cellsize_step);
			    convex_hull.cellsize = 0.002*(Math.pow(2,this.upload_data_.data.analysis.cellsize_step-1));
			    convex_hull.removeAOOPolygons();
			    convex_hull.setAlgorithmValues(convex_hull.cellsize);
			  }
			}
			
			result.push(obj);
		  
			for (var i=0; i<this.upload_data_.data.sources.length; i++) {
				result.push(this.upload_data_.data.sources[i]);
			}
			
			return result;
		}
		


		/*===============================================================================================================*/
		/* Download to your computer one .rla file with all the points and properties you have at the moment in the map. */
		/*===============================================================================================================*/
		
		function downloadRLA(format) {
			var map_inf = new Object();
			map_inf.zoom = map.getZoom();
			map_inf.center = map.getCenter();
			var rla = new RLA(specie,_markers,map_inf,null);
			rla.download(format);		
		}
		
		
		
		
		/*===============================================================*/
		/* Restore the application thanks to the file you have uploaded. */
		/*===============================================================*/
		
		function uploadRLA(upload_data) {
			var rla = new RLA(null,null,null,upload_data);
			var app_data = rla.upload();
			var sources = [];
			
			console.log(upload_data);
			//Trick for showing loader while uploading observations;
			var sources_length = app_data.length-1;
			var count = 0;
			
			$('body').bind('hideMamufas', function(ev){
				count++;
				if (sources_length==count) {
					$('body').unbind('hideMamufas');
					hideMamufasMap(true);
					$('div.header h1').html(app_data[0].specie+'<sup>(saved)</sup>');
					changeApplicationTo(2);

					//Merge points from service
					merge_object = new MergeOperations(sources);
					setTimeout(function(){merge_object.checkSources();},1000);
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
				  specie = app_data[0].specie;
					map.setCenter(new google.maps.LatLng(app_data[0].center.latitude,app_data[0].center.longitude));
					map.setZoom(parseInt(app_data[0].zoom));				
				}
			}
		}
		
		
		
		
		
		
	
	
	