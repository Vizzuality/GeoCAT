
		/*==========================================================================================================================*/
		/*  																																																												*/
		/*									Hull => Class to create & re-generate Convex Hull Polygon data and google maps polygon included.				*/
		/*											*Params ->	map: where draws the polygon.																														*/
		/*  																																																												*/
		/*==========================================================================================================================*/			


		function HullOperations(_map) {
			this.visible = false;
			this.active_markers = [];
			this.Cells = [];
			this.map = _map;
			this.cellsize = 5;
			
			var me = this;
			
			
			/* Binding events of DOM elements related to HULLOperations  */
			
			//Hull convex slider
			$("div.cellsize div.slider").slider({
				range: "min",
				value: 5,
				min: 5,
				max: 50,
				slide: function(event, ui) {
					me.cellsize = ui.value;
					me.removeAOOPolygons();
					me.setAlgorithmValues(ui.value);
				}
			});
			
		}


		/*========================================================================================================================*/
		/* Create the polygon when the user open convex the hull window. */
		/*========================================================================================================================*/
		HullOperations.prototype.createPolygon = function(markers) {
			this.visible = true;
			this.createActivePoints(markers);
			if (this.polygon!=undefined) {
				this.polygon.setMap(this.map);
			}
		}



		/*========================================================================================================================*/
		/* Remove from the map the polygon when the user close the convex hull window. */
		/*========================================================================================================================*/
		HullOperations.prototype.removePolygon = function() {
			this.visible = false;
			this.active_markers = [];
			if (this.polygon!=undefined) {
				this.polygon.setMap(null);
				this.removeAOOPolygons();
			}
			closeCellsizeContainer();
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
			if (this.active_markers.length>2) {
				this.calculateConvexHull();
			}
		}


		/*========================================================================================================================*/
		/* Function to sort the markers for Convex Hull Operation. */
		/*========================================================================================================================*/
		HullOperations.prototype.sortPointX = function(a,b) {return a.getPosition().lng() - b.getPosition().lng();}
		HullOperations.prototype.sortPointY = function(a,b) {return a.getPosition().lat() - b.getPosition().lat();}



		/*========================================================================================================================*/
		/* Calculate operations before drawlng() the polygon. */
		/*========================================================================================================================*/
		HullOperations.prototype.calculateConvexHull = function() {
			this.removeAOOPolygons();
			this.active_markers.sort(this.sortPointY);
			this.active_markers.sort(this.sortPointX);
			this.drawHull();
		}



		/*========================================================================================================================*/
		/* Add new point to active markers. */
		/*========================================================================================================================*/
		HullOperations.prototype.addPoint = function(marker) {
			this.active_markers.push(marker);
			if (this.active_markers.length>2) {
				if (this.polygon!=undefined) {
					this.polygon.setMap(this.map);
					this.calculateConvexHull();
				} else {
					this.createPolygon(_markers);
				}
			}
		}



		/*========================================================================================================================*/
		/* Deduct one point from active markers. */
		/*========================================================================================================================*/
		HullOperations.prototype.deductPoint = function(marker_id) {
			for (var i=0; i<this.active_markers.length; i++) {
				if (this.active_markers[i].data.catalogue_id == marker_id) {
					this.active_markers.splice(i,1);
					break;
				}
			}
			if (this.active_markers.length>2) {
				this.calculateConvexHull();
			} else {
				this.polygon.setMap(null);
				this.resetAlgorithmValues();
			}
		}


		/*========================================================================================================================*/
		/* Draw the convex hull polygon. */
		/*========================================================================================================================*/
		HullOperations.prototype.drawHull= function() {
			var hullPoints = [];
	
			chainHull_2D(this.active_markers, this.active_markers.length, hullPoints);
	
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
						addMarker(event.latLng,null,false);
					}
				});
		
			}
			
			this.setAlgorithmData(this.polygon.getPath().b, this.cellsize*1000);
		}
		
		
		/*========================================================================================================================*/
		/* Transform the google maps markers to points with only latitude and longitude. */
		/*========================================================================================================================*/
		HullOperations.prototype.markersToPoints = function(path) {
			var result = [];
			for (var i=0; i<path.length; i++) {
					result.push(path[i].getPosition());
			}
			return result;
		}
		
		
		
		
		/*========================================================================================================================*/
		/* . */
		/*========================================================================================================================*/
		HullOperations.prototype.drawAOOPolygons = function(path) {
				for (var id in this.Cells) {
					this.Cells[id].setMap(this.map);
				}
		}
		
		
		/*========================================================================================================================*/
		/* . */
		/*========================================================================================================================*/
		HullOperations.prototype.removeAOOPolygons = function(path) {
			for (var id in this.Cells) {
				this.Cells[id].setMap(null);
			}
			this.Cells = new Array();
		}
		



		/*========================================================================================================================*/
		/* Get the convex hull polygon area and show the figures in the convex hull window. */
		/*========================================================================================================================*/
		HullOperations.prototype.setAlgorithmData = function(path, cellsize) {
			var obj = getAnalysisData(calculateArea(path), path, this.active_markers, cellsize);
			this.Cells = obj.Cells;
			this.drawAOOPolygons();
			$('div.analysis_data ul li:eq(0)').addClass(obj.EOORat);
			$('div.analysis_data ul li:eq(0) p:eq(0)').html(obj.EOOArea.toFixed(2)+' km<sup>2</sup>');
			$('div.analysis_data ul li:eq(1)').addClass(obj.AOORat);
			$('div.analysis_data ul li:eq(1) p:eq(0)').html(obj.AOOArea.toFixed(2)+' km<sup>2</sup>');
		}
		
		
		/*========================================================================================================================*/
		/* Set values of the algorithm data. */
		/*========================================================================================================================*/
		HullOperations.prototype.setAlgorithmValues = function(value) {
			$('div.cellsize span p').text(value+'KM');
			$('div.analysis p.change').html('Cellsize '+value+'km, <a onclick="openCellsizeContainer()">change</a>');
			if (this.polygon!=undefined && this.polygon.getPath().b.length>2) {
				this.setAlgorithmData(this.polygon.getPath().b,this.cellsize*1000);
			}
		}
		
		
		
		/*========================================================================================================================*/
		/* Reset values of the algorithms. */
		/*========================================================================================================================*/
		HullOperations.prototype.resetAlgorithmValues = function() {
			$('div.analysis_data ul li:eq(0)').removeClass();
			$('div.analysis_data ul li:eq(0) p:eq(0)').html('0 km<sup>2</sup>');
			$('div.analysis_data ul li:eq(1)').removeClass();
			$('div.analysis_data ul li:eq(1) p:eq(0)').html('0 km<sup>2</sup>');
		}




		/*========================================================================================================================*/
		/* Return if the convex hull is visible or not. */
		/*========================================================================================================================*/
		HullOperations.prototype.isVisible = function() {
			return this.visible;
		}
		
		
		
		
		function openCellsizeContainer() {
			$('div.cellsize').fadeIn();
		}
		
		
		function closeCellsizeContainer() {
			$('div.cellsize').fadeOut();
		}


















