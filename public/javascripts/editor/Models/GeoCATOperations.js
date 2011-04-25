
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				GeoCAT => Class to download and upload .geocat files.																															*/
	/*						*Params ->	specie: name of the specie.																																				*/
	/*												markers: whole markers of the map.																																*/
	/*  											map_properties: zoom and center of the map.																												*/
	/*												upload_obj: only if you want to make an upload of this file have to be distinct null.							*/	
	/*  																																																												*/
	/*==========================================================================================================================*/



		function GeoCAT (markers, map_properties, upload_obj) {
			this.upload_data_ = upload_obj;
			this.markers_ = markers;
			this.zoom = (map_properties==null)? null : map_properties.zoom;
			this.center = (map_properties==null)? null : map_properties.center;
		}



		/*========================================================================================================================*/
		/* Download all the data thanks to a .GeoCAT file. */
		/*========================================================================================================================*/
		GeoCAT.prototype.download = function(format) {
		  var dataset = new Object();
			// Report name
			dataset.reportName = unescape(report_name);
			
			// Viewport 
			dataset.viewPort = {};
			dataset.viewPort.zoom = this.zoom;
			dataset.viewPort.center = new Object();
			dataset.viewPort.center.latitude = this.center.lat();
			dataset.viewPort.center.longitude = this.center.lng();
			dataset.sources = [];
			this.addMarkers(dataset,this.markers_);
			
			// Analysis
			var analysis = new Object();
			// Send analysis if it is visible
			if (convex_hull.isVisible()) {
			  dataset.analysis = new Object();
			  analysis.EOO = new Object();
			  analysis.EOO.status = convex_hull.EOOkind;
			  analysis.EOO.result = convex_hull.EOO;
			  analysis.EOO.convex_hull = [];
			  if (convex_hull.polygon!=undefined && convex_hull.polygon.getPath().getLength()>2) {
			    for (var i=0; i<convex_hull.polygon.getPath().getLength(); i++) {
  			    var point = convex_hull.polygon.getPath().getAt(i);
  			    analysis.EOO.convex_hull.push({latitude:point.lat(), longitude:point.lng()});
  			  }
			  }
			  
			  analysis.AOO = new Object();
			  analysis.AOO.status = convex_hull.AOOkind;
			  analysis.AOO.result = convex_hull.AOO;
			  analysis.AOO.cellsize_type = convex_hull.cellsize_type;
			  analysis.AOO.cellsize = convex_hull.cellsize;
			  analysis.AOO.cellsize_step = $("div.cellsize div.slider").slider('value');
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
			
			
			// Add active Layers
			var added_layers = [];
			for (var i in layers.layers) {
			  if (layers.layers[i].add) {
			    var obj = _.clone(layers.layers[i]);
			    delete obj.layer;
			    delete obj.add;
			    obj.url = i;
			    added_layers.push(obj);
			  }
			}
			dataset.layers = added_layers;
		
		  
      $("#format_input").attr("value",format);
      $("#geocat_input").attr("value",JSON.stringify(dataset));
      $("#download_form").submit();
			changeApplicationTo(2);
		}



		/*========================================================================================================================*/
		/* Create the object for download later as a .geocat file. */
		/*========================================================================================================================*/
		GeoCAT.prototype.addMarkers = function(obj,markers) {
			for (var i in markers) {
				var find = false;
				for (var j=0; j<obj.sources.length; j++) {
					if (obj.sources[j].query == markers[i].data.geocat_query && obj.sources[j].type == markers[i].data.geocat_kind) {
					  for (var prop in markers[i].data) {
  					  if (markers[i].data[prop]==undefined || markers[i].data[prop].length==0 && prop!='geocat_query') {
      					delete markers[i].data[prop];
  					  }
            }
  					delete markers[i].data.init_latlng;
  					(markers[i].data.geocat_kind!='user')?markers[i].data.recordSource=markers[i].data.kind:markers[i].data.recordSource="Added by user";
						obj.sources[j].points.push(markers[i].data);
						find = true;
						break;
					}
				}


				if (!find) {
					var new_source = new Object();
					new_source.type = markers[i].data.geocat_kind;
					new_source.query = markers[i].data.geocat_query;
					new_source.points = [];
					for (var prop in markers[i].data) {
            if (markers[i].data[prop]==undefined || markers[i].data[prop].length==0 && prop!='geocat_query') {
              delete markers[i].data[prop];
            }
          }
					delete markers[i].data.init_latlng;
          (markers[i].data.geocat_kind!='user')?markers[i].data.recordSource=markers[i].data.kind:markers[i].data.recordSource="Added by user";

					new_source.points.push(markers[i].data);
					obj.sources.push(new_source);
				}
			}
		}
	
	
	
		/*========================================================================================================================*/
		/* Upload the application from a .geocat file. */
		/*========================================================================================================================*/
		GeoCAT.prototype.upload = function() {
			//loop object and give all the parameters.
			var result = [];
			var obj = new Object();
			obj.center = this.upload_data_.data.viewPort.center;
			obj.zoom = this.upload_data_.data.viewPort.zoom;
			obj.reportName = this.upload_data_.data.reportName;
			
			//If there is analysis
			if (this.upload_data_.data.analysis!=undefined) {
			  $('a#toggle_analysis').trigger('click');
			  $('body').unbind('getBounds');
			  if (this.upload_data_.data.analysis.AOO.cellsize_type=='auto') {
			    $('#auto_value').trigger('click');
			  } else {
			    var cellsize = this.upload_data_.data.analysis.AOO.cellsize_step;
			    $("div.cellsize span p").text(cellsize + 'KM');
			    $("div.cellsize div.slider").slider('value',cellsize);
			    convex_hull.cellsize = cellsize;
			    convex_hull.cellsize_type = this.upload_data_.data.analysis.AOO.cellsize_type;
			    convex_hull.removeAOOPolygons();
			  }
			}
			
			result.push(obj);
			for (var i=0; i<this.upload_data_.data.sources.length; i++) {
				result.push(this.upload_data_.data.sources[i]);
			}
			return result;
		}
		


		/*===============================================================================================================*/
		/* Download to your computer one .geocat file with all the points and properties you have at the moment in the map. */
		/*===============================================================================================================*/
		function downloadGeoCAT(format) {
			var map_inf = new Object();
			map_inf.zoom = map.getZoom();
			map_inf.center = map.getCenter();
			var geocat = new GeoCAT(occurrences,map_inf,null);
			geocat.download(format);		
		}
		
		
		
		
		/*===============================================================*/
		/* Restore the application thanks to the file you have uploaded. */
		/*===============================================================*/
		function uploadGeoCAT(upload_data) {
			var geocat = new GeoCAT(null,null,upload_data);
			var app_data = geocat.upload();
			var sources = [];
			
			//Trick for showing loader while uploading observations;
			var sources_length = app_data.length-1;
			var count = 0;
			
			$('body').bind('hideMamufas', function(ev){
				count++;
				if (sources_length==count) {
					$('body').unbind('hideMamufas');
					hideMamufasMap(true);
					
          $('div.header h1 p').text(app_data[0].reportName);
          $('div.header h1 sup').text('saved');
					changeApplicationTo(2);
          
					//Merge points from service
					//merge_object = new MergeOperations(sources);
					//setTimeout(function(){merge_object.checkSources();},1000);
				}
			});
			
			
			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					//Get last id from "user_points"
					if (app_data[i].type=='user') {
						var obs_data = app_data[i].points[app_data[i].points.length-1].catalogue_id.split('_');
						global_id = parseInt(obs_data[1]);
					} else {
					  // Save the sources for the merging stuff
					  var source_pair = {};
					  source_pair.query = app_data[i].query;
  				  source_pair.kind = app_data[i].type;
  					sources.push(source_pair);
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
		
		
		
		
		
		
	
	
	