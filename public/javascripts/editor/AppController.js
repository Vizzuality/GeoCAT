
		var specie;  										/*** specie name ***/
		var state = 'select';						// State of the map & application

		var total_points;								// Total points for each kind of data (will be TotalPointsOperations)
		var convex_hull;								// Convex Hull model Object for calculating the polygon
		var actions;										// UnredoOperations model Object for actions made by the user.
		var merge_object; 							// MergeOperations model Object for recover points from server like GBIF or Flickr



		/*============================================================================*/
		/* DOM loaded.									 																							*/
		/*============================================================================*/
		$(document).ready(function() {

			// Trick for the background
			$('body').css('background','url(/images/editor/bkg.jpg) 0 0');
			
			//Get scientific_name
			specie = $('a#scientific_name').text();

			createMap();
			startSources();


			//if the application comes through an upload file
			if (upload_information.success) {
				uploadRLA(upload_information);
			} else if (specie=='') {
				
				$('#start_one input').focusout(function(ev){
					if ($(this).attr('value')=='') {
						$(this).attr('value','Insert your value specie name here');
					}
				});
				$('#start_one input').focusin(function(ev){
					if ($(this).attr('value')=='Insert your value specie name here') {
						$(this).attr('value','');
					}
				});
				
				//if the application doesn't have a specie selected
				$('#start_one_mamufas').show();
				$('#start_one_mamufas').click(function(event) {
			    if (!$(event.target).closest('#start_one').length) {
		        $('#start_one').css('background-position','0 -223px');
			      $('#start_one input').focus();
			    };
				});
			} else {
				$('#wellcome').show();
				// Trick to hide wellcome window if user clicks off this container
				$('body').click(function(event) {
			    if (!$(event.target).closest('#wellcome').length) {
			        $('#wellcome').fadeOut();
							$('body').unbind('click');
			    };
				});
			}
		});
	
	

		
		/* ===== APLICATION STATE FUNCTION ===== */
		
		function changeApplicationTo(type) {
			switch (type) {
				case 0: //Un-do-re-do operation -> Remove selection polygon 
									removeSelectionPolygon();
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
									$('div#csv_error').fadeOut();
    		          $('div#export_window').fadeOut();
									$(document).keydown(function (e) {
										if (e.keyCode == 27) { // ESC
											changeApplicationTo();
										}
									});
									break;
				case 4: 	// Change app to close state
									$('div#wellcome').hide();
									$('ul.editor_list li:eq(0)').removeClass('selected');
									$('ul.editor_list li:eq(1)').addClass('selected');
									$('div.help_container').hide();
									$('div#close_save').fadeIn();
    		          $('div#export_window').fadeOut();
									$(document).keydown(function (e) {
										if (e.keyCode == 27) { // ESC
											changeApplicationTo();
										}
									});
									$('div#csv_error').fadeOut();
									break;
				case 5: 	// Change app to close state
				          $('div#csv_error').fadeOut();
									if ($('div.header h1').hasClass('saved')) {
										window.location.href="/";
									} else {
										changeApplicationTo(4);
									}
									break;
    		case 6: 	// Change app to csv import
    							$('div.help_container').fadeOut();
									$('div#close_save').fadeOut();
									$('div#wellcome').fadeOut();
									$('ul.editor_list li').removeClass('selected');
    		          $('div#csv_error').fadeIn();
    		          $('div#export_window').fadeOut();
    							break;  							
    		case 7: 	// Change app to export window
    							$('div.help_container').fadeOut();
									$('div#close_save').fadeOut();
									$('div#wellcome').fadeOut();
									$('ul.editor_list li').removeClass('selected');
    		          $('div#csv_error').fadeOut();
    		          $('div#export_window').fadeIn();
    							break;					
									
				default: 	// Default state for app
									$(document).unbind('keydown');
									$('div.help_container').fadeOut();
									$('div#close_save').fadeOut();
									$('div#wellcome').fadeOut();
									$('ul.editor_list li').removeClass('selected');
									$('div#csv_error').fadeOut();
    		          $('div#export_window').fadeOut();
									$('div.search_place').fadeIn();
			}
		}