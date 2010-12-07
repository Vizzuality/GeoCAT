
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
				this.cellsize = 0.002*(Math.pow(2,10));

				var me = this;
			
			
				/* Binding events of DOM elements related to HULLOperations  */
			
				//toggle on/off analysis
				$('a#toggle_analysis').click(function(ev){
					if ($(this).hasClass('disabled')) {
						$('body').bind('getBounds',function(ev){
							var bounds = new google.maps.LatLngBounds();
							for (var i in ev.points) {
								bounds.extend(ev.points[i]);
							}
							map.fitBounds(bounds);
							$('body').unbind('getBounds');
						});
						openConvexHull();
						$(this).parent().children().removeClass('disabled');
						$(this).parent().children('h3').text('Analysis enabled');
						$(this).find('span').stop(true).animate({backgroundPosition: '-1px -25px'}, 100);
						$('div.analysis_data').stop().animate({height: '144px'}, 'fast',function(ev){$(this).css('overflow','auto');});
						$('#analysis_help').css('background','url(/images/editor/analysis_help2.png) no-repeat -2px 0');
					} else {
					  $('body').unbind('click');
						closeConvexHull();
						$(this).addClass('disabled');
						$(this).parent().children('h3').addClass('disabled');
						$(this).parent().children('h3').text('Analysis disabled');
						$(this).find('span').stop(true).animate({backgroundPosition: '-28px -25px'}, 100);
						$('div.analysis_data').stop().animate({height: '0'}, 'fast',function(ev){$(this).css('overflow','auto');});
						$('#analysis_help').css('background','url(/images/editor/analysis_help.png) no-repeat 0 0');
					}
				});
			
			
				//Hull convex slider
				$("div.cellsize div.slider").slider({
					range: "min",
					value: 11,
					min: 1,
					max: 21,
					slide: function(event, ui) {
						me.cellsize = 0.002*(Math.pow(2,ui.value-1));
						me.removeAOOPolygons();
						me.setAlgorithmValues(me.cellsize);
					}
				});
				
			
				//Choose default value 
				$('a.default').click(function(ev){
				  if (!$(this).hasClass('disabled')) {
				    $("div.cellsize div.slider").slider({value:11});
  					me.cellsize = 2.0;
  					me.removeAOOPolygons();
  					me.setAlgorithmValues(me.cellsize);
				  }
				});
			
			
				//Close Cellsize
				$("div.cellsize a.done").click(function(){
				  $('body').unbind('click');
				  $('div.cellsize').fadeOut();
				});
			
				//Open Cellsize
				$("p.change a.change").livequery('click',function(ev){
				  ev.stopPropagation();
				  ev.preventDefault();
				  $('body').click(function(event) {
  				  if (!$(event.target).closest('div.cellsize').length) {
  				    $('div.cellsize').fadeOut();
  						$('body').unbind('click');
  				  };
  				});
				  $('div.cellsize').fadeIn();
				  $(document).keydown(function (e) {
						if (e.keyCode == 27) { // ESC
							$('div.cellsize').fadeOut();
						}
					});
					
				});
				
				
				
				$('#auto_value').click(function(){
				  if ($(this).hasClass('selected')) {
				    me.cellsize = me.beforeValue;
						$(this).removeClass('selected');
    				$('div.analysis p.change').html('Cell size '+me.beforeValue+'KM , <a class="change">change</a>');
						$("div.cellsize div.slider").slider('enable');
						$('.ui-widget-header').css('background','#F6A828');
						$('div.cellsize span p').css('color','#F7AC53');
						$('a.default').removeClass('disabled');
						me.removeAOOPolygons();
						if (me.polygon!=undefined && me.polygon.getPath().getLength()>2) {
    					me.setAlgorithmData(me.polygon.getPath().getArray(),me.cellsize*1000);
    				}
					} else {
					  me.beforeValue = me.cellsize;
				    me.cellsize = 0;
    				$('div.analysis p.change').html('Cell size in auto value, <a class="change">change</a>');
						$(this).addClass('selected');
						$("div.cellsize div.slider").slider('disable');
						$('.ui-widget-header').css('background','#999999');
						$('div.cellsize span p').css('color','#999999');
						$('a.default').addClass('disabled');
						me.removeAOOPolygons();
						if (me.polygon!=undefined && me.polygon.getPath().getLength()>2) {
    					me.setAlgorithmData(me.polygon.getPath().getArray(),me.cellsize);
    				}
					}
				});
				
			}



			/*============================================================================*/
			/* Create the polygon when the user open convex the hull window. 							*/
			/*============================================================================*/
			HullOperations.prototype.createPolygon = function(markers) {
				this.visible = true;
				this.createActivePoints(markers);
				if (this.polygon!=undefined) {
					this.polygon.setMap(this.map);
				}
			}



			/*==============================================================================*/
			/* Remove from the map the polygon when the user close the convex hull window.  */
			/*==============================================================================*/
			HullOperations.prototype.removePolygon = function() {
				this.visible = false;
				this.active_markers = [];
				if (this.polygon!=undefined) {
					this.polygon.setMap(null);
					this.removeAOOPolygons();
				}
				$('div.cellsize').fadeOut();
			}



			/*==============================================================================*/
			/* Filter all the map markers to add only the active ones. 											*/
			/*==============================================================================*/
			HullOperations.prototype.createActivePoints = function(all_markers) {
				this.active_markers = [];
				for (var i in all_markers) {
					if (all_markers[i].data.active && !all_markers[i].data.removed) {
						this.active_markers.push(all_markers[i]);
					}
				}
				if (this.active_markers.length>2) {
					this.calculateConvexHull(false);
				}
			}



			/*==============================================================================*/
			/* Function to sort the markers for Convex Hull Operation. 											*/
			/*==============================================================================*/
			HullOperations.prototype.sortPointX = function(a,b) {return a.getPosition().lng() - b.getPosition().lng();}
			HullOperations.prototype.sortPointY = function(a,b) {return a.getPosition().lat() - b.getPosition().lat();}



			/*==============================================================================*/
			/* Calculate operations before drawlng() the polygon. 													*/
			/*==============================================================================*/
			HullOperations.prototype.calculateConvexHull = function(dragging) {
				this.removeAOOPolygons();
				this.active_markers.sort(this.sortPointY);
				this.active_markers.sort(this.sortPointX);
				this.drawHull(dragging);
			}



			/*==============================================================================*/
			/* Add new point to active markers. 																						*/
			/*==============================================================================*/
			HullOperations.prototype.addPoint = function(marker) {
				this.active_markers.push(marker);
				if (this.active_markers.length>2) {
					if (this.polygon!=undefined) {
						this.polygon.setMap(this.map);
						this.calculateConvexHull(false);
					} else {
						this.createPolygon(_markers);
					}
				}
			}



			/*============================================================================*/
			/* Deduct one point from active markers. 																			*/
			/*============================================================================*/
			HullOperations.prototype.deductPoint = function(marker_id) {
				for (var i=0; i<this.active_markers.length; i++) {
					if (this.active_markers[i].data.catalogue_id == marker_id) {
						this.active_markers.splice(i,1);
						break;
					}
				}
				if (this.active_markers.length>2) {
					this.calculateConvexHull(false);
				} else {
				  this.polygon.setPath([]);
				  this.removeAOOPolygons();
					this.polygon.setMap(null);
					this.resetAlgorithmValues();
				}
			}



			/*============================================================================*/
			/* Draw the convex hull polygon. 																							*/
			/*============================================================================*/
			HullOperations.prototype.drawHull= function(dragging) {
				var hullPoints = [];
	
				//chainHull_2D(this.active_markers, this.active_markers.length, hullPoints);
				
				hullPoints = getConvexHullPoints(this.active_markers);
				
				//var points = this.markersToPoints(hullPoints);
				var event = jQuery.Event("getBounds");
				event.points = hullPoints;
				$("body").trigger(event);
			
				if (this.polygon != undefined) {
					this.polygon.setPath(hullPoints);
				} else {
				  this.polygon = new google.maps.Polygon({
						paths: hullPoints,
			      strokeColor: "#333333",
			      strokeOpacity: 1,
			      strokeWeight: 2,
			      fillColor: "#000000",
			      fillOpacity: 0.25,
						clickable: false
					});
		
					google.maps.event.addListener(this.polygon,"click",function(event){
						if (state == 'add') {
							addMarker(event.latLng,null,false);
						}
					});
		
				}
			
				if (!dragging) {
					this.setAlgorithmData(this.polygon.getPath().getArray(), this.cellsize*1000);
				}
			}
		
		
		
			/*============================================================================*/
			/* Transform the google maps markers to latlng points.												*/
			/*============================================================================*/
			HullOperations.prototype.markersToPoints = function(path) {
				var result = [];
				for (var i=0; i<path.length; i++) {
						result.push(path[i].getPosition());
				}
				return result;
			}
		
		
		
			/*============================================================================*/
			/* Draw the AOO polygons of each marker.																			*/
			/*============================================================================*/
			HullOperations.prototype.drawAOOPolygons = function(path) {
					for (var id in this.Cells) {
						this.Cells[id].setMap(this.map);
					}
			}
		
		
		
			/*============================================================================*/
			/* Remove the AOO polygons of each marker.																		*/
			/*============================================================================*/
			HullOperations.prototype.removeAOOPolygons = function(path) {
				for (var id in this.Cells) {
					this.Cells[id].setMap(null);
				}
				this.Cells = new Array();
			}
		



			/*============================================================================*/
			/* Get the convex hull polygon area and show the figures. 										*/
			/*============================================================================*/
			HullOperations.prototype.setAlgorithmData = function(path, cellsize) {
				var obj = getAnalysisData(calculateArea(path), path, this.active_markers, cellsize);
				this.Cells = obj.Cells;
				this.EOO = obj.EOOArea.toFixed(2);
				this.AOO = obj.AOORat;
				this.AOOkind = obj.AOOArea.toFixed(2);
				this.EOOkind = obj.EOORat;
				
				
				if ($('#auto_value').hasClass('selected')) {
					$('div.analysis p.change').html('Auto value ('+obj.cellsize.toFixed(2)+'KM), <a class="change">change</a>');
				}
				
				this.drawAOOPolygons();
				$('div.analysis_data ul li:eq(0)').removeClass();
				$('div.analysis_data ul li:eq(1)').removeClass();
				$('div.analysis_data ul li:eq(0)').addClass(obj.EOORat);
				$('div.analysis_data ul li:eq(0) p:eq(0)').html(obj.EOOArea.toFixed(2)+' km<sup>2</sup>');
				$('div.analysis_data ul li:eq(1)').addClass(obj.AOORat);
				$('div.analysis_data ul li:eq(1) p:eq(0)').html(obj.AOOArea.toFixed(2)+' km<sup>2</sup>');
			}
		
		
		
			/*============================================================================*/
			/* Set values of the algorithm data.																					*/
			/*============================================================================*/
			HullOperations.prototype.setAlgorithmValues = function(value) {
				$('div.cellsize span p').text(value+'KM');
				$('div.analysis p.change').html('Cell size '+value+'km, <a class="change">change</a>');
				if (this.polygon!=undefined && this.polygon.getPath().getLength()>2) {
					this.setAlgorithmData(this.polygon.getPath().getArray(),this.cellsize*1000);
				}
			}
		
		
		
			/*============================================================================*/
			/* Reset values of the algorithms. 																						*/
			/*============================================================================*/
			HullOperations.prototype.resetAlgorithmValues = function() {
				$('div.analysis_data ul li:eq(0)').removeClass();
				$('div.analysis_data ul li:eq(0) p:eq(0)').html('0 km<sup>2</sup>');
				$('div.analysis_data ul li:eq(1)').removeClass();
				$('div.analysis_data ul li:eq(1) p:eq(0)').html('0 km<sup>2</sup>');
			}



			/*============================================================================*/
			/* Return if the convex hull is visible or not. 															*/
			/*============================================================================*/
			HullOperations.prototype.isVisible = function() {
				return this.visible;
			}



			/*============================================================================*/
			/* Open Convex Hull window and show the convex hull polygon.	 								*/
			/*============================================================================*/
			function openConvexHull() {
				convex_hull.createPolygon(_markers);
			}
		
		
			/*============================================================================*/
			/* Close Convex Hull window and hide the convex hull polygon.	 								*/
			/*============================================================================*/	
			function closeConvexHull() {
				convex_hull.removePolygon();
			}