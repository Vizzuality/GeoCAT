
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
				this.cellsize = 2;
				this.cellsize_type = "user defined";

				var me = this;

			
				/* Binding events of DOM elements related to HULLOperations  */

				// If there is a change in the map belong to markers, we have to update the convexhull
				$(document).bind('occs_updated',function(){
				  convex_hull.createPolygon(occurrences);
				});

				//toggle on/off analysis
				$('a#toggle_analysis').click(function(ev){
					if ($(this).hasClass('disabled')) {
					  $('ul#sources_list').stop().animate({top: '265px'},'fast');
					  closeSources();
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
						$(this).find('span').stop().animate({backgroundPosition:'-3px -25px', backgroundColor:'#A6DD3A'}, 100);
						$('div.analysis_data').stop().animate({height: '144px'}, 'fast',function(ev){$(this).css('overflow','auto');});
						$('#analysis_help').css('background','url(/assets/editor/analysis_help2.png) no-repeat -2px 0');
					} else {
					  // $('body').unbind('click');
					  $('ul#sources_list').stop().animate({top: '115px'},'fast');
						closeConvexHull();
						$(this).addClass('disabled');
						$(this).parent().children('h3').addClass('disabled');
						$(this).find('span').stop(true).animate({backgroundPosition:'-26px -25px', backgroundColor:'#999999'}, 100);
						$('div.analysis_data').stop().animate({height: '0'}, 'fast',function(ev){$(this).css('overflow','auto');});
						$('#analysis_help').css('background','url(/assets/editor/analysis_help.png) no-repeat 0 0');
					}
				});
			
			
				//Hull convex slider
				$("div.cellsize div.slider").slider({
					  range: "min",
  					value: 12,
  					min: 1,
  					max: 60,
  					slide: function(event, ui) {
							if (ui.value<11) {
								if (ui.value == 10) {
									me.cellsize = 1;
								} else {
									me.cellsize = (ui.value * 0.1).toFixed(1);
								}
							} else {
	  						me.cellsize = ui.value - 10;
							}
  						me.removeAOOPolygons();
  						me.setAlgorithmValues(me.cellsize);
  					}
				});
				
			
				//Choose default value 
				$('a.default').click(function(ev){
				  if (!$(this).hasClass('disabled')) {
				    $("div.cellsize div.slider").slider({value:12});
  					me.cellsize = 2;
  					me.cellsize_type = "IUCN default";
  					me.removeAOOPolygons();
  					me.setAlgorithmValues(me.cellsize);
  					$('div.analysis p.change').html('AOO based on IUCN default<br/>cell width (2 km), <a class="change">change</a>');
				  }
				});
			
				//Close Cellsize
				$("div.cellsize a.done").click(function(){
				  // $('body').unbind('click');
				  $('div.cellsize').fadeOut();
				});
			
				//Open Cellsize
				$("p.change a.change").live('click',function(ev){
				  ev.stopPropagation();
				  ev.preventDefault();
				  $('body').click(function(event) {
  				  if (!$(event.target).closest('div.cellsize').length) {
  				    $('div.cellsize').fadeOut();
  						// $('body').unbind('click');
  				  };
  				});
				  $('div.cellsize').fadeIn();
				  $(document).keydown(function (e) {
						if (e.keyCode == 27) { // ESC
							$('div.cellsize').fadeOut();
						}
					});
				});
				
				//Auto value for AOO and EOO
				$('#auto_value').click(function(){
				  if ($(this).hasClass('selected')) {
				    me.cellsize = me.beforeValue;
						$(this).removeClass('selected');
						me.cellsize_type = "user defined";
    				$('div.analysis p.change').html('AOO based on user defined<br/>cell width ('+me.beforeValue+'km), <a class="change">change</a>');
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
				    me.cellsize_type = "auto-value";
    				$('div.analysis p.change').html('AOO based on auto-value<br/>cell width (km), <a class="change">change</a>');
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
					if (all_markers[i].data.geocat_active && !all_markers[i].data.geocat_removed) {
						this.active_markers.push(all_markers[i]);
					}
				}

				if (this.active_markers.length > 0) {
					this.calculateConvexHull(false)
				} else {
					this.removeAOOPolygons();
					this.resetAlgorithmValues();
				}

				if (this.polygon && this.active_markers.length < 3) {
					this.polygon.setPath([]);
					this.polygon.setMap(null);
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
						this.createPolygon(occurrences);
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
				  if (this.polygon!=undefined) {
				    this.polygon.setPath([]);
  				  this.removeAOOPolygons();
  					this.polygon.setMap(null);
  					this.resetAlgorithmValues();
				  } 
				}
			}



			/*============================================================================*/
			/* Draw the convex hull polygon. 																							*/
			/*============================================================================*/
			HullOperations.prototype.drawHull= function(dragging) {
				var hullPoints, unwrappedHullPoints = [];
				hullPoints = getConvexHullPoints(this.markersToPoints(this.active_markers));
				
				$.each(hullPoints,function(index,element){
				  unwrappedHullPoints.push(new google.maps.LatLng(element.lat(),element.lng(),false));
				});
				
				
				var event = jQuery.Event("getBounds");
				event.points = hullPoints;
				$("body").trigger(event);
			
				if (this.polygon != undefined) {
				  this.polygon.setOptions({fillOpacity:0.25,strokeOpacity:1});
					this.polygon.setPath(unwrappedHullPoints);
				} else {
				  this.polygon = new google.maps.Polygon({
						paths: unwrappedHullPoints,
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
  			var me = this;
  			_.each(this.Cells,function(element){
  			  element.setMap(me.map);
  			});
			}
		
		
		
			/*============================================================================*/
			/* Remove the AOO polygons of each marker.																		*/
			/*============================================================================*/
			HullOperations.prototype.removeAOOPolygons = function(path) {
			  var me = this;
  			_.each(this.Cells,function(element){
  			  element.setMap(null);
  			});
				this.Cells = new Array();
			}
		



			/*============================================================================*/
			/* Get the convex hull polygon area and show the figures. 										*/
			/*============================================================================*/
			HullOperations.prototype.setAlgorithmData = function(path, cellsize) {
			  
			  var area = google.maps.geometry.spherical.computeArea(path)/1000000;
				var obj = getAnalysisData(area, path, this.active_markers, cellsize, this.cellsize_type);
				this.Cells = obj.Cells;
				this.EOO = obj.EOOArea.toFixed(5);
				this.AOO = obj.AOORat;
				this.AOOkind = obj.AOOArea.toFixed(5);
				this.EOOkind = obj.EOORat;
				
				if ($('#auto_value').hasClass('selected')) {
				  this.cellsize = (obj.cellsize/1000).toFixed(3);
				  $('div.analysis p.change').html('AOO based on auto-value<br/>cell width ('+this.cellsize+' km), <a class="change">change</a>');
				}
				
				this.drawAOOPolygons();
				$('div.analysis_data ul li:eq(0)').removeClass();
				$('div.analysis_data ul li:eq(1)').removeClass();
				$('div.analysis_data ul li:eq(0)').addClass(obj.EOORat);
				$('div.analysis_data ul li:eq(0) p:eq(0)').html(addCommas(obj.EOOArea.toFixed(2))+' km<sup>2</sup>');
				$('div.analysis_data ul li:eq(1)').addClass(obj.AOORat);
				$('div.analysis_data ul li:eq(1) p:eq(0)').html(((obj.AOOArea<1)?obj.AOOArea.toFixed(4):addCommas(obj.AOOArea.toFixed(2)))+' km<sup>2</sup>');
			}
		
		
		
			/*============================================================================*/
			/* Set values of the algorithm data.																					*/
			/*============================================================================*/
			HullOperations.prototype.setAlgorithmValues = function(value) {
				if (value>1) {
					var text_ = value;
					var metric_ = 'km';
				} else {
					var text_ = (value*1000);
					var metric_ = 'm';
				}

				$('div.cellsize span p').text(text_+metric_.toUpperCase());
				$('div.analysis p.change').html('AOO based on user defined<br/>cell width ('+text_+' '+metric_+'), <a class="change">change</a>');
				// if (this.polygon!=undefined && this.polygon.getPath().getLength()>0) {
					this.setAlgorithmData(this.polygon && this.polygon.getPath().getArray() || [],this.cellsize*1000);
				// }
			}
		
		
		
			/*============================================================================*/
			/* Reset values of the algorithms. 																						*/
			/*============================================================================*/
			HullOperations.prototype.resetAlgorithmValues = function() {
				$('div.analysis_data ul li:eq(0)').removeClass();
				$('div.analysis_data ul li:eq(0) p:eq(0)').html('0 km<sup>2</sup>');
				$('div.analysis_data ul li:eq(1)').removeClass();
				$('div.analysis_data ul li:eq(1) p:eq(0)').html('0 km<sup>2</sup>');
				
				this.EOO = 0;
				this.AOO = 0;
				this.AOOkind = '';
				this.EOOkind = '';
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
				convex_hull.createPolygon(occurrences);
			}
		
		
			/*============================================================================*/
			/* Close Convex Hull window and hide the convex hull polygon.	 								*/
			/*============================================================================*/	
			function closeConvexHull() {
				convex_hull.removePolygon();
			}
			
			
			/*============================================================================*/
			/* Unique points in array.*/
			/*============================================================================*/
			function unique(a) {
        var r = new Array();
         o:for(var i = 0, n = a.length; i < n; i++) {
          for(var x = 0, y = r.length; x < y; x++) {
            if(r[x]==a[i]) continue o;
          }
          r[r.length] = a[i];
        }
        return r;
      }
      
      
      /*============================================================================*/
			/* Less opacity meanwhile user moves a occ */
			/*============================================================================*/
			function mamufasPolygon() {
			  if (convex_hull.polygon != undefined) convex_hull.polygon.setOptions({fillOpacity:0.1,strokeOpacity:0.2});
			  _.each(convex_hull.Cells,function(element){
			    element.setMap(null);
			  });
			  this.Cells = new Array();
      }

			
			/*============================================================================*/
			/* Add commas to large numbers */
			/*============================================================================*/
			function addCommas(nStr) {
				nStr += '';
				x = nStr.split('.');
				x1 = x[0];
				x2 = x.length > 1 ? '.' + x[1] : '';
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
				}
				return x1 + x2;
			}