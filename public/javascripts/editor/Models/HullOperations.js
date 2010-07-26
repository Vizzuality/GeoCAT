
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*							Hull => Class to create & re-generate Convex Hull Polygon data and google maps polygon included.						*/
			/*									*Params ->	map: where draws the polygon.																																*/
			/*  																																																												*/
			/*==========================================================================================================================*/			
	
			
			function HullOperations(_map) {
				this.visible = false;
				this.active_markers = [];
				this.map = _map;
			}
			
			
			/*========================================================================================================================*/
			/* Create the polygon when the user open convex the hull window. */
			/*========================================================================================================================*/
			HullOperations.prototype.createPolygon = function(markers) {
				this.visible = true;
				this.createActivePoints(markers);
				this.calculateConvexHull();
				this.polygon.setMap(this.map);
			}
			


			/*========================================================================================================================*/
			/* Remove from the map the polygon when the user close the convex hull window. */
			/*========================================================================================================================*/
			HullOperations.prototype.removePolygon = function() {
				this.visible = false;
				this.active_markers = [];
				this.polygon.setMap(null);
			}
			
			

			/*========================================================================================================================*/
			/* Function to sort the markers for Convex Hull Operation. */
			/*========================================================================================================================*/
			HullOperations.prototype.sortPointX = function(a,b) {return a.position.c - b.position.c;}
			HullOperations.prototype.sortPointY = function(a,b) {return a.position.b - b.position.b;}



			/*========================================================================================================================*/
			/* Calculate operations before draw the polygon. */
			/*========================================================================================================================*/
			HullOperations.prototype.calculateConvexHull = function() {
				this.active_markers.sort(this.sortPointY);
	    	this.active_markers.sort(this.sortPointX);
	    	this.drawHull();
			}
			
			
			
			/*========================================================================================================================*/
			/* Filter all the map markers to add only the active ones. */
			/*========================================================================================================================*/
			HullOperations.prototype.createActivePoints = function(all_markers) {
				this.active_markers = [];
				for (var i in all_markers) {
					if (all_markers[i].data.active && !all_markers[i].data.removed) {
						this.active_markers.push(all_markers[i]);
					}
				}
				
			}


			/*========================================================================================================================*/
			/* Add new point to active markers. */
			/*========================================================================================================================*/
			HullOperations.prototype.addPoint = function(marker) {
				this.active_markers.push(marker);
				this.calculateConvexHull();
			}
			
			
			
			/*========================================================================================================================*/
			/* Dedeuct one point from active markers. */
			/*========================================================================================================================*/
			HullOperations.prototype.deductPoint = function(marker_id) {
				for (var i=0; i<this.active_markers.length; i++) {
					if (this.active_markers[i].data.catalogue_id == marker_id) {
						this.active_markers.splice(i,1);
						break;
					}
				}
				this.calculateConvexHull();
			}
			
			
			/*========================================================================================================================*/
			/* Draw the convex hull polygon. */
			/*========================================================================================================================*/
			HullOperations.prototype.drawHull= function() {
				var hullPoints = [];
				chainHull_2D( this.active_markers, this.active_markers.length, hullPoints);
				
				if (this.polygon != undefined) {
					this.polygon.setPath(this.markersToPoints(hullPoints));
					
				} else {
				   	this.polygon = new google.maps.Polygon({
						paths: this.markersToPoints(hullPoints),
			      strokeColor: "#333333",
			      strokeOpacity: 1,
			      strokeWeight: 2,
			      fillColor: "#000000",
			      fillOpacity: 0.25
					});
					google.maps.event.addListener(this.polygon,"click",function(event){
						if (state == 'add') {
							addMarker(event.latLng);
						}
					});
				}

				if (!is_dragging) 
					this.getPolygonArea(this.polygon.getPath().b);
			}
			
			
			
			/*========================================================================================================================*/
			/* Get the convex hull polygon area and show the figures in the convex hull window. */
			/*========================================================================================================================*/
			HullOperations.prototype.getPolygonArea = function(path) {
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



			/*========================================================================================================================*/
			/* Return if the convex hull is visible or not. */
			/*========================================================================================================================*/
			HullOperations.prototype.isVisible = function() {
				return this.visible;
			}




			/*========================================================================================================================*/
			/* Transform the google maps markers to points with only latitude and longitude. */
			/*========================================================================================================================*/
			HullOperations.prototype.markersToPoints = function(path) {
				var result = [];
				for (var i=0; i<path.length; i++) {
						result.push(new google.maps.LatLng(path[i].position.b,path[i].position.c));
				}
				return result;
			}




			









