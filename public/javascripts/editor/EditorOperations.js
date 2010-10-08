var specie;  /* specie name */

var state = 'select';						// State of the map & application

var map; 												// Map
var bounds;											// Map bounds

var flickr_founded;							// Flickr data founded
var gbif_founded;								// Gbif data founded

var total_points;								// Total points for each kind of data (will be TotalPointsOperations)
var convex_hull;								// Convex Hull model Object for calculating the polygon
var actions;										// UnredoOperations model Object for actions made by the user.

var click_infowindow;						// Gray main infowindow object  
var over_tooltip;								// Tiny over infowindow object
var delete_infowindow;					// Delete infowindow object

var over_marker = false;				// True if cursor is over marker, false opposite
var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
var is_dragging = false;				// True if user is dragging a marker, false opposite

var _markers = [];							// All the markers of the map (Associative array)
var _information = [];					// Variable needed for adding markers asynchronously


var global_id = 0; 							// Global id for your own markers
var global_zIndex = 1;					// Z-index for the markers



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
			
			total_points = new TotalPointsOperations();  		// TotalPoints Object
			convex_hull = new HullOperations(map);					// Convex Hull Object
			//actions = new UnredoOperations();								// Un-Re-Do Object


			google.maps.event.addListener(map,"click",function(event){
				if (state == 'add') {
					addMarker(event.latLng,null,false);
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
						onLoadedSource(element,result[0].points.length);
					}
			);
		
		}
	

		/*========================================================================================================================*/
	  /* Change state loading source to loaded source. */
		/*========================================================================================================================*/
	  
		function onLoadedSource(element, total) {
	    $(element).find('span p').addClass('loaded');
			if (total != 0) 
	    	$(element).find('span a').addClass('enabled');
	  }


		/*========================================================================================================================*/
		/* Show loading map stuff. */
		/*========================================================================================================================*/
		
		function showMamufasMap() {
			$('#mamufas_map').css('background','url(/images/editor/mamufas_bkg.png) repeat 0 0');
			$('#mamufas_map').fadeIn();
			$('#loader_map').fadeIn();
		}	
	
	
		/*========================================================================================================================*/
		/* Hide loading map stuff. */
		/*========================================================================================================================*/
		
		function hideMamufasMap() {
			$('#loader_map').fadeOut(function(ev){
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
		
		function addSourceToMap(information,getBound, saveAction) {
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
					
					var total = information.points.length;
					_information = information.points;
					setTimeout("asynAddMarker("+0+","+total+","+getBound+","+ saveAction+")", 0);

		}
		
		
		/*========================================================================================================================*/
		/* Recursive service for adding markers. */
		/*========================================================================================================================*/
		
		function asynAddMarker(i,total,_bounds, _saveAction) {
			if(i < total){
				(_information[i].removed)?null:total_points.add(_information[i].kind); //Add new point to total_point in each class (gbif, flickr or your points)
 				
				bounds.extend(new google.maps.LatLng(_information[i].latitude,_information[i].longitude));			
				var marker = CreateMarker(new google.maps.LatLng(_information[i].latitude,_information[i].longitude), _information[i].kind, true, true, _information[i], (_information[i].removed)?null:map);
 				_markers[marker.data.catalogue_id] = marker;
				
				if (_information[i].active && !_information[i].removed && convex_hull.isVisible()) {
					convex_hull.addPoint(marker);
				}
				
				// if (_saveAction) {
		    // 	actions.Do('add', marker.data.catalogue_id, information);
		    // }

	      i++;
	      setTimeout("asynAddMarker("+i+","+total+","+ _bounds+","+_saveAction+")", 0);
	    } else {
				addSourceToList(_information[total-1].kind);
				_information = [];
				calculateMapPoints();
				resizeBarPoints();
				hideMamufasMap();
				if (_bounds) {
	 				map.fitBounds(bounds);
				}
	    }
		}
		
		
		
		
		/*========================================================================================================================*/
		/* Add the source to the list if it doesn't exist. */
		/*========================================================================================================================*/
		
		function addSourceToList(kind) {
			switch (kind) {
				case 'gbif': 		if (!$('#GBIF_points').length) {
													$('div.sources ul#sources_list').append('<li><a href="#" class="green" id="GBIF_points"><span> GBIF Points ('+ total_points.get(kind) +')</span></a><a href="javascript:void openDeleteAll(\'green\')" class="delete_all"></a><a href="#" class="merge active"></a></li>');
												}
												break;
				case 'flickr': 	if (!$('#Flickr_points').length) {
													$('div.sources ul#sources_list').append('<li><a href="#" class="pink" id="Flickr_points"><span> Flickr Points ('+ total_points.get(kind) +')</span></a><a href="javascript:void openDeleteAll(\'pink\')" class="delete_all"></a><a href="#" class="merge active"></a></li>');
												}
												break;
				default: 				if (!$('#our_points').length) {
													$('div.sources ul#sources_list').append('<li><a href="#" class="blue" id="our_points"><span> Your Points ('+ total_points.get(kind) +')</span></a><a href="javascript:void openDeleteAll(\'blue\')" class="delete_all"></a><a href="#" class="merge active"></a></li>');
												}
			}
		}
		
		
		
		/*========================================================================================================================*/
		/* Open Delete container. */
		/*========================================================================================================================*/
		
		function openDeleteAll(kind) {
			var position = $('li a.'+kind).offset();
			$('div.delete_all').css('top',position.top - 58 + 'px');
			$('div.delete_all').css('right','60px');
			$('a.'+ kind).parent().children('a.delete_all').addClass('active');			
			$('div.delete_all').fadeIn();
			
			var type;
			
			switch (kind) {
				case 'green': 	type = 'gbif';
												$('div.delete_all h4').text('DELETE ALL GBIF POINTS');
												break;
				case 'pink': 		type = 'flickr';
												$('div.delete_all h4').text('DELETE ALL FLICKR POINTS');
												break;
				default: 				type = 'your';
												$('div.delete_all h4').text('DELETE ALL YOUR POINTS');
			}

			$('div.delete_all a.yes').attr('href','javascript: void deleteAll("' + type + '")');
		}
		
		
		
		/*========================================================================================================================*/
		/* Close Delete container. */
		/*========================================================================================================================*/
		
		function closeDeleteAll() {
			$('div.delete_all').fadeOut();
			$('a.delete_all').removeClass('active');
		}
		
		
		
		/*========================================================================================================================*/
		/* Delete all the markers. */
		/*========================================================================================================================*/
		
		function deleteAll(type) {			
			for (var i in _markers) {
				if (_markers[i].data.kind == type && _markers[i].data.removed == false) {
					total_points.deduct(type);
					_markers[i].data.removed = true;
					_markers[i].setMap(null);
				}
			}
			closeDeleteAll();
			
			resizeBarPoints();
			calculateMapPoints();
			calculateSourcePoints(_markers[i].data.kind);
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
				if ((((205*total_points.get('flickr'))/total_points.total())-217)<(-204)) {
					$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position','-204px 0');
				} else {
					$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position',((205*total_points.get('flickr'))/total_points.total()) - 217+ 'px 0');
				}				
				$('div#editor div#tools div.center div.right div.sources a.pink span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					if ((((205*total_points.get('flickr'))/total_points.total())-217)<(-204)) {
						$(this).css('background-position','-204px 0');
					} else {
						$(this).css('background-position',((205*total_points.get('flickr'))/total_points.total()) - 217+ 'px 0');
					}				
				});
			} else {
				$('div.sources ul li a.pink').parent().remove();
			}



			if (total_points.get('gbif')!=0) {
				if ((((205*total_points.get('gbif'))/total_points.total())-217)<(-204)) {
					$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position','-204px 0');
				} else {
					$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position',((205*total_points.get('gbif'))/total_points.total()) - 217+ 'px 0');
				}
				$('div#editor div#tools div.center div.right div.sources a.green span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					if ((((205*total_points.get('gbif'))/total_points.total())-217)<(-204)) {
						$(this).css('background-position','-204px 0');
					} else {
						$(this).css('background-position',((205*total_points.get('gbif'))/total_points.total()) - 217+ 'px 0');
					}				
				});
			} else {
				$('div.sources ul li a.green').parent().remove();
			}
			
			
			
			if (total_points.get('your')!=0) {
				if ((((205*total_points.get('your'))/total_points.total())-217)<(-204)) {
					$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position','-204px 0');
				} else {
					$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position',((205*total_points.get('your'))/total_points.total()) - 217+ 'px 0');
				}
				$('div#editor div#tools div.center div.right div.sources a.blue span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					if ((((205*total_points.get('your'))/total_points.total())-217)<(-204)) {
						$(this).css('background-position','-204px 0');
					} else {
						$(this).css('background-position',((205*total_points.get('your'))/total_points.total()) - 217+ 'px 0');
					}				
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
			console.log(_markers);
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
					addSourceToMap(app_data[i],false,false);
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

			//actions.Do('remove', marker_id, null);
			

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
			
			// if (!fromAction)
			// 	actions.Do('add', marker.data.catalogue_id, inf);
			
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
		
		function makeActive (marker_id, fromAction) {

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
					
					//If the action doesnt come from the UnredoOperations object
					// if (!fromAction) {
					// 	if (!_markers[marker_id].data.active) {
					// 		actions.Do('hide',marker_id,null);
					// 	} else {
					// 		actions.Do('show',marker_id,null);
					// 	}
					// }
					
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
		
		
		
		
		
		
		/*========================================================================================================================*/
		/*========================================================================================================================*/
																								/* UNDO-REDO STUFF.	 */
		/*========================================================================================================================*/
		/*========================================================================================================================*/

		
	
		function unDoAction() {
			//actions.Undo();
		}
		
		
		function reDoAction() {
			//actions.Redo();
		}
		


