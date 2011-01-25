
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*				MapOperations => Class to create and interact with the map.																												*/
			/*  																																																												*/
			/*==========================================================================================================================*/

			
			var map;												// Map object
			var bounds;											// LatLngBounds object to visualize the map correctly
			var geocoder;                   // Geocoder application
			
			var _markers = [];							// All the markers of the map (Associative array)
			var global_id = 0; 							// Global id for your own markers
			var global_zIndex = 1;					// Z-index for the markers
			
			
			// Control vars for map objects
			var click_infowindow;						// Gray main infowindow object  
			var over_tooltip;								// Tiny over infowindow object
			var over_polygon_tooltip;				// Tiny over polygon object
			var delete_infowindow;					// Delete infowindow object
			var selection_polygon; 					// Selection polygon tool
			var drawing = false;						// Flag to know if user is drawing selection rectangle
      var edit_metadata;              // Metadata window

			var over_marker = false;				// True if cursor is over marker, false opposite
			var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
			var over_polygon = false				// True if cursor is over selection polygon, false opposite
			var is_dragging = false;				// True if user is dragging a marker, false opposite
			


			function createMap() {
				
				//initialize map
			  var myOptions = {
			    zoom: 2,
			    center: new google.maps.LatLng(30,0),
			    mapTypeId: google.maps.MapTypeId.TERRAIN,
					disableDefaultUI: true,
					scrollwheel: false,
					streetViewControl: false
			  }

			  map = new google.maps.Map(document.getElementById("map"), myOptions);
				bounds = new google.maps.LatLngBounds();
        geocoder = new google.maps.Geocoder();

				google.maps.event.clearListeners(map, 'tilesloaded');
				total_points = new TotalPointsOperations();  		// TotalPoints Object
				convex_hull = new HullOperations(map);					// Convex Hull Object
				actions = new UnredoOperations();								// Un-Re-Do Object
        edit_metadata = new GapsOverlay(new google.maps.LatLng(0,0), null, map);


				selection_polygon = new google.maps.Polygon({
		      strokeColor: "#000000",
		      strokeOpacity: 1,
		      strokeWeight: 1,
		      fillColor: "#FFFFFF",
		      fillOpacity: 0
		    });
				
				

				/*========================MAP EVENTS==========================*/
				
				//Click map event
				google.maps.event.addListener(map,"click",function(event){
					if (state == 'add') {
						addMarker(event.latLng,null,false);
					}
					if (state == "selection") {
						changeMapSelectionStatus(event.latLng);
					}
				});


				//Change cursor depending on application state
				google.maps.event.addListener(map,"mouseover",function(event){
						switch(state) {
							case 'add': 			map.setOptions({draggableCursor: "url(/images/editor/add_cursor.png),default"});	
																break;
							case 'selection': map.setOptions({draggableCursor: "url(/images/editor/selection_cursor.png),default"});	
																break;											
							case 'remove': 		map.setOptions({draggableCursor: "url(/images/editor/remove_cursor.png),default"});	
																break;						
							default: 					map.setOptions({draggableCursor: "url(/images/editor/default_cursor.png),default"});	
						}
				});


				//Zoom change = Zoom control change
				google.maps.event.addListener(map,"zoom_changed",function(event){moveZoomControl();});
				
				
				
				
				/*========================DOM EVENTS==========================*/
				//choose map type
				$('ul.map_type_list li').click(function(ev){
					$('a.select_map_type span').text($(this).text());
				});


				//change zoom level
				$('#zoom ul li').click(function(ev){
					var li_index = $(this).index();
					map.setZoom(15-li_index);
				});

				//change zoom level +
				$('a.zoom_in').click(function(ev){
					if (map.getZoom()<15) {
						map.setZoom(map.getZoom()+1);
					}
				});

				//change zoom level -
				$('a.zoom_out').click(function(ev){
					if (map.getZoom()>2) {
						map.setZoom(map.getZoom()-1);
					}
				});
				
				//focusin/out search location effect
				$('#search_location_input').focusin(function(ev){
					if ($(this).attr('value')=='Kew gardens, London') {
						$(this).attr('value','');
					}
				});
				$('#search_location_input').focusout(function(ev){
					if ($(this).attr('value')=='') {
						$(this).attr('value','Kew gardens, London');
					}
				});
				
				
				$('div.search_place').hover(function(ev){
					$(this).stop(ev).fadeTo(0,1);
				},function(ev){
					$(this).stop(ev).fadeTo(0,0.5);
				});
				
			}






			/*============================================================================*/
			/* Show loading map stuff. 																										*/
			/*============================================================================*/
			function showMamufasMap() {
				$('#mamufas_map').css('background','url(/images/editor/mamufas_bkg.png) repeat 0 0');
				$('#mamufas_map').fadeIn();
				$('#loader_map').fadeIn();
			}	


			/*============================================================================*/
			/* Hide loading map stuff with YouTube effect (false without effect). 				*/
			/*============================================================================*/
			function hideMamufasMap(effect) {
				$('#loader_map').fadeOut(function(ev){
					if (effect) {
						$('#mamufas_map').css('background','none');
						$('div#import_success').css('width','202px');
						$('div#import_success').css('height','139px');
						$('div#import_success').css('margin-top','-70px');
						$('div#import_success').css('margin-left','-101px');
						$('div#import_success').css('opacity', '0.7');
						$('div#import_success img').css('width','202px');
						$('div#import_success img').css('height','58px');
						$('div#import_success img').css('margin-top','40px');
						$('div#import_success').fadeIn(function(ev){
							$(this).delay(1000).animate({height:417, width:606, opacity:0, marginTop:-209, marginLeft:-303}, 300,function(ev){
								$('#mamufas_map').fadeOut();
							});
							$(this).children('img').delay(1000).animate({height:174, width:606, marginTop:122}, 300);
						});
					} else {
						$('#mamufas_map').fadeOut(function(){$('#mamufas_map').css('background','none');});
					}
				});
			}
				
				
				
				
			/*============================================================================*/
			/* Add a new source to the application (GBIF, FLICKR OR YOUR DATA). 					*/
			/*============================================================================*/
			function addSourceToMap(information, getBound, uploadAction) {

				// Recursive service for adding markers. */
				function asynAddMarker(i,total,_bounds, uploadAction, observations) {
					if(i < total){
					  var info_data = new Object();
					  $.extend(info_data, observations[i]);
						(info_data.removed)?null:total_points.add(info_data.kind);
						bounds.extend(new google.maps.LatLng(parseFloat(info_data.latitude),parseFloat(info_data.longitude)));		
						var marker = CreateMarker(new google.maps.LatLng(parseFloat(info_data.latitude),parseFloat(info_data.longitude)), info_data.kind, true, true, info_data, (info_data.removed)?null:map);
		 				_markers[marker.data.catalogue_id] = marker;
		 				
		 				if (!info_data.active) {
		 				  var marker_id = marker.data.catalogue_id;
  						switch (_markers[marker_id].data.kind) {
  							case 'gbif': 		var image = new google.maps.MarkerImage('/images/editor/gbif_marker_no_active.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
  															_markers[marker_id].setIcon(image);
  															break;
  							case 'flickr': 	var image = new google.maps.MarkerImage('/images/editor/flickr_marker_no_active.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
  															_markers[marker_id].setIcon(image);
  															break;
  							default: 				var image = new google.maps.MarkerImage('/images/editor/your_marker_no_active.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
  															_markers[marker_id].setIcon(image);
  						}
  						_markers[marker_id].set('opacity',0.1);		
		 				}
		 				
		 				
						if (info_data.active && !info_data.removed && convex_hull.isVisible()) {
							convex_hull.addPoint(marker);
						}
			      i++;
						setTimeout(function(){asynAddMarker(i,total,_bounds,uploadAction,observations);},0);
			    } else {
						if (uploadAction) {
							$('body').trigger('hideMamufas');
						} else {
							hideMamufasMap(true);
						}
						if (_bounds) {
			 				map.fitBounds(bounds);
						}
			    }
				}
				
				if (information.points.length>20) {
					showMamufasMap();
				}

				var marker_kind;
				switch (information.name) {
					case 'gbif': 		marker_kind = 'Gbif';
													Gbif_exist = true;
													break;
					case 'flickr': 	marker_kind = 'Flickr';
													Flickr_exist = true;
													break;
					default: 				marker_kind = 'Your';

				}
				var image = new google.maps.MarkerImage('/images/editor/' + marker_kind + '_marker.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
				actions.Do('add', null,information.points);
				setTimeout(function(){asynAddMarker(0,information.points.length,getBound,uploadAction,information.points);},0);
			}



			/*============================================================================*/
			/* Place correctly zoom control with map zoom. 																*/
			/*============================================================================*/
			function moveZoomControl() {
				$('#zoom ul li').removeClass('selected');
				var actual_zoom = map.getZoom();
				if (actual_zoom<3) {
					$('#zoom ul li:eq(13)').addClass('selected');
				} else if (actual_zoom>14) {
					$('#zoom ul li:eq(0)').addClass('selected');
				} else {
					$('#zoom ul li:eq('+(15-actual_zoom)+')').addClass('selected');
				}
			}
				



			/*============================================================================*/
			/* Change map to selection status. 																						*/
			/*============================================================================*/
			function changeMapSelectionStatus(latlng) {			
				if (selection_polygon.getPath().getLength()==0 || !drawing) {
					if (over_polygon_tooltip!=undefined) {
						over_polygon_tooltip.hide();
					}
					selection_polygon.setOptions({fillOpacity: 0});
					drawing = true;
					selection_polygon.setPath([latlng,latlng,latlng,latlng]);
					selection_polygon.setMap(map);
					google.maps.event.clearListeners(selection_polygon, 'mouseover');
					google.maps.event.clearListeners(selection_polygon, 'mouseout');
					google.maps.event.addListener(map,"mousemove",function(event){
						if (state == "selection") {
							if (selection_polygon.getPath().getLength()!=0) {
								selection_polygon.setPath([
									selection_polygon.getPath().getAt(0),
									new google.maps.LatLng(selection_polygon.getPath().getAt(0).lat(),event.latLng.lng()),
									event.latLng,
									new google.maps.LatLng(event.latLng.lat(),selection_polygon.getPath().getAt(0).lng()),
									selection_polygon.getPath().getAt(0)]);
							}
						}
					});
					google.maps.event.addListener(selection_polygon,'click',function(evt){
						drawing = false;
						selection_polygon.setOptions({fillOpacity: 0.40});
					  google.maps.event.clearListeners(map, 'mousemove');
						google.maps.event.clearListeners(selection_polygon, 'click');

						if (over_polygon_tooltip!=null) {
							over_polygon_tooltip.changeData(markersInPolygon(),selection_polygon.getPath().getAt(1));
						} else {
							over_polygon_tooltip = new PolygonOverTooltip(selection_polygon.getPath().getAt(1), markersInPolygon(), map);
						}

						google.maps.event.addListener(selection_polygon,'mouseover',function(evt){
							if (over_polygon_tooltip!=null) {
								over_polygon_tooltip.show();
							}
							over_polygon = true;
						});

						google.maps.event.addListener(selection_polygon,'mouseout',function(evt){
							if (over_polygon_tooltip!=null) {
								over_polygon_tooltip.hide();
							}
							over_polygon = false;
						});
					});
				} else {
					if (drawing) {
						drawing = false;
						selection_polygon.setOptions({fillOpacity: 0.40});
					  google.maps.event.clearListeners(map, 'mousemove');
						google.maps.event.clearListeners(selection_polygon, 'click');

						if (over_polygon_tooltip!=null) {
							over_polygon_tooltip.changeData(markersInPolygon(),selection_polygon.getPath().getAt(1));
						} else {
							over_polygon_tooltip = new PolygonOverTooltip(selection_polygon.getPath().getAt(1), markersInPolygon(), map);
						}
					}
				}
			}



			/*============================================================================*/
			/* Remove selection polygon from map. 																				*/
			/*============================================================================*/
			function removeSelectionPolygon() {			
				selection_polygon.setPath([]);
				selection_polygon.setMap(null);
			}



			/*============================================================================*/
			/* Return markers what contains the selection polygon. 												*/
			/*============================================================================*/
			function markersInPolygon() {	
				
				//Check if the polygon contains this point
				function Contains(polygon, point) { 
				  var j=0; 
				  var oddNodes = false; 
				  var x = point.lng(); 
				  var y = point.lat(); 
				  for (var i=0; i < polygon.getPath().getLength(); i++) { 
				    j++; 
				    if (j == polygon.getPath().getLength()) {j = 0;} 
				    if (((polygon.getPath().getAt(i).lat() < y) && (polygon.getPath().getAt(j).lat() >= y)) || ((polygon.getPath().getAt(j).lat() < y) && (polygon.getPath().getAt(i).lat() >= y))) { 
				      if ( polygon.getPath().getAt(i).lng() + (y - polygon.getPath().getAt(i).lat()) /  (polygon.getPath().getAt(j).lat()-polygon.getPath().getAt(i).lat()) *  (polygon.getPath().getAt(j).lng() - polygon.getPath().getAt(i).lng())<x ) { 
				        oddNodes = !oddNodes; 
				      } 
				    } 
				  } 
				  return oddNodes; 
				};
						
				var markers_polygon = [];
				for (var i in _markers) {
					if (!_markers[i].data.removed && Contains(selection_polygon,_markers[i].getPosition())) {
						markers_polygon.push(_markers[i].data);
					}
				}
				return markers_polygon;
			}



			/*============================================================================*/
			/* Delete all the markers. 																										*/
			/*============================================================================*/
			function deleteAll(type) {
        closeMapWindows();
				var remove_markers = [];
				closeDeleteAll();
				
				var markersCopy = $.extend(true,{},_markers);
				showMamufasMap();
			  
			  function asynRemoveMarker(type) {
          for (var i in markersCopy) { 
           if (markersCopy[i].data.kind == type && markersCopy[i].data.removed == false) {           
             total_points.deduct(type);
             remove_markers.push(_markers[i].data);
             _markers[i].data.removed = true;
             _markers[i].setMap(null);
             convex_hull.deductPoint(_markers[i].data.catalogue_id);
           }
           delete markersCopy[i];
           break;
          }
          
          if (i==undefined) {
            actions.Do('remove', null, remove_markers);
            hideMamufasMap(false);
            delete markersCopy;
          } else {
            asynRemoveMarker(type);
          }
				}
				asynRemoveMarker(type);
			}



			/*============================================================================*/
			/* Remove markers from map and the marker information. 												*/
			/*============================================================================*/
			function removeMarkers(remove_markers) {
				closeMapWindows();
				function asynRemoveMarker(i,total, observations) {
					if(i < total){
						var marker_id = observations[i].catalogue_id;
						total_points.deduct(_markers[marker_id].data.kind);
						_markers[marker_id].data.removed = true;
						_markers[marker_id].setMap(null);

						convex_hull.deductPoint(marker_id);
			      i++;
						setTimeout(function(){asynRemoveMarker(i,total,observations);},0);
			    } else {
						hideMamufasMap(false);
			    }
				}

				
				if (remove_markers.length>0) {
					if (remove_markers.length>20) {
						showMamufasMap();
					}
					setTimeout(function(){asynRemoveMarker(0,remove_markers.length,remove_markers);},0);
					actions.Do('remove', null, remove_markers);
				}
			}
				



			/*============================================================================*/
			/* Add new marker to the map. */
			/*============================================================================*/
			function addMarker(latlng, item_data , fromAction) {

					global_id++;
					global_zIndex++;
					var date = new Date();
					
					if (item_data == null) {
						var inf = new Object();
						inf.coordinateUncertaintyInMeters = 15000;
						inf.active = true;
						inf.kind = 'your';
						inf.removed = false;
						inf.collector = "";
						inf.eventDate = date.getFullYear()+'-'+(date.getMonth()+1)+"-"+date.getDate();
						inf.occurrenceRemarks = ""
						inf.catalogue_id = 'your_' + global_id;
						inf.latitude = latlng.lat();
						inf.longitude = latlng.lng();
						var marker = CreateMarker(latlng, 'your', false, false, inf, map);
					} else {
						var marker = CreateMarker(latlng, 'your', false, false, item_data, map);
					}
					
					marker.setZIndex(global_zIndex);

					total_points.add(inf.kind);
					bounds.extend(latlng);
					_markers[marker.data.catalogue_id] = marker;

					actions.Do('add', null, [marker.data]);


					if (convex_hull.isVisible()) {
						convex_hull.addPoint(marker);
					}
			}	



			/*============================================================================*/
			/* Put all (or only one) markers active or not. */
			/*============================================================================*/
			function makeActive (markers_id, fromAction) {
				if (markers_id.length>0) {
					for (var i=0; i<markers_id.length; i++) {
						var marker_id = markers_id[i].catalogue_id;
						switch (_markers[marker_id].data.kind) {
							case 'gbif': 		var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'/images/editor/gbif_marker_no_active.png':'/images/editor/gbif_marker.png',
																											new google.maps.Size(25, 25),
																											new google.maps.Point(0,0),
																											new google.maps.Point(12, 12));
															_markers[marker_id].setIcon(image);
															break;
							case 'flickr': 	var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'/images/editor/flickr_marker_no_active.png':'/images/editor/flickr_marker.png',
																											new google.maps.Size(25, 25),
																											new google.maps.Point(0,0),
																											new google.maps.Point(12, 12));
															_markers[marker_id].setIcon(image);
															break;
							default: 				var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'/images/editor/your_marker_no_active.png':'/images/editor/your_marker.png',
																											new google.maps.Size(25, 25),
																											new google.maps.Point(0,0),
																											new google.maps.Point(12, 12));
															_markers[marker_id].setIcon(image);
						}
						_markers[marker_id].set('opacity',(!_markers[marker_id].data.active)? 0.3 : 0.1);		
						_markers[marker_id].data.active = !_markers[marker_id].data.active;


						// Add or deduct the marker from _active_markers
						if (convex_hull.isVisible()) {
							if (!_markers[marker_id].data.active) {
								convex_hull.deductPoint(marker_id);
							} else {
								convex_hull.addPoint(_markers[marker_id]);
							}
						}
					}

					//If the action doesnt come from the UnredoOperations object
					if (!fromAction) {
						actions.Do('active', null, markers_id);
					}
				}

			}



			/*============================================================================*/
			/* Put all the markers with/without drag property.	 													*/
			/*============================================================================*/		
			function activeMarkersProperties() {
				for (var i in _markers) {
					if (state=='add') {
						_markers[i].setClickable(false);
						_markers[i].setCursor('hand');
					} else {
						_markers[i].setClickable(true);
						_markers[i].setCursor('pointer');
					}

					if (state=='select') {
						_markers[i].setDraggable(true);
					} else {
						_markers[i].setDraggable(false);
					}
				}		
			}
			
			
			
			/*============================================================================*/
			/* Set status of the application. 																						*/
			/*============================================================================*/
			function setStatus(status) {
				$("div.left a.select").removeClass('selected');
				$("div.left a.add").removeClass('selected');
				$("div.left a.remove").removeClass('selected');
				$("div.left a.selection").removeClass('selected');
				$("div.left a."+status).addClass('selected');

				//Remove selection tool addons
				google.maps.event.clearListeners(map, 'mousemove');
				removeSelectionPolygon();

				state = status;
				activeMarkersProperties();
			}
			
			
			
			/*============================================================================*/
			/* Search box.                     																						*/
			/*============================================================================*/
			function searchPlace() {
			  var address = $("#search_location_input").attr('value');
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.fitBounds(results[0].geometry.bounds);
          } else {
            $("span.search_not_found").stop().fadeIn().delay(2000).fadeOut();
          }
        });
			}
			
			
			
			/*============================================================================*/
			/* Close all floating map windows.                     												*/
			/*============================================================================*/
			function closeMapWindows() {
			  if (click_infowindow!=undefined) click_infowindow.hide();
  			if (delete_infowindow!=undefined) delete_infowindow.hide();
        if (edit_metadata!=undefined) edit_metadata.hide();
			}
			
			