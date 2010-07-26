var specie;  /* specie name */

var state = 'select';						// State of the map & application

var map; 												// Map
var bounds;											// Map bounds

var flickr_founded;							// Flickr data founded
var gbif_founded;								// Gbif data founded

var total_points;								// Total points for each kind of data (will be TotalPointsOperations)
var convex_hull;								// Convex Hull model Object for calculating the polygon

var click_infowindow;						// Gray main infowindow object  
var over_tooltip;								// Tiny over infowindow object
var delete_infowindow;					// Delete infowindow object

var over_marker = false;				// True if cursor is over marker, false opposite
var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
var is_dragging = false;				// True if user is dragging a marker, false opposite

var _markers = [];							// All the markers of the map (Associative array)
var _active_markers = [];				// Only reference to active map markers (AA as well) - Mainly for hull function

var global_id = 0; 							// Global id for your own markers




		/*========================================================================================================================*/
		/* When the document is loaded. */
		/*========================================================================================================================*/
		$(document).ready(function() {
					
			//initialize map
		  var myLatlng = new google.maps.LatLng(30,0);
		  var myOptions = {
		    zoom: 2,
		    center: myLatlng,
		    mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: false,
				scrollwheel: false
		  }
	
		  map = new google.maps.Map(document.getElementById("map"), myOptions);
			bounds = new google.maps.LatLngBounds();
			
			total_points = new TotalPointsOperations();  		// TotalPoints Model
			convex_hull = new HullOperations(map);					// Convex Hull Object
			
			
			
			google.maps.event.addListener(map,"bounds_changed",function(){
				if (click_infowindow!=null) {
					click_infowindow.hide();
				}
				if (delete_infowindow!=null) {
					delete_infowindow.hide();
				}
			});
			
			google.maps.event.addListener(map,"click",function(event){
				if (state == 'add') {
					addMarker(event.latLng);
				}
			});
			

			//if the application comes through an upload file
			if ($('#upload_data').text()!='') {
				var upload_string = $('#upload_data').text();
				var upload_information = JSON.parse(upload_string);
				//show new mamufas that it covers all the stage?
				uploadRLA(upload_information);
			}

		});
	
	
	
		/*========================================================================================================================*/
		/* Set status of the application. */
		/*========================================================================================================================*/
		function setStatus(status) {
			$("div.left a.select").removeClass('selected');
			$("div.left a.add").removeClass('selected');
			$("div.left a.remove").removeClass('selected');

			$("div.left a."+status).addClass('selected');
			state = status;
			activeMarkersProperties();
		}
	

		/*========================================================================================================================*/
		/* Close sources window. */
		/*========================================================================================================================*/
		function closeSources() {
			$("#add_source_container").fadeOut();
			$('#add_source_button').removeClass('open');
		}
	

		/*========================================================================================================================*/
		/* Open sources window. */
		/*========================================================================================================================*/
		function openSources() {
			resetSourcesProperties();
			$("#add_source_container").fadeIn();
			$('#add_source_button').addClass('open');
		}
	

		/*========================================================================================================================*/
		/* Remove selected class in -> add source window. */
		/*========================================================================================================================*/
		function removeSelectedSources() {
			$("#add_source_container ul li").each(function(i,item){
				$(this).removeClass('selected');
			});
		}
	
	
	
	
		/*========================================================================================================================*/
		/* Get data from api service thanks to the name (flickr,gbif,...etc). */
		/*========================================================================================================================*/
		function callSourceService(kind,element) {
			var url;
			switch(kind) {
				case 'add_flickr': 	url = "/search/flickr/";
													 	break;
				case 'add_gbif':  	url= "/search/gbif/";
														break;
				default: 						url ="/";
			}
		
			$.getJSON(url + specie.replace(' ','+'),
					function(result){
						switch(kind) {
							case 'add_flickr': 	flickr_founded.push(result[0]);
																 	break;
							case 'add_gbif':  	gbif_founded.push(result[0]);
																	break;
							default: 						null;
						}
						$(element).find('span p').text(result[0].points.length + ((result[0].points.length == 1) ? " point" : " points") + ' founded');
						onLoadedSource(element);
					}
			);
		
		}
	

		/*========================================================================================================================*/
	  /* Change state loading source to loaded source. */
		/*========================================================================================================================*/
	  
		function onLoadedSource(element) {
	    $(element).find('span p').addClass('loaded');
	    $(element).find('span a').addClass('enabled');
	  }


		/*========================================================================================================================*/
		/* Show loading map stuff. */
		/*========================================================================================================================*/
		
		function showMamufasMap() {
			$('#mamufas_map').fadeIn();
			$('#loader_map').fadeIn();
		}	
	
	
		/*========================================================================================================================*/
		/* Hide loading map stuff. */
		/*========================================================================================================================*/
		
		function hideMamufasMap() {
			$('#loader_map').fadeOut(function(ev){
				$('div#import_success').fadeIn(function(ev){
					$(this).delay(2000).fadeOut('fast',function(ev){
						$('#mamufas_map').fadeOut();
					});
				});		
			});
		}
	



		/*========================================================================================================================*/
		/* Reset properties of sources window every time you open it. */
		/*========================================================================================================================*/	
		
		function resetSourcesProperties() {
			flickr_founded = [];
			gbif_founded = [];
		
			$("#add_source_container ul li").each(function(i,item){
				$(this).removeClass('selected');
				$(this).removeClass('added');
				$(this).find('span p').removeClass('loaded');
				$(this).find('span a').removeClass('enabled');
				$(this).find('div').removeClass('selected');
				$(this).find('div p').text('Select a file');
				$(this).find('div form input').attr('value','');
			});
		
			if (total_points.get('flickr')>0) {
				$('#add_flickr').parent().addClass('added');
			}
		
			if (total_points.get('gbif')>0) {
				$('#add_gbif').parent().addClass('added');
			}
		}
	




		/*========================================================================================================================*/
		/* Add a new source to the application (GBIF, FLICKR OR YOUR DATA). */
		/*========================================================================================================================*/
		
		function addSourceToMap(information,getBound) {
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
			
				var image = new google.maps.MarkerImage('images/editor/' + marker_kind + '_marker.png',
					new google.maps.Size(25, 25),
					new google.maps.Point(0,0),
					new google.maps.Point(12, 12));

		    $.each(information.points, function(i,item){
					(item.removed)?null:total_points.add(information.name); //Add new point to total_point in each class (gbif, flickr or your points)
   				
					bounds.extend(new google.maps.LatLng(item.latitude,item.longitude));			
					var marker = CreateMarker(new google.maps.LatLng(item.latitude,item.longitude), information.name, true, true, item, (item.removed)?null:map);
   				_markers[marker.data.catalogue_id] = marker;
					
					if (item.active && !item.removed && convex_hull.isVisible()) {
						convex_hull.addPoint(marker);
					}
    		});

				addSourceToList(information.name);
				calculateMapPoints();
				resizeBarPoints();
				
				if (getBound) {
	 				map.fitBounds(bounds);
				}

		}
		
		
		
		
		/*========================================================================================================================*/
		/* Add the source to the list if it doesn't exist. */
		/*========================================================================================================================*/
		
		function addSourceToList(kind) {
			switch (kind) {
				case 'gbif': 		if (!$('#GBIF_points').length) {
													$('div.sources ul').append('<li><a href="#" class="green" id="GBIF_points"><span> GBIF Points ('+ total_points.get(kind) +')</span></a></li>');
												}
												break;
				case 'flickr': 	if (!$('#Flickr_points').length) {
													$('div.sources ul').append('<li><a href="#" class="pink" id="Flickr_points"><span> Flickr Points ('+ total_points.get(kind) +')</span></a></li>');
												}
												break;
				default: 				if (!$('#our_points').length) {
													$('div.sources ul').append('<li><a href="#" class="blue" id="our_points"><span> Your Points ('+ total_points.get(kind) +')</span></a></li>');
												}
			}
		}
		
		
		
		
		
		
		/*========================================================================================================================*/
		/* Calculate number of points in the map, and show in the sources container. */
		/*========================================================================================================================*/
		
		function calculateMapPoints() {
			$('div.sources span p.count_points').text( total_points.total() + ' POINTS');
		}
		
		
		
		
		/*========================================================================================================================*/
		/* Calculate number of points for each source. */
		/*========================================================================================================================*/
		
		function calculateSourcePoints(kind) {
			switch (kind) {
				case 'gbif': 		$('#GBIF_points span').text('GBIF Points ('+ total_points.get(kind) +')');
												break;
				case 'flickr': 	$('#Flickr_points span').text('Flickr Points ('+ total_points.get(kind) +')');
												break;
				default: 				$('#our_points span').text('Your Points ('+ total_points.get(kind) +')');
			}
		}
		

		
		/*========================================================================================================================*/
		/* Create different bars thanks to number of points of each sources. */
		/*========================================================================================================================*/
		
		function resizeBarPoints() {
				
			if (total_points.get('flickr')!=0) {
				$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position',((202*total_points.get('flickr'))/total_points.total()) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.pink span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*total_points.get('flickr'))/total_points.total()) - 217+ 'px 0');
				});
			} else {
				$('div.sources ul li a.pink').parent().remove();
			}

			if (total_points.get('gbif')!=0) {
				$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position',((202*total_points.get('gbif'))/total_points.total()) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.green span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*total_points.get('gbif'))/total_points.total()) - 217+ 'px 0');
				});
			} else {
				$('div.sources ul li a.green').parent().remove();
			}
			
			
			if (total_points.get('your')!=0) {
				$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position',((202*total_points.get('your'))/total_points.total()) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.blue span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*total_points.get('your'))/total_points.total()) - 217+ 'px 0');
				});
			} else {
				$('div.sources ul li a.blue').parent().remove();
			}
		}
		
		

		/*========================================================================================================================*/
		/* Download to your computer one .rla file with all the points and properties you have at the moment in the map. */
		/*========================================================================================================================*/
		
		function downloadRLA() {
			var map_inf = new Object();
			map_inf.zoom = map.getZoom();
			map_inf.center = map.getCenter();
			
			var rla = new RLA(specie,_markers,map_inf,null);
			rla.download();		
		}
		
		
		
		
		/*========================================================================================================================*/
		/* Restore the application thanks to the file you have uploaded. */
		/*========================================================================================================================*/
		
		function uploadRLA(upload_data) {
			var rla = new RLA(null,null,null,upload_data);
			var app_data = rla.upload();
			
			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					addSourceToMap(app_data[i],false);
				} else {
					map.setCenter(new google.maps.LatLng(0,0));
					map.setCenter(new google.maps.LatLng(app_data[0].center.latitude,app_data[0].center.longitude));
					map.setZoom(parseInt(app_data[0].zoom));				
				}
			}				
		}
		
		

		/*========================================================================================================================*/
		/* Remove one marker from map and the marker information in its data (gbif, flickr or own) as well. */
		/*========================================================================================================================*/
		
		function removeMarker(marker_id) {

			switch (_markers[marker_id].data.kind) {
				case 'gbif': 		total_points.deduct('gbif');
												break;
				case 'flickr': 	total_points.deduct('flickr');
												break;
				default: 				total_points.deduct('your');
			}
			
			_markers[marker_id].data.removed = true;
			_markers[marker_id].setMap(null);

			if (convex_hull.isVisible()) {
				convex_hull.deductPoint(marker_id);
			}	
			
			resizeBarPoints();
			calculateMapPoints();
			calculateSourcePoints(_markers[marker_id].data.kind);
		}
		

		
		
		
		/*========================================================================================================================*/
		/* Add new marker to the map. */
		/*========================================================================================================================*/
		
		function addMarker(latlng) {
			
			global_id++;
			
			var inf = new Object();
			inf.accuracy = 50;
			inf.active = true;
			inf.kind = 'your';
			inf.removed = false;
			inf.catalogue_id = 'your_' + global_id;
			inf.collector = 'you!';
			inf.latitude = latlng.lat();
			inf.longitude = latlng.lng();
			
			var marker = CreateMarker(latlng, 'your', false, false, inf, map);
			total_points.add(inf.kind);
			bounds.extend(latlng);
			_markers[marker.data.catalogue_id] = marker;
			_active_markers[marker.data.catalogue_id] = marker;
			
			addSourceToList('your');
			resizeBarPoints();
			calculateMapPoints();
			calculateSourcePoints('your_data');
			
			if (convex_hull.isVisible()) {
				convex_hull.addPoint(marker);
			}
		}	
		
		
		
		
		/*========================================================================================================================*/
		/* Put a marker active or not. */
		/*========================================================================================================================*/
		
		function makeActive (marker_id) {

					switch (_markers[marker_id].data.kind) {
						case 'gbif': 		var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'images/editor/gbif_marker_no_active.png':'images/editor/gbif_marker.png',
																										new google.maps.Size(25, 25),
																										new google.maps.Point(0,0),
																										new google.maps.Point(12, 12));
														_markers[marker_id].setIcon(image);				
														break;
						case 'flickr': 	var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'images/editor/flickr_marker_no_active.png':'images/editor/flickr_marker.png',
																										new google.maps.Size(25, 25),
																										new google.maps.Point(0,0),
																										new google.maps.Point(12, 12));
														_markers[marker_id].setIcon(image);
														break;
						default: 				var image = new google.maps.MarkerImage((_markers[marker_id].data.active)?'images/editor/your_marker_no_active.png':'images/editor/your_marker.png',
																										new google.maps.Size(25, 25),
																										new google.maps.Point(0,0),
																										new google.maps.Point(12, 12));
														_markers[marker_id].setIcon(image);
					}
					
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
		
		

		/*========================================================================================================================*/
		/* Open Convex Hull window and show the convex hull polygon.	 */
		/*========================================================================================================================*/
		function openConvexHull() {
			convex_hull.createPolygon(_markers);
			var position = $('#convex').offset();
			$('div.hull_container').css('top',position.top + 'px');
			$('#convex').css('margin-bottom','300px');
			$('div.hull_container').fadeIn('fast');
		}
		
		
		/*========================================================================================================================*/
		/* Close Convex Hull window and hide the convex hull polygon.	 */
		/*========================================================================================================================*/	
		function closeConvexHull() {
			convex_hull.removePolygon();
			$('#convex').css('margin-bottom','0px');
			$('div.hull_container').fadeOut('slow');
		}

		
	


