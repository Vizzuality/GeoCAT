		
		/*========================================================================================================================*/
		/* When the document is loaded. Effects with DOM Elements */
		/*========================================================================================================================*/
		
		$(document).ready(function() {

			$('body').css('background','url(/images/editor/bkg.jpg) 0 0');
			
			//Get scientific_name
			specie = $('a#scientific_name').text();
			
			//Get scientific_id (for searches in GBIF)
			gbif_id = $('a#gbif_id').text();
			
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
						$("#add_source_container").fadeOut();
						$("#add_source_button").removeClass('open');
						switch($(this).parent().parent().find('a.checkbox').attr('id')) {
							case 'add_flickr': 	flickr_data = flickr_founded[0];
																	addSourceToMap(flickr_data,true,true);
																 	break;
							case 'add_gbif':  	gbif_data = gbif_founded[0];
																	addSourceToMap(gbif_data,true,true);
																	break;
							default: 						null;
						}
				}
			});
			
			
			//toggle on/off analysis
			$('a#toggle_analysis').click(function(ev){
				if ($(this).hasClass('disabled')) {
					openConvexHull();
					$(this).parent().children().removeClass('disabled');
					$(this).parent().children('h3').text('Analysis enabled');
					$(this).find('span').stop(true).animate({backgroundPosition: '-1px -25px'}, {duration: 'fast',easing: 'easeOutBounce'});
					$('div.analysis_data').stop().animate({height: '150px'}, 'fast',function(ev){$(this).css('overflow','auto');});
					$('#analysis_help').attr('src','/images/editor/analysis_help2.png');
				} else {
					closeConvexHull();
					$(this).addClass('disabled');
					$(this).parent().children('h3').addClass('disabled');
					$(this).parent().children('h3').text('Analysis disabled');
					$(this).find('span').stop(true).animate({backgroundPosition: '-28px -25px'}, {duration: 'fast',easing: 'easeOutBounce'});
					$('div.analysis_data').stop().animate({height: '0'}, 'fast',function(ev){$(this).css('overflow','auto');});
					$('#analysis_help').attr('src','/images/editor/analysis_help.png');
				}
			});
			
			
			//Undo-redo action fade when rollout bottom zone
			$("div.footer").hover(function(ev){
				//Nothing to do
			},function(ev){
				$("#action_info").fadeTo(500,0);
			});
			
			
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

		});
		