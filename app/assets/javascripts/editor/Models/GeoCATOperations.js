
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
			
			// VIEWPORT
			
			var report = {
				reportName: 		unescape(report_name),
				viewPort: {
					zoom: 				this.zoom,
					center: {
						latitude: 	this.center.lat(),
						longitude: 	this.center.lng()
					}
				},
				sources: 				[]
			};
			
			
			// OCCS

			this.addMarkers(report,this.markers_);

			
			// ANALYSIS
			
			if (convex_hull.isVisible()) {
				var m_ = analysis_map.toJSON();
				var d_ = analysis_data.toJSON();

				var analysis = {
					EOO: {
						status: 				m_.EOO_type,
						result: 				m_.EOO,
						convex_hull: 		[]
					},
					AOO: {
						status: 				m_.AOO_type,
						result: 				m_.AOO,
						cellsize: 			d_.cellsize,
						cellsize_type: 	d_.celltype,
						grids: 					[]
					}
				};

				// Convex hull vertexes
				if (analysis_map.hull && analysis_map.hull.getPath().getLength() > 2) {
			    for (var i=0, l=analysis_map.hull.getPath().getLength(); i<l; i++) {
  			    var point = analysis_map.hull.getPath().getAt(i);
  			    analysis.EOO.convex_hull.push({ latitude:point.lat(), longitude:point.lng() });
  			  }
			  }

				// Grid polygons vertexes
				for (var id in analysis_map.cells) {
  			  var path_points = [];
  			  for (var i=0; i<analysis_map.cells[id].getPath().getLength(); i++) {
  			    var point = analysis_map.cells[id].getPath().getAt(i);
  			    path_points.push({ latitude:point.lat(), longitude: point.lng() });
  			  }
			    analysis.AOO.grids.push(path_points);
				}

				report.analysis = analysis;
			}


			// LAYERS

			var added_layers = [];
			layers.sort().each(function(layer,i){
				if (layer.get('added')) {
					var obj = layer.toJSON();
					delete obj.layer;
			    added_layers.push(obj);
			  }
			});

			report.layers = added_layers;


			// SEND

			var value_ = JSON.stringify(report);

      $("#format_input").attr("value",format);
      $("#geocat_input").text(value_);
      $("#download_form").submit();
		 	changeApplicationTo(2);
		}



		/*========================================================================================================================*/
		/* Create the object for download later as a .geocat file. */
		/*========================================================================================================================*/
		GeoCAT.prototype.addMarkers = function(obj,markers) {

			var non_valid = ['init_latlng', 'scid', 'dcid'];
			var sources = [];

			_.each(markers, function(m) {

				var dataset = datasets.get(m.data.dcid);
				var occ_data = _.clone(m.data);
				_.each(non_valid, function(v) {
					delete occ_data[v];
				});

				var s = _.find(sources, function(s) {
					return s.dataset === dataset.get('name');
				});

				if (!s) {
					var source = dataset.getSources().get(m.data.scid);
          var d = source.toJSON();
          d.points = [ occ_data ];
          d.dataset = dataset.get('name');
          sources.push(d)
				} else {
					s.points.push( occ_data );
				}
			});

			obj.sources = sources;
			return false;
		}



		/*========================================================================================================================*/
		/* Upload the application from a .geocat file. */
		/*========================================================================================================================*/
		GeoCAT.prototype.upload = function() {
			//loop object and give all the parameters.
			var result = [];
			var obj = new Object();
			obj.center = (this.upload_data_.data.viewPort!=null)? this.upload_data_.data.viewPort.center : {latitude:0,longitude:0};
			obj.zoom = (this.upload_data_.data.viewPort!=null)? this.upload_data_.data.viewPort.zoom : 2;
			obj.reportName = this.upload_data_.data.reportName;


			// Analysis?

			if (this.upload_data_.data.analysis) {

				var analy = this.upload_data_.data.analysis;

			  $('body').unbind('getBounds');

			  analysis_data.set({
			  	cellsize: analy.AOO.cellsize,
			  	celltype: analy.AOO.cellsize_type
			  });

			  convex_hull.cellsize.setSlider();

			  $('a#toggle_analysis').trigger('click');
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

			if (reduction_analysis) return false;

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
          merge_object = new MergeOperations(sources);
          setTimeout(function(){merge_object.checkSources();},1000);
				}
			});


			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					//Get last id from "user_points"
					if (app_data[i].type=='user') {
						// Check if there is a catalogue_id, if not, 0 for global id (YAY!)
						var catalogue_id 	= app_data[i].points[app_data[i].points.length-1].catalogue_id
							, obs_data 			= catalogue_id && catalogue_id.split('_') || ['user', '0'];
						global_id = parseInt(obs_data[1]);
					} else {
					  // Save the sources for the merging stuff
					  var source_pair = {};
					  source_pair.query = app_data[i].query || '';
  				  source_pair.kind = app_data[i].type || 'user';
  					sources.push(source_pair);
					}
					app_data[i].dataset = (!! app_data[i].dataset) ? app_data[i].dataset : app_data[i];
					addSourceToMap(app_data[i],false,true);
					showMamufasMap();
				} else {
				  specie = app_data[0].specie;
					map.setCenter(new google.maps.LatLng(app_data[0].center.latitude,app_data[0].center.longitude));
					map.setZoom(parseInt(app_data[0].zoom));
				}
			}
		}









