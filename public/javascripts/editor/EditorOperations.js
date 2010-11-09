
var specie;  										/*** specie name ***/

var state = 'select';						// State of the map & application

var map; 												// Map
var bounds;											// Map bounds

var flickr_founded;							// Flickr data founded
var gbif_founded;								// Gbif data founded

var total_points;								// Total points for each kind of data (will be TotalPointsOperations)
var convex_hull;								// Convex Hull model Object for calculating the polygon
var actions;										// UnredoOperations model Object for actions made by the user.
var merge_object; 							// MergeOperations model Object for recover points from server like GBIF or Flickr 


var click_infowindow;						// Gray main infowindow object  
var over_tooltip;								// Tiny over infowindow object
var over_polygon_tooltip;				// Tiny over polygon object
var delete_infowindow;					// Delete infowindow object
var polyline_; 									// Polyline create by the user
var selection_polygon; 					// Selection polygon tool
var drawing = false;						// Flag to know if user is drawing selection rectangle


var over_marker = false;				// True if cursor is over marker, false opposite
var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
var over_polygon = false				// True if cursor is over selection polygon, false opposite
var is_dragging = false;				// True if user is dragging a marker, false opposite


var _markers = [];							// All the markers of the map (Associative array)
var global_id = 0; 							// Global id for your own markers
var global_zIndex = 1;					// Z-index for the markers





		/*========================================================================================================================*/
		/* When the document is loaded. */
		/*========================================================================================================================*/
		$(document).ready(function() {
			
			
			//If you want to close the window without save
			window.onbeforeunload = function() {
			    // return "Save before go";
			}

			$('body').css('background','url(/images/editor/bkg.jpg) 0 0');
			
			//Get scientific_name
			specie = $('a#scientific_name').text();
			
			//Get scientific_id (for searches in GBIF)
			gbif_id = $('a#gbif_id').text();
			
					
			//initialize map
		  var myLatlng = new google.maps.LatLng(30,0);
		  var myOptions = {
		    zoom: 2,
		    center: myLatlng,
		    mapTypeId: google.maps.MapTypeId.TERRAIN,
				disableDefaultUI: true,
				scrollwheel: false,
				streetViewControl: false
		  }
	
		  map = new google.maps.Map(document.getElementById("map"), myOptions);
			bounds = new google.maps.LatLngBounds();
			
			total_points = new TotalPointsOperations();  		// TotalPoints Object
			convex_hull = new HullOperations(map);					// Convex Hull Object
			actions = new UnredoOperations();								// Un-Re-Do Object


			selection_polygon = new google.maps.Polygon({
	      strokeColor: "#000000",
	      strokeOpacity: 1,
	      strokeWeight: 1,
	      fillColor: "#FFFFFF",
	      fillOpacity: 0
	    });



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
		

			

			//if the application comes through an upload file
			if (upload_information!=undefined) {
				$('#wellcome').hide();
				 uploadRLA(upload_information);
			}

		});
	
	
	
	
	
		/*========================================================================================================================*/
		/*========================================================================================================================*/
																								/* GENERAL APP STUFF.	 */
		/*========================================================================================================================*/
		/*========================================================================================================================*/
	
	
	
		/*========================================================================================================================*/
		/* Set status of the application. */
		/*========================================================================================================================*/
		function setStatus(status) {
			$("div.left a.select").removeClass('selected');
			$("div.left a.add").removeClass('selected');
			$("div.left a.remove").removeClass('selected');
			$("div.left a.selection").removeClass('selected');
			$("div.left a."+status).addClass('selected');
			
			//Remove selection tool addons
			google.maps.event.clearListeners(map, 'mousemove');
			removePolygon();

			state = status;
			activeMarkersProperties();
		}
	

		
		
		/*========================================================================================================================*/
		/*========================================================================================================================*/
																								/* REQUESTS STUFF.	 */
		/*========================================================================================================================*/
		/*========================================================================================================================*/
		
		
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
		/*========================================================================================================================*/
																								/* ALGORITHMS STUFF.	 */
		/*========================================================================================================================*/
		/*========================================================================================================================*/
		
		

		/*========================================================================================================================*/
		/* Open Convex Hull window and show the convex hull polygon.	 */
		/*========================================================================================================================*/
		function openConvexHull() {
			convex_hull.createPolygon(_markers);
		}
		
		
		/*========================================================================================================================*/
		/* Close Convex Hull window and hide the convex hull polygon.	 */
		/*========================================================================================================================*/	
		function closeConvexHull() {
			convex_hull.removePolygon();
		}
		
		
		
	
		
		
		/*========================================================================================================================*/
		/*========================================================================================================================*/
																								/* DOWNLOAD/UPLOAD RLA STUFF.	 */
		/*========================================================================================================================*/
		/*========================================================================================================================*/
		
		
		
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
			var sources = [];
			for (var i=0; i<app_data.length; i++) {
				if (i!=0) {
					sources.push(app_data[i].name);
					addSourceToMap(app_data[i],false,false);
				} else {
					map.setCenter(new google.maps.LatLng(app_data[0].center.latitude,app_data[0].center.longitude));
					map.setZoom(parseInt(app_data[0].zoom));				
				}
			}
			
			
			//if there is own points, get last number id for the global_id  (avoid conflicts with ids!!!)
			
			
			$('div.header h1').html(app_data[0].specie+'<sup>(saved)</sup>');
			changeAppToSave(1);		
			
			//Merge points from service
			merge_object = new MergeOperations(sources);
			setTimeout(function(){merge_object.checkSources();},1000);
				
		}
		
		

		
		
		
		/*========================================================================================================================*/
		/* APLICATION STATE FUNCTION */
		/* if something happens application changes */
		
		
		function changeApplicationTo(type) {
			switch (type) {
				case 0: //Un-do-re-do operation -> Remove selection polygon 
								removePolygon();
								break;
				case 1: //Change app to save
								break;
				case 2: //Change app to unsaved
								break;
			}
		}
		
		
		
		// --> FIXED THIS WITH THE OTHER FUNCTIONS
		
		/*========================================================================================================================*/
		/* Change application to save or unsave (0 -> Unsave , 1 -> Save). */
		/*========================================================================================================================*/
		function changeAppToSave(kind) {
			if (kind==0) {
				$('div.header h1').removeClass('saved');
				$('div.header h1 sup').text('(unsaved)');
			} else {
				$('div.header h1').addClass('saved');
				$('div.header h1 sup').text('(saved)');
			}
		}
		
		
		
		/*========================================================================================================================*/
		/* Check if you saved your changes before go out the editor. */
		/*========================================================================================================================*/
		function closeEditor() {
			if ($('div.header h1').hasClass('saved')) {
				window.location.href="/";
			} else {
				chooseWindowFirst('close');
			}
		}
		
		
		
		/*========================================================================================================================*/
		/* Check if you saved your changes before go out the editor. */
		/*========================================================================================================================*/
		function chooseWindowFirst(state) {
			switch (state) {
				case 'help': $('div#wellcome').hide(); $('ul.editor_list li:eq(1)').removeClass('selected'); $('ul.editor_list li:eq(0)').addClass('selected'); $('div.help_container').fadeIn(); $('div#close_save').hide(); break;
				case 'close': $('div#wellcome').hide(); $('ul.editor_list li:eq(0)').removeClass('selected'); $('ul.editor_list li:eq(1)').addClass('selected'); $('div.help_container').hide(); $('div#close_save').fadeIn(); break;
				default: $('div#wellcome').fadeOut(); $('div.help_container').fadeOut(); $('ul.editor_list li').removeClass('selected'); $('div#close_save').fadeOut();
			}
		}
		
		
		

		
		
		