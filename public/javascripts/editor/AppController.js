
var specie;  										/*** specie name ***/

var state = 'select';						// State of the map & application


var flickr_founded;							// Flickr data founded
var gbif_founded;								// Gbif data founded

var total_points;								// Total points for each kind of data (will be TotalPointsOperations)
var convex_hull;								// Convex Hull model Object for calculating the polygon
var actions;										// UnredoOperations model Object for actions made by the user.
var merge_object; 							// MergeOperations model Object for recover points from server like GBIF or Flickr 


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

			
					
			createMap();
			startSources();

			

			//if the application comes through an upload file
			if (upload_information!=undefined) {
				$('#wellcome').hide();
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
		
		
		

		
		
		