
var specie;  										/*** specie name ***/
var state = 'select';						// State of the map & application

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
			
			// Trick to hide wellcome window if user clicks off this container
			$('body').click(function(event) {
			    if (!$(event.target).closest('#wellcome').length) {
			        $('#wellcome').fadeOut();
							$('body').unbind('click');
			    };
			});
			
			
			// Trick for the background
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
	
	

		
		/* APLICATION STATE FUNCTION */
		
		function changeApplicationTo(type) {
			switch (type) {
				case 0: //Un-do-re-do operation -> Remove selection polygon 
									removePolygon();
									break;
				case 1: 	//Change app to unsaved
									$('div.header h1').removeClass('saved');
									$('div.header h1 sup').text('(unsaved)');
									break;
				case 2: 	//Change app to saved
									$('div.header h1').addClass('saved');
									$('div.header h1 sup').text('(saved)');
									break;
				case 3: 	// Change app to help state
									$('div#wellcome').hide();
									$('ul.editor_list li:eq(1)').removeClass('selected');
									$('ul.editor_list li:eq(0)').addClass('selected');
									$('div.help_container').fadeIn();
									$('div#close_save').hide();
									break;
				case 4: 	// Change app to close state
									$('div#wellcome').hide();
									$('ul.editor_list li:eq(0)').removeClass('selected');
									$('ul.editor_list li:eq(1)').addClass('selected');
									$('div.help_container').hide();
									$('div#close_save').fadeIn();
									break;
				case 5: 	// Change app to close state
									if ($('div.header h1').hasClass('saved')) {
										window.location.href="/";
									} else {
										changeApplicationTo(4);
									}
									break;
				default: 	// Default state for app
									$('div.help_container').fadeOut();
									$('div#close_save').fadeOut();
									$('div#wellcome').fadeOut();
									$('ul.editor_list li').removeClass('selected');
			}
		}
