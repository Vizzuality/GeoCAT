

			/*==========================================================================================================================*/
			/*  																																																												*/
			/*				SourceOperations => Class to interact with the editor sources, like GBIF or Flickr																*/
			/*  																																																												*/
			/*==========================================================================================================================*/



			var flickr_founded;							// Flickr data founded
			var gbif_founded;								// Gbif data founded


			function startSources() {

				// Jquery uploader file RLA
				var uploader = new qq.FileUploader({
				    element: $('#uploader')[0],
				    action: '/editor',
						allowedExtensions: [],        
						onSubmit: function(id, fileName){
							$('.qq-upload-button').hide();
							$('#uploader .qq-upload-list li:eq(0)').remove();
							$('#uploader').parent().find('a.delete').show();
						},
						onProgress: function(id, fileName, loaded, total){},
						onComplete: function(id, fileName, responseJSON) {
						  
							if (responseJSON.success) {
							  if (responseJSON.warnings.length==0) {
							    $('span.import a.import_data').addClass('enabled');
  								merge_object = new MergeOperations([]);
  								$('span.import a.import_data').click(function(ev){
  								  closeSources();
  								  merge_object.importPoints(responseJSON.data.sources);
  								});
							  } else {
							    closeSources();
                  $('div#csv_error ul li').remove();
                  var errors_size = 0;
                  $.each(responseJSON.errors,function(index,element){
                    for (var i=0; i<element.length;i++) {
                      errors_size++;
                      $('div#csv_error ul').append('<li class="error">'+element[i].capitalize()+'</li>');
                    }
                  });
                  
                  $.each(responseJSON.warnings,function(index,element){
                    for (var i=0; i<element.length;i++) {
                      $('div#csv_error ul').append('<li class="warning">'+element[i].capitalize()+'</li>');
                    }
                  });

                  if (errors_size>0) {
                    $('div#csv_error h3').text('There are errors in your uploaded csv file');
                    $('div#csv_error span a.continue').hide();
                  } else {
                    merge_object = new MergeOperations([]);
                    $('div#csv_error span a.continue').unbind('click');
    								$('div#csv_error span a.continue').click(function(ev){
    								  $('div#csv_error').fadeOut();
    								  merge_object.importPoints(responseJSON.data.sources);
    								});
                    $('div#csv_error h3').text('There are warnings in your uploaded csv file');
                    $('div#csv_error span a.continue').show();
                  }
                  changeApplicationTo(6);
							  }

							} else {
                if (responseJSON.format=="rla") {
                  $('span.import').parent().addClass('error');
                  $('span.import a.delete').hide();
                  $('#uploader .qq-upload-list li:eq(0) span:eq(0)').text('File Corrupted');
                  $('#uploader .qq-upload-list li:eq(0) span:eq(0)').css('color','white');
                  $('#uploader .qq-upload-list li:eq(0) span:eq(0)').css('background','url(/images/editor/fail.png) no-repeat 0 1px');
                  $('#uploader .qq-upload-list li:eq(0) span:eq(0)').css('padding','0 0 0 14px');
                  $('span.import a.retry').addClass('enabled');
                  $('span.import a.retry').show();
                  $('span.import a.retry').click(function(ev){closeSources();});
                  $('span.import a.import_data').addClass('enabled');
                  $('span.import a.import_data').text('retry');
                  $('span.import a.import_data').click(function(ev){resetUploader();});
                } else {
                  if (responseJSON.warnings.length==0) {
                    $('span.import a.import_data').addClass('enabled');
                    merge_object = new MergeOperations([]);
                    $('span.import a.import_data').click(function(ev){
                      closeSources();
                      merge_object.importPoints(responseJSON.data.sources);
                    });
                  } else {
                    closeSources();
                    $('div#csv_error ul li').remove();
                    var errors_size = 0;
                    
                    $.each(responseJSON.errors,function(index,element){
                      for (var i=0; i<element.length;i++) {
                        errors_size++;
                        $('div#csv_error ul').append('<li class="error">'+element[i].capitalize()+'</li>');
                      }
                    });
                    
                    $.each(responseJSON.warnings,function(index,element){
                      for (var i=0; i<element.length;i++) {
                        $('div#csv_error ul').append('<li class="warning">'+element[i].capitalize()+'</li>');
                      }
                    });

                    if (errors_size>0) {
                      $('div#csv_error h3').text('There are errors in your uploaded csv file');
                      $('div#csv_error span a.continue').hide();
                    } else {
                      merge_object = new MergeOperations([]);
                      $('div#csv_error span a.continue').unbind('click');
                     $('div#csv_error span a.continue').click(function(ev){
                       $('div#csv_error').fadeOut();
                       merge_object.importPoints(responseJSON.data.sources);
                     });
                      $('div#csv_error h3').text('There are warnings in your uploaded csv file');
                      $('div#csv_error span a.continue').show();
                    }
                  }
                  removeSelectedSources();
                  changeApplicationTo(6);
                }
							}
						},
						onCancel: function(id, fileName){},
						messages: {},
						showMessage: function(message){ alert(message); }
				});



				//change file input value
				$('span div.inner a.delete').click(function(ev){
					resetUploader();
				});
			
				//open add sources container
				$("#add_source_button").click(function(){
					if (!$('#add_source_container').is(':visible')) {
						openSources();
					} else {
						closeSources();
					}
				});
			
				//add source effects
				$("#add_source_container ul li a.checkbox").click(function(){
					if (!$(this).parent().hasClass('selected') && !$(this).parent().hasClass('added')) {
						removeSelectedSources();
						$(this).parent().addClass('selected');
						if (!$(this).parent().find('span p').hasClass('loaded') && !$(this).hasClass('import_file')) {
							callSourceService($(this).attr('id'),$(this).parent());
						}
					}
				});
			
				//import data
				$("span.normal a.import_data").click(function(){
					if ($(this).hasClass('enabled')) {
							$("#add_source_container").fadeOut();
							$("#add_source_button").removeClass('open');
							switch($(this).parent().parent().find('a.checkbox').attr('id')) {
								case 'add_flickr': 	if (convex_hull.isVisible()) {
                                      $('a#toggle_analysis').trigger('click');
                                    }
								                    flickr_data = flickr_founded[0];
																		addSourceToMap(flickr_data,true,false);
																	 	break;
								case 'add_gbif':  	if (convex_hull.isVisible()) {
                                      $('a#toggle_analysis').trigger('click');
                                    }
								                    gbif_data = gbif_founded[0];
																		addSourceToMap(gbif_data,true,false);
																		break;
								default: 						null;
							}
					}
				});
			
			}



			/*============================================================================*/
			/* Close sources window. 																											*/
			/*============================================================================*/
			function closeSources() {
				$("#add_source_container").fadeOut();
				$('#add_source_button').removeClass('open');
				$(document).unbind('keydown');
			}



			/*============================================================================*/
			/* Open sources window. 																											*/
			/*============================================================================*/
			function openSources() {
				resetSourcesProperties();
				// bind ESC keydown events
				$(document).keydown(function (e) {
					if (e.keyCode == 27) { // ESC
						closeSources();
					}
				});
				$("#add_source_container").fadeIn();
				$('#add_source_button').addClass('open');
			}



			/*============================================================================*/
			/* Remove selected class in -> add source window. 														*/
			/*============================================================================*/
			function removeSelectedSources() {
				$("#add_source_container ul li").each(function(i,item){
					$(this).removeClass('selected');
				});
			}
	


			/*============================================================================*/
		  /* Change state loading source to loaded source. 															*/
			/*============================================================================*/
			function onLoadedSource(element, total) {
		    $(element).find('span p').addClass('loaded');
				if (total != 0) 
		    	$(element).find('span a').addClass('enabled');
		  }


			/*============================================================================*/
			/* Reset properties of uploader.															 								*/
			/*============================================================================*/	
			function resetUploader() {
			  $('span.import').parent().removeClass('error');
		    $('span.import a.delete').hide();
		    $('span.import a.retry').removeClass('enabled');
		    $('span.import a.retry').hide();
		    $('span.import a.retry').unbind('click');
		    
		    $('span.import a.import_data').removeClass('enabled');
		    $('span.import a.import_data').text('merge');
		    $('span.import a.import_data').unbind('click');
			  
				$('.qq-upload-button').show();
				$('.qq-upload-list li').remove();
				$('.qq-upload-list').append('<li>Select a file</li>');
				$('span div.inner a.delete').hide();
			}


			/*============================================================================*/
			/* Reset properties of sources window every time you open it. 								*/
			/*============================================================================*/	
			function resetSourcesProperties() {
				flickr_founded = [];
				gbif_founded = [];

				$("#add_source_container ul li").each(function(i,item){
					$(this).removeClass('selected');
					$(this).removeClass('added');
					$(this).find('span p').removeClass('loaded');
					$(this).find('span a').removeClass('enabled');
					$(this).find('div').removeClass('selected');
					$(this).find('span p').text('Loading...');
				});

				resetUploader();
				
				if (total_points.get('flickr')>0) {
					$('#add_flickr').parent().addClass('added');
				}

				if (total_points.get('gbif')>0) {
					$('#add_gbif').parent().addClass('added');
				}
			}



			/*============================================================================*/
			/* Open Delete container. 																										*/
			/*============================================================================*/
			function openDeleteAll(kind) {
				var position = $('li a.'+kind).offset();
				if (convex_hull.isVisible()) {
  				$('div.delete_all').css('top',position.top - 412 + 'px');
				} else {
  				$('div.delete_all').css('top',position.top - 268 + 'px');
				}
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

				$('div.delete_all div a.yes').unbind('click');
				$('div.delete_all div a.yes').bind('click',function(){deleteAll(type)});
			}



			/*============================================================================*/
			/* Close Delete container.	 																									*/
			/*============================================================================*/
			function closeDeleteAll() {
				$('div.delete_all').fadeOut();
				$('a.delete_all').removeClass('active');
			}



			/*============================================================================*/
			/* Active Merge buttons. 																											*/
			/*============================================================================*/
			function activeMerge() {
				if (merge_object.gbif_points.length>0) {
					$('a#GBIF_points').livequery(function(ev){
						$(this).parent().find('a.merge').addClass('active');
						$(this).parent().find('a.merge').click(function(){openMergeContainer("green")});
					});
				}
				if (merge_object.flickr_points.length>0) {
					$('a#Flickr_points').livequery(function(ev){
						$(this).parent().find('a.merge').addClass('active');
						$(this).parent().find('a.merge').click(function(){openMergeContainer("pink")});
					});
				}
			}



			/*============================================================================*/
			/* Open Merge container. 																											*/
			/*============================================================================*/
			function openMergeContainer(kind) {
				var position = $('li a.'+kind).offset();
				if (convex_hull.isVisible()) {
  				$('div.merge_container').css('top',position.top - 412 + 'px');
				} else {
  				$('div.merge_container').css('top',position.top - 268 + 'px');
				}
				$('div.merge_container a.merge_button').unbind('click');

				var type;

				switch (kind) {
					case 'green': 	type = 'gbif';
													$('div.merge_container h4').text('MERGE NEW GBIF POINTS');
													if (merge_object.gbif_points.length==1) {
														$('div.merge_container p').text('There is 1 new point in GBIF');
													} else {
														$('div.merge_container p').text('There are '+merge_object.gbif_points.length+' new points in GBIF');
													}
													$('div.merge_container a.merge_button').click(function(){addSourceToMap({points: merge_object.gbif_points, kind:'gbif'},true,false); closeMergeContainer()});

													break;
					default: 				type = 'flickr';
													$('div.merge_container h4').text('MERGE NEW FLICKR POINTS');
													if (merge_object.flickr_points.length==1) {
														$('div.merge_container p').text('There is 1 new point in Flickr');
													} else {
														$('div.merge_container p').text('There are '+merge_object.flickr_points.length+' new points in Flickr');
													}
													$('div.merge_container a.merge_button').click(function(){addSourceToMap({points: merge_object.flickr_points, kind:'flickr'},true,false); closeMergeContainer()});
													break;
				}

				$('div.merge_container').fadeIn();

			}



			/*============================================================================*/
			/* Close Merge container. 																										*/
			/*============================================================================*/
			function closeMergeContainer() {
				$('div.merge_container').fadeOut();
				$('a.merge').unbind('click');
				$('a.merge').removeClass('active');
			}
			



			/*============================================================================*/
			/* Get data from api service thanks to the name (flickr,gbif,...etc). 				*/
			/*============================================================================*/
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
							$(element).find('span p').text(result[0].points.length + ((result[0].points.length == 1) ? " occ" : " occs") + ' founded');
							onLoadedSource(element,result[0].points.length);
						}
				);
			}
			

			/*============================================================================*/
			/* Capitalize strings.                                                 				*/
			/*============================================================================*/
			String.prototype.capitalize = function() {
          return this.charAt(0).toUpperCase() + this.slice(1);
      }
			
			

			
			