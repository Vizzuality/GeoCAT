		
		/*========================================================================================================================*/
		/* When the document is loaded. */
		/*========================================================================================================================*/
		
		$(document).ready(function() {

			//Get scientific_name
			specie = $('a#scientific_name').text();


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

		});
