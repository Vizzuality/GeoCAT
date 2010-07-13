var specie;  /* specie name */

var state = 'select';						// State of the map

var map; 												// Map
var bounds;											// Map bounds
var flickr_founded;							// Flickr data founded
var gbif_founded;								// Gbif data founded

var flickr_data;								// Flickr Map data
var gbif_data;									// Gbif Map data
var your_data;									// You Map data

var click_infowindow;						// Gray main infowindow object  
var over_tooltip;								// Tiny over infowindow object


var over_marker = false;				// True if cursor is over marker, false opposite
var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
var is_dragging = false;				// True if user is dragging a marker, false opposite
var is_infowindow_open = false;	// True if main infowindow is open, false opposite

var global_id=1;								// Global id for the markers
var _markers = [];							// All the markers of the map


		/*========================================================================================================================*/
		/* When the document is loaded. */
		/*========================================================================================================================*/
		$(document).ready(function() {
		
			//Get scientific_name
			specie = $('a#scientific_name').text();
		
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
			
			
			//MAP EVENTS
			google.maps.event.addListener(map,"bounds_changed",function(){
				if (click_infowindow!=null) {
					click_infowindow.hide();
					is_infowindow_open = false;
				}
			});
			
			google.maps.event.addListener(map,"click",function(event){
				if (state == 'add') {
					addMarker(event.latLng);
				}
			});
			
		
		
			//hover effect in browse input file
			$('li span div').hover(function(ev){
				$(this).find('a.browse').css('background-position','0 -21px');
			},function(ev){
				$(this).find('a.browse').css('background-position','0 0');
			});
		
		
			//change file input value
			$('li span div form input').change(function(ev){
				$(this).parent().parent().parent().find('a.import_data').addClass('enabled');
				$(this).parent().parent().addClass('selected');
				if ($(this).val().length>15) {
					$(this).parent().parent().find('p').text($(this).val().substr(0,12)+'...');
				} else {
					$(this).parent().parent().find('p').text($(this).val());
				}
			});	
		

			//open add sources container
			$("#add_source_button").click(function(ev){
				ev.stopPropagation();
				ev.preventDefault();
				if (!$('#add_source_container').is(':visible')) {
					openSources();
				} else {
					closeSources();
				}
			});
		
			//add source effects
			$("#add_source_container ul li a.checkbox").click(function(ev){
				ev.stopPropagation();
				ev.preventDefault();
				if (!$(this).parent().hasClass('selected') && !$(this).parent().hasClass('added')) {
					removeSelectedSources();
					$(this).parent().addClass('selected');
					if (!$(this).parent().find('span p').hasClass('loaded')) {
						callSourceService($(this).attr('id'),$(this).parent());
					}
				}
			});
		
			//import data
			$("a.import_data").click(function(ev){
				ev.stopPropagation();
				ev.preventDefault();
				if ($(this).hasClass('enabled')) {
						showMamufasMap();
						$("#add_source_container").fadeOut();
						$("#add_source_button").removeClass('open');
						switch($(this).parent().parent().find('a.checkbox').attr('id')) {
							case 'add_flickr': 	flickr_data = flickr_founded[0];
																	setTimeout('addSourceToMap(flickr_data,true)',1000);
																 	break;
							case 'add_gbif':  	gbif_data = gbif_founded[0];
																	setTimeout('addSourceToMap(gbif_data,true)',1000);
																	break;
							default: 						null;
						}
						hideMamufasMap();
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
			activeMarkers();
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
						$(element).find('span p').text(result[0].points.length + 
																				 ((result[0].points.length == 1) ? " point" : " points") + ' founded');
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
		
			if (flickr_data!=null && flickr_data.points.length!=0) {
				$('#add_flickr').parent().addClass('added');
			}
		
			if (gbif_data!=null  &&  gbif_data.points.length!=0) {
				$('#add_gbif').parent().addClass('added');
			}
		}
	




		/*========================================================================================================================*/
		/* Add a new source to the application (GBIF, FLICKR OR YOUR DATA). */
		/*========================================================================================================================*/
		function addSourceToMap(information,getBound) {
				var image = new google.maps.MarkerImage(
					(information.name=='gbif')?'images/editor/Gbif_marker.png' :'images/editor/Flickr_marker.png',
					new google.maps.Size(25, 25),
					new google.maps.Point(0,0),
					new google.maps.Point(12, 12));

		    $.each(information.points, function(i,item){
   					bounds.extend(new google.maps.LatLng(item.latitude,item.longitude));
   					var object = new Object();
   					object.global_id = global_id;
   					object.item = item;
						object.item.active = true;
						object.kind = information.name;
						
						var marker = CreateMarker(new google.maps.LatLng(item.latitude,item.longitude), information.name, true, true, item, map)
   					global_id++;
   					_markers.push(marker);				
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
													$('div.sources ul').append('<li><a href="#" class="green" id="GBIF_points"><span> GBIF Points ('+gbif_data.points.length+')</span></a></li>');
												}
												break;
				case 'flickr': 	if (!$('#Flickr_points').length) {
													$('div.sources ul').append('<li><a href="#" class="pink" id="Flickr_points"><span> Flickr Points ('+ flickr_data.points.length +')</span></a></li>');
												}
												break;
				default: 				if (!$('#our_points').length) {
													$('div.sources ul').append('<li><a href="#" class="blue" id="our_points"><span> Your Points ('+ your_data.points.length +')</span></a></li>');
												}
			}
		}
		
		
		
		
		
		
		/*========================================================================================================================*/
		/* Calculate number of points in the map, and show in the sources container. */
		/*========================================================================================================================*/
		function calculateMapPoints() {
			$('div.sources span p.count_points').text(((flickr_data!=null)?flickr_data.points.length:null) +
																								((gbif_data!=null)?gbif_data.points.length:null) + 
																								((your_data!=null)?your_data.points.length:null) + ' POINTS');
		}
		
		
		
		
		/*========================================================================================================================*/
		/* Calculate number of points for each source. */
		/*========================================================================================================================*/
		function calculateSourcePoints(kind) {
			switch (kind) {
				case 'gbif': 		$('#GBIF_points span').text('GBIF Points ('+gbif_data.points.length+')');
												break;
				case 'flickr': 	$('#Flickr_points span').text('Flickr Points ('+flickr_data.points.length+')');
												break;
				default: 				$('#our_points span').text('Your Points ('+ your_data.points.length +')');
			}
		}
		

		
		/*========================================================================================================================*/
		/* Create different bars thanks to number of points of each sources. */
		/*========================================================================================================================*/
		function resizeBarPoints() {
			var total_points = ((flickr_data!=null)?flickr_data.points.length:null) + 
												 ((gbif_data!=null)?gbif_data.points.length:null) + 
												 ((your_data!=null)?your_data.points.length:null);
				
			if (flickr_data!=null && flickr_data.points.length!=0) {
				$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position',((202*flickr_data.points.length)/total_points) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.pink span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*flickr_data.points.length)/total_points) - 217+ 'px 0');
				});
			} else {
				$('div.sources ul li a.pink').parent().remove();
			}

			if (gbif_data!=null  &&  gbif_data.points.length!=0) {
				$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position',((202*gbif_data.points.length)/total_points) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.green span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*gbif_data.points.length)/total_points) - 217+ 'px 0');
				});
			} else {
				$('div.sources ul li a.green').parent().remove();
			}
			
			
			if (your_data!=null  &&  your_data.points.length!=0) {
				$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position',((202*your_data.points.length)/total_points) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.blue span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*your_data.points.length)/total_points) - 217+ 'px 0');
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
			
			var rla = new RLA(specie,flickr_data,gbif_data, null, _markers,map_inf,null);
			rla.download();		
		}
		
		
		
		
		/*========================================================================================================================*/
		/* Restore the application thanks to the file you have uploaded. */
		/*========================================================================================================================*/
		function uploadRLA(upload_data) {
			
			var rla = new RLA(null,null,null,null,null,null,upload_data);
			var app_data = rla.upload();
			
			//substitute gbif, flickr and own variables
			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					if (app_data[i].name=='gbif') {
						gbif_data = app_data[i];
					}
					if (app_data[i].name=='flickr') {
						flickr_data = app_data[i];
					}
					if (app_data[i].name=='your') {
						your_data = app_data[i];
					}
					
					addSourceToMap(app_data[i],false);
				}
			}
			map.setCenter(new google.maps.LatLng(app_data[0].center.b,app_data[0].center.c));
			map.setZoom(parseInt(app_data[0].zoom));					
		}
		
		

		/*========================================================================================================================*/
		/* Remove one marker from map and the marker information in its data (gbif, flickr or own) as well. */
		/*========================================================================================================================*/
		function removeMarker(marker) {
			for (var i=0; i<_markers.length; i++) {
				if (marker == _markers[i]) {
					_markers.splice(i,1);
					marker.setMap(null);
					switch (marker.data.kind) {
						case 'gbif': 		removeMarkerInformation(gbif_data,marker);
														break;
						case 'flickr': 	removeMarkerInformation(flickr_data,marker);
														break;
						default: 				removeMarkerInformation(your_data,marker);
					}
					break;
				}
			}		
		}
		
		
		/*========================================================================================================================*/
		/* Remove the marker information from its data source. */
		/*========================================================================================================================*/
		function removeMarkerInformation(collection,marker) {
			for (var i=0; i<collection.points.length; i++) {
				if (collection.points[i].latitude == marker.data.item.latitude && collection.points[i].longitude == marker.data.item.longitude && 
						collection.points[i].collector == marker.data.item.collector && collection.points[i].accuracy == marker.data.item.accuracy) {
					collection.points.splice(i,1);
					break;
				}
			}
			resizeBarPoints();
			calculateMapPoints();
			calculateSourcePoints(marker.data.kind);
		}		
		
		
		
		/*========================================================================================================================*/
		/* Add new marker to the map. */
		/*========================================================================================================================*/
		function addMarker(latlng) {
			
			var inf = new Object();
			inf.accuracy = 500;
			inf.active = true;
			inf.collector = 'you!';
			inf.latitude = latlng.lat();
			inf.longitude = latlng.lng();
			
			var marker = CreateMarker(latlng, 'your', false, false, inf, map);
			global_id++;
			bounds.extend(latlng);
			_markers.push(marker);
			
			
			if (your_data == null || your_data.length==0 ) {			
				var own_obj = new Object();
				own_obj.id = 'your_id';
				own_obj.name = 'your_data';
				own_obj.points = [marker.data.item];		
				your_data = own_obj;
			} else {
				your_data.points.push(marker.data.item);
			}
			
			addSourceToList('your');
			resizeBarPoints();
			calculateMapPoints();
			calculateSourcePoints('your_data');
		}	
		
		

	
		
		/*========================================================================================================================*/
		/* Put all the markers with/without drag property. */
		/*========================================================================================================================*/
		function activeMarkers() {
			for (var i=0; i<_markers.length; i++) {
				
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
	
	
	
	


