
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



				/*========================================================================================================================*/
				/* Show loading map stuff. */
				/*========================================================================================================================*/
				function showMamufasMap() {
					$('#mamufas_map').css('background','url(/images/editor/mamufas_bkg.png) repeat 0 0');
					$('#mamufas_map').fadeIn();
					$('#loader_map').fadeIn();
				}	


				/*========================================================================================================================*/
				/* Hide loading map stuff with YouTube effect (false if you dont want the effect). */
				/*========================================================================================================================*/
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
				
				
				
				
					/*========================================================================================================================*/
					/* Add a new source to the application (GBIF, FLICKR OR YOUR DATA). */
					/*========================================================================================================================*/
					function addSourceToMap(information, getBound, saveAction) {

							showMamufasMap();
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

							var image = new google.maps.MarkerImage('/images/editor/' + marker_kind + '_marker.png',
							new google.maps.Size(25, 25),
							new google.maps.Point(0,0),
							new google.maps.Point(12, 12));

							actions.Do('add', null, information.points);
							setTimeout(function(){asynAddMarker(0,information.points.length,getBound,saveAction,information.points);},0);
					}


					/*=======================================*/
					/* Recursive service for adding markers. */
					/*=======================================*/
					function asynAddMarker(i,total,_bounds, _saveAction, observations) {
						if(i < total){

							(observations[i].removed)?null:total_points.add(observations[i].kind); //Add new point to total_point in each class (gbif, flickr or your points)

							if (total==1) {
								console.log(total_points.get('gbif'));
							}

							bounds.extend(new google.maps.LatLng(observations[i].latitude,observations[i].longitude));			
							var marker = CreateMarker(new google.maps.LatLng(observations[i].latitude,observations[i].longitude), observations[i].kind, true, true, observations[i], (observations[i].removed)?null:map);
			 				_markers[marker.data.catalogue_id] = marker;

							if (observations[i].active && !observations[i].removed && convex_hull.isVisible()) {
								convex_hull.addPoint(marker);
							}

				      i++;
							setTimeout(function(){asynAddMarker(i,total,_bounds,_saveAction,observations);},0);
				    } else {
							hideMamufasMap(true);
							if (_bounds) {
				 				map.fitBounds(bounds);
							}
				    }
					}
					
					
					
					
					
					
					
					/*========================================================================================================================*/
					/* Place correctly zoom control with map zoom. */
					/*========================================================================================================================*/
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
					
					
					
					
					/*========================================================================================================================*/
					/*========================================================================================================================*/
																											/* MARKERS STUFF.	 */
					/*========================================================================================================================*/
					/*========================================================================================================================*/


					/*========================================================================================================================*/
					/* Change map to selection status. */
					/*========================================================================================================================*/
					function changeMapSelectionStatus(latlng) {			
						if (selection_polygon.getPath().b.length==0 || !drawing) {
							selection_polygon.setOptions({fillOpacity: 0});
							drawing = true;
							selection_polygon.setPath([latlng,latlng,latlng,latlng]);
							selection_polygon.setMap(map);
							google.maps.event.clearListeners(selection_polygon, 'mouseover');
							google.maps.event.clearListeners(selection_polygon, 'mouseout');
							google.maps.event.addListener(map,"mousemove",function(event){
								if (state == "selection") {
									if (selection_polygon.getPath().b.length!=0) {
										selection_polygon.setPath([
											selection_polygon.getPath().b[0],
											new google.maps.LatLng(selection_polygon.getPath().b[0].lat(),event.latLng.lng()),
											event.latLng,
											new google.maps.LatLng(event.latLng.lat(),selection_polygon.getPath().b[0].lng()),
											selection_polygon.getPath().b[0]]);
									}
								}
							});
							google.maps.event.addListener(selection_polygon,'click',function(evt){
								drawing = false;
								selection_polygon.setOptions({fillOpacity: 0.40});
							  google.maps.event.clearListeners(map, 'mousemove');
								google.maps.event.clearListeners(selection_polygon, 'click');

								if (over_polygon_tooltip!=null) {
									over_polygon_tooltip.changeData(markersInPolygon(),selection_polygon.getPath().b[1]);
								} else {
									over_polygon_tooltip = new PolygonOverTooltip(selection_polygon.getPath().b[1], markersInPolygon(), map);
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
								over_polygon_tooltip = new PolygonOverTooltip(selection_polygon.getPath().b[1], markersInPolygon(), map);

								if (over_polygon_tooltip!=null) {
									over_polygon_tooltip.changeData(markersInPolygon(),selection_polygon.getPath().b[1]);
								} else {
									over_polygon_tooltip = new PolygonOverTooltip(selection_polygon.getPath().b[1], markersInPolygon(), map);
								}
							}
						}
					}









					/*========================================================================================================================*/
					/* Remove polygon from map. */
					/*========================================================================================================================*/
					function removePolygon() {			
						selection_polygon.setPath([]);
						selection_polygon.setMap(null);
					}



					/*========================================================================================================================*/
					/* Return markers what contains the selection polygon. */
					/*========================================================================================================================*/
					function markersInPolygon() {			
						var markers_polygon = [];
						for (var i in _markers) {
							if (!_markers[i].data.removed && Contains(selection_polygon,_markers[i].getPosition())) {
								markers_polygon.push(_markers[i].data);
							}
						}
						return markers_polygon;
					}


					/*========================================================================================================================*/
					/* Return true if a marker is into the polygon else false. */
					/*========================================================================================================================*/
					var Contains = function(polygon, point) { 
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





					/*========================================================================================================================*/
					/* Delete all the markers. */
					/*========================================================================================================================*/
					function deleteAll(type) {
						var remove_markers = [];		
						for (var i in _markers) {
							if (_markers[i].data.kind == type && _markers[i].data.removed == false) {
								total_points.deduct(type);
								remove_markers.push(_markers[i].data);
								_markers[i].data.removed = true;
								_markers[i].setMap(null);
							}
						}
						closeDeleteAll();
						actions.Do('remove', null, remove_markers);
					}



					/*========================================================================================================================*/
					/* Remove one or several markers from map and the marker information of its data (gbif, flickr or own) as well. */
					/*========================================================================================================================*/
					function removeMarkers(remove_markers) {
						if (remove_markers.length>0) {
							for (var i=0; i<remove_markers.length; i++) {
								var marker_id = remove_markers[i].catalogue_id;
								total_points.deduct(_markers[marker_id].data.kind);
								_markers[marker_id].data.removed = true;
								_markers[marker_id].setMap(null);

								if (convex_hull.isVisible()) {
									convex_hull.deductPoint(marker_id);
								}	

							}
							actions.Do('remove', null, remove_markers);
						}
					}



					/*========================================================================================================================*/
					/* Add new marker to the map. */
					/*========================================================================================================================*/
					function addMarker(latlng, item_data , fromAction) {

							global_id++;
							if (item_data == null) {
								var inf = new Object();
								inf.accuracy = 50;
								inf.active = true;
								inf.kind = 'your';
								inf.description = "Your description!";
								inf.removed = false;
								inf.catalogue_id = 'your_' + global_id;
								inf.collector = 'you!';
								inf.latitude = latlng.lat();
								inf.longitude = latlng.lng();
								var marker = CreateMarker(latlng, 'your', false, false, inf, map);
							} else {
								var marker = CreateMarker(latlng, 'your', false, false, item_data, map);
							}

							total_points.add(inf.kind);
							bounds.extend(latlng);
							_markers[marker.data.catalogue_id] = marker;

							actions.Do('add', null, [marker.data]);


							if (convex_hull.isVisible()) {
								convex_hull.addPoint(marker);
							}
					}	








					/*========================================================================================================================*/
					/* Put several (or only one) markers active or not. */
					/*========================================================================================================================*/
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





					/*========================================================================================================================*/
					/* Put all the markers with/without drag property.	 */
					/*========================================================================================================================*/		
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
					
					
				