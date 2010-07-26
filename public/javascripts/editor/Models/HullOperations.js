
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*							Hull => Class to create & re-generate Convex Hull Polygon data and google maps polygon included.						*/
			/*									*Params ->	specie: name of the specie.																																				*/
			/*															flickr: flickr data information.																																	*/
			/*															gbif: gbif data information.																																			*/
			/*															own: your own data information.																																		*/
			/*															markers: whole markers of the map.																																*/
			/*  														map_properties: zoom and center of the map.																												*/
			/*															upload_obj: only if you want to make an upload of this file have to be distinct null.							*/	
			/*  																																																															*/
			/*==========================================================================================================================*/			
	
			
			function HullOperation(map) {
				
				this.active_markers = [];
				this.polygon = new google.maps.Polygon(
					paths: [],
		      strokeColor: "#333333",
		      strokeOpacity: 1,
		      strokeWeight: 2,
		      fillColor: "#000000",
		      fillOpacity: 0.25
				);
			}
			
			
			
			HullOperation.prototype.calculateConvexHull = function() {
				
			}
			
			
			

			function calculateConvexHull() {
	    	_active_markers.sort(sortPointY);
	    	_active_markers.sort(sortPointX);
	    	DrawHull();
			}


	   	function sortPointX(a,b) { return a.position.c - b.position.c; }
	   	function sortPointY(a,b) { return a.position.b - b.position.b; }


	   	function DrawHull() {
	   		chainHull_2D( _active_markers, _active_markers.length, hullPoints);
				if (hull_polygon) {
					hull_polygon.setPath(markersToPoints(hullPoints));
				} else {
		   		hull_polygon = new google.maps.Polygon({
						paths: markersToPoints(hullPoints),
			      strokeColor: "#333333",
			      strokeOpacity: 1,
			      strokeWeight: 2,
			      fillColor: "#000000",
			      fillOpacity: 0.25
					});
					hull_polygon.setMap(map);
					google.maps.event.addListener(hull_polygon,"click",function(event){
						if (state == 'add') {
							addMarker(event.latLng);
						}
					});
				}
				if (!is_dragging) 
					getPolygonArea(hull_polygon.getPath().b);
		  }



			function markersToPoints(array) {
				var result = [];
				for (var i=0; i<array.length; i++) {
						result.push(new google.maps.LatLng(array[i].position.b,array[i].position.c));
				}
				return result;
			}



			function openConvexHull() {
				if (hull_polygon) {
					hull_polygon.setMap(map);
				}
				var position = $('#convex').offset();
				$('div.hull_container').css('top',position.top + 'px');
				$('#convex').css('margin-bottom','300px');
				$('div.hull_container').fadeIn('fast');
				createActiveMarkers();
				calculateConvexHull();
			}



			function closeConvexHull() {
				hull_polygon.setMap(null);
				$('#convex').css('margin-bottom','0px');
				$('div.hull_container').fadeOut('slow');
			}


			function isConvexHull() {
				return $('div.hull_container').is(':visible');
			}


			function createActiveMarkers() {
				_active_markers = [];
				for (var i in _markers) {
					if (_markers[i].data.active && !_markers[i].data.removed) {
						_active_markers.push(_markers[i]);
					}
				}
			}


			function deleteItemConvexHull(marker_id) {
				for (var i=0; i<_active_markers.length; i++) {
					if (_active_markers[i].data.catalogue_id == marker_id) {
						_active_markers.splice(i,1);
						break;
					}
				}
			}


			function getPolygonArea(path) {
				var points='';
					for (var i=0; i<path.length; i++) {
						points+=path[i].c+','+path[i].b+'|';
					}
					points=points.slice(0,points.length-1);

					$.getJSON('http://api.geojason.info/v1/ws_geo_length_area.php?format=json&in_srid=4326&out_srid=2264&points='+points+'&callback=?',function(data){
						if (parseInt(data.total_rows)>0){
							var length = parseFloat(data.rows[0].row.length);
							var area = parseFloat(data.rows[0].row.area);
							var area_length = String((area/10000000).toFixed(2)).length;
							$('p.area').html((area/10000000).toFixed(0) + '<sup>.'+ String((area/10000000).toFixed(2)).substring(area_length-2) +'</sup> <small>(km<sup>2</sup>)</small>');
						}
					});

			}