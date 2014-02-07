

      /*==========================================================================================================================*/
      /*                                                                                                                          */
      /*        SourceOperations => Class to interact with the editor sources, like GBIF or Flickr                                */
      /*                                                                                                                          */
      /*==========================================================================================================================*/



      var flickr_founded;   // Flickr data founded
      var gbif_founded;     // Gbif data founded


      function startSources() {

        // Init uploaders
        initDwcUploader();
        initGeocatUploader();

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
          if (!$(this).parent().hasClass('selected')) {
            removeSelectedSources();
            if (!$(this).parent().hasClass('searching')) {
              $(this).parent().addClass('selected');
            }
          }
        });


        //Input focus in - out
        $("#add_source_container ul li span.search input").focusin(function(){
          var value = $(this).parent().children('input[type="text"]').val();
          var me = this;
          if (value=='' || value=='Insert species name') {
            $(this).val('');
            $(this).css('font-style','normal');
            $(this).css('color','#333333');
          }
          $(document).keydown(function(e) {
            if (e.keyCode == 13) { // ESC
              $(me).closest('li').find('span.search a').trigger('click');
            }
          });
        });
        $("#add_source_container ul li span.search input").focusout(function(){
           var value = $(this).parent().children('input[type="text"]').val();
           if (value=='' || value=='Insert species name') {
             $(this).css('font-style','italic');
             $(this).css('color','#666666');
             $(this).val('Insert species name');
           }
           $(document).unbind('keydown');
         });



        //Search term
        $("#add_source_container ul li span.search a").click(function(){
          var kind = ($(this).closest('li').children('a.checkbox').attr('id')=="add_flickr")?'flickr':'gbif';
          var value = $(this).parent().children('input').val().toLowerCase();
          var check_id = $(this).parent().parent().children('a.checkbox').attr('id');
          var parent = $(this).parent().parent();
          if (value!='' && value!='insert species name' ) {
            $(this).parent().parent().addClass('searching');

            var m = sources_collection.find(function(m) {
              return m.get('query') == value && m.get('type') == kind
            });

            if (m) {
              $(this).closest('li').find('span.loading a').removeClass('import_data').addClass('retry').text('retry');
              $(this).closest('li').addClass('error');
              $(this).closest('li').find('span p').addClass('error');
              $(this).closest('li').find('span p').text('Already added!');
            } else {
              $(this).closest('li').find('span.loading p').removeClass('loaded');
              $(this).closest('li').find('span p').text('Loading...');
              $(this).closest('li').find('span.loading a').addClass('import_data').removeClass('enabled');
              callSourceService(check_id,parent,value);
            }
          }
        });


        $("span.loading a.retry").live('click',function(ev){
          ev.stopPropagation();
          ev.preventDefault();
          $(this).addClass('import_data').removeClass('retry').text('import');
          $(this).closest('li').removeClass('searching');
          $(this).closest('li').removeClass('error');
          $(this).closest('li').find('span p').removeClass('error');
          $(this).closest('li').find('span p').text('Loading...');
          $(this).parent().find('p').removeClass('loaded');
        });



        //import data
        $("span.loading a.import_data").live('click', function(){
          if ($(this).hasClass('enabled')) {
            $("#add_source_container").fadeOut();
            $("#add_source_button").removeClass('open');
            switch($(this).parent().parent().find('a.checkbox').attr('id')) {
              case 'add_flickr':  flickr_data = flickr_founded[0];
                                  addSourceToMap(flickr_data,true,false);
                                   break;
              case 'add_gbif':    gbif_data = gbif_founded[0];
                                  addSourceToMap(gbif_data,true,false);
                                  break;
              default:             null;
            }
          }
        });


        //Close merge & delete windows
        $('div.delete_all a.cancel,div.merge_container a.cancel').click(function(){
          $('div.delete_all').fadeOut();
          $('div.merge_container').fadeOut();
        });
      }

      function initGeocatUploader() {
        var $uploader = $("#geocat_uploader");
        var $option = $uploader.closest('li');

        // Jquery uploader for GeoCat and RLA files
        var uploader = new qq.FileUploader({
            element: $uploader[0],
            action: '/editor',
            allowedExtensions: [],
            onSubmit: function(id, fileName){
              $uploader.find('.qq-upload-button').hide();
              $uploader.find('.qq-upload-list li:eq(0)').remove();
              $uploader.parent().find('a.delete').show();
            },
            onProgress: function(id, fileName, loaded, total){
              $uploader.parent().find('a.delete').hide();
              $option.find('span.qq-upload-file').text('Uploading...');
            },
            onComplete: function(id, fileName, responseJSON) {
              console.log(responseJSON);

              var total_occurrences = {};
              total_occurrences.points = new Array();
              var sources = responseJSON.data.sources;
              _.each(sources,function(element){
                _.each(element.points,function(point){
                  if (point.catalogue_id && (point.catalogue_id.search('user') != -1 || !point.geocat_kind)) {
                    global_id++;
                    point.catalogue_id = 'user_'+global_id;
                    point.geocat_kind = 'user';
                  }
                  total_occurrences.points.push(point);
                });
              });

              $option.find('a.delete').show();
              $uploader.find('span.qq-upload-file').show();
              $uploader.find('span.qq-upload-file').text(fileName);

              if (responseJSON.success) {
                if (_.isEmpty(responseJSON.warnings)) {
                  $option.find('span.import a.import_data').addClass('enabled');
                  $option.find('span.import a.import_data').click(function(ev){
                    closeSources();
                    addSourceToMap(total_occurrences,true,false);
                  });
                } else {
                  closeSources();
                  $('div#csv_error ul li').remove();
                  var errors_size = 0;
                  $.each(responseJSON.errors.sources,function(index,element){
                    for (var i=0; i<element.length;i++) {
                      errors_size++;
                      $('div#csv_error ul').append('<li class="error">'+element[i].capitalize()+'</li>');
                    }
                  });

                  $.each(responseJSON.warnings.sources,function(index,element){
                    for (var i=0; i<element.length;i++) {
                      $('div#csv_error ul').append('<li class="warning">'+element[i].capitalize()+'</li>');
                    }
                  });

                  if (errors_size>0) {
                    $('div#csv_error h3').text('There are errors in your uploaded csv file');
                    $('div#csv_error span a.continue').hide();
                  } else {
                    $('div#csv_error span a.continue').unbind('click');
                    $('div#csv_error span a.continue').click(function(ev){
                      $('div#csv_error').fadeOut();
                      addSourceToMap(total_occurrences,true,false);
                    });
                    $('div#csv_error h3').text('There are warnings in your uploaded csv file');
                    $('div#csv_error span a.continue').show();
                  }
                  changeApplicationTo(6);
                }
              } else {
                if (responseJSON.format=="geocat" || responseJSON.format==null) {
                  $option.find('span.import').parent().addClass('error');
                  $option.find('span.import a.delete').hide();
                  $uploader.find('.qq-upload-list li:eq(0) span:eq(0)').text('File Corrupted');
                  $uploader.find('.qq-upload-list li:eq(0) span:eq(0)').css('color','white');
                  $uploader.find('.qq-upload-list li:eq(0) span:eq(0)').css('background','url(/assets/editor/fail.png) no-repeat 0 1px');
                  $uploader.find('.qq-upload-list li:eq(0) span:eq(0)').css('padding','0 0 0 14px');
                  $option.find('span.import a.retry').addClass('enabled');
                  $option.find('span.import a.retry').show();
                  $option.find('span.import a.retry').click(function(ev){closeSources();});
                  $option.find('span.import a.import_data').addClass('enabled');
                  $option.find('span.import a.import_data').text('retry');
                  $option.find('span.import a.import_data').click(function(ev){resetUploader();});
                } else {
                  // if (_.isEmpty(responseJSON.warnings)) {
                  //   $option.find('span.import a.import_data').addClass('enabled');
                  //   $option.find('span.import a.import_data').click(function(ev){
                  //     closeSources();
                  //     addSourceToMap(total_occurrences,false,false);
                  //   });
                  // } else {
                    closeSources();
                    $('div#csv_error ul li').remove();
                    var errors_size = 0;

                    $.each(responseJSON.errors.sources,function(index,element){
                      for (var i=0; i<element.length;i++) {
                        errors_size++;
                        $('div#csv_error ul').append('<li class="error">'+element[i].capitalize()+'</li>');
                      }
                    });

                    $.each(responseJSON.warnings.sources,function(index,element){
                      for (var i=0; i<element.length;i++) {
                        $('div#csv_error ul').append('<li class="warning">'+element[i].capitalize()+'</li>');
                      }
                    });

                    if (errors_size>0) {
                      $('div#csv_error h3').text('There are errors in your uploaded csv file');
                      $('div#csv_error span a.continue').hide();
                    } else {
                      $('div#csv_error span a.continue').unbind('click');
                      $('div#csv_error span a.continue').click(function(ev){
                        $('div#csv_error').fadeOut();
                        addSourceToMap(total_occurrences,false,false);
                      });
                      $('div#csv_error h3').text('There are warnings in your uploaded csv file');
                      $('div#csv_error span a.continue').show();
                    }
                  // }
                  removeSelectedSources();
                  changeApplicationTo(6);
                }
              }
            },
            onCancel: function(id, fileName){},
            messages: {},
            showMessage: function(message){ alert(message); }
        });
      }

      function initDwcUploader() {
        var $uploader = $('#dwc_uploader');
        var $option = $uploader.closest('li');

        // Jquery uploader for GeoCat and RLA files
        var uploader = new qq.FileUploader({
            element: $uploader[0],
            action: '/search/dwc',
            allowedExtensions: [],
            onSubmit: function(id, fileName){
              $uploader.find('.qq-upload-button').hide();
              $uploader.find('.qq-upload-list li:eq(0)').remove();
              $option.parent().find('a.delete').show();
            },
            onProgress: function(id, fileName, loaded, total){
              $option.parent().find('a.delete').hide();
              $uploader.find('span.qq-upload-file').text('Uploading...');
            },
            onComplete: function(id, fileName, responseJSON) {
              resetUploader();
              closeSources();
              var species_selector = new SpecieSelector(upload_information);
            },
            onCancel: function(id, fileName){},
            messages: {},
            showMessage: function(message){ alert(message); }
        });
      }



      /*============================================================================*/
      /* Close sources window.                                                       */
      /*============================================================================*/
      function closeSources() {
        $("#add_source_container").fadeOut();
        $('#add_source_button').removeClass('open');
        $(document).unbind('keydown');
      }



      /*============================================================================*/
      /* Open sources window.                                                       */
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
      /* Remove selected class in -> add source window.                             */
      /*============================================================================*/
      function removeSelectedSources() {
        $("#add_source_container ul li").each(function(i,item){
          $(this).find('input[type="text"]').val('Insert species name').css('font-style','italic').css('color','#666666');
          $(this).removeClass('selected');
          $(this).find('span.loading a').addClass('import_data').removeClass('retry').text('import');
          $(this).removeClass('searching');
          $(this).find('span p').removeClass('loaded');
          $(this).removeClass('error');
          $(this).find('span p').removeClass('error');
          $(this).find('span p').text('Loading...');
        });
      }



      /*============================================================================*/
      /* Change state loading source to loaded source.                               */
      /*============================================================================*/
      function onLoadedSource(element, total) {
        $(element).find('span p').addClass('loaded');
        if (total != 0) {
          $(element).find('span a').addClass('enabled');
        } else {
          $(element).find('span.loading a').removeClass('import_data').addClass('enabled').addClass('retry').text('retry');
        }
      }


      /*============================================================================*/
      /* Reset properties of uploader.                                               */
      /*============================================================================*/
      function resetUploader() {
        $('span.import').parent().removeClass('error');
        $('span.import a.delete').hide();
        $('span.import a.retry').removeClass('enabled');
        $('span.import append').hide();
        $('span.import a.retry').unbind('click');

        $('span.import a.import_data').removeClass('enabled');
        $('span.import a.import_data').text('import');
        $('span.import a.import_data').unbind('click');

        $('.qq-upload-button').show();
        $('.qq-upload-list li').remove();
        $('.qq-upload-list').append('<li>Select a file</li>');
        $('span div.inner a.delete').hide();
      }


      /*============================================================================*/
      /* Reset properties of sources window every time you open it.                 */
      /*============================================================================*/
      function resetSourcesProperties() {
        flickr_founded = [];
        gbif_founded = [];

        $("#add_source_container ul li").each(function(i,item){
          $(item).removeClass('selected added searching');
          $(item).find('input[type="text"]').val('Insert species name');
          $(item).find('span input[type="text"]').css({'font-style':'italic','color':'#666666'});
          $(item).find('span p').removeClass('loaded');
          $(item).find('span.normal').hide();
          $(item).find('span.normal a').removeClass('enabled');
          $(item).find('div').removeClass('selected');
          $(item).find('span p').text('Loading...');
        });

        resetUploader();
      }



      /*============================================================================*/
      /* Open Delete container.                                                     */
      /*============================================================================*/
      function openDeleteAll(query,kind) {
        // var position = $('ul#sources_list li[species="'+query+'"][type="'+kind+'"]').position();
        // var list_height = $('ul#sources_list').height();

        // //Arrow position
        // if (position.top<20) {
        //   $('div.delete_all').css('top','-10px');
        //   $('div.delete_all span.arrow').css('top','52px');
        // } else {
        //   $('div.delete_all').css('top',position.top-20 + 'px');
        //   $('div.delete_all span.arrow').css('top','52px');
        // }

        // $('a.'+ kind).parent().children('a.delete_all').addClass('active');
        // $('div.delete_all').fadeIn();

        // switch (kind) {
        //   case 'gbif':   $('div.delete_all h4').text('DELETE THESE GBIF OCCS');
        //                   break;
        //   case 'flickr':    $('div.delete_all h4').text('DELETE THESE FLICKR OCCS');
        //                   break;
        //   default:        $('div.delete_all h4').text('DELETE ALL YOUR OCCS');
        // }

        // $('div.delete_all div a.yes').unbind('click');
        // $('div.delete_all div a.yes').bind('click',function(){deleteAll(query,kind)});
      }



      /*============================================================================*/
      /* Close Delete container.                                                     */
      /*============================================================================*/
      function closeDeleteAll() {
        // $('div.delete_all').fadeOut();
        // $('a.delete_all').removeClass('active');
      }



      /*============================================================================*/
      /* Active Merge buttons.                                                       */
      /*============================================================================*/
      function activeMerge() {
        // if (merge_object.gbif_points.length>0) {
        //   $('a#GBIF_points').live(function(ev){
        //     $(this).parent().find('a.merge').addClass('active');
        //     $(this).parent().find('a.merge').click(function(){openMergeContainer("green")});
        //   });
        // }
        // if (merge_object.flickr_points.length>0) {
        //   $('a#Flickr_points').live(function(ev){
        //     $(this).parent().find('a.merge').addClass('active');
        //     $(this).parent().find('a.merge').click(function(){openMergeContainer("pink")});
        //   });
        // }
      }



      /*============================================================================*/
      /* Open Merge container.                                                       */
      /*============================================================================*/
      function openMergeContainer(query,kind) {

        // var position = $('ul#sources_list li[species="'+query+'"][type="'+kind+'"]').position();
        // var list_height = $('ul#sources_list').height();

        // //Arrow position
        // if (position.top<20) {
        //   $('div.merge_container').css('top','-10px');
        //   $('div.merge_container span.arrow').css('top','52px');
        // } else {
        //   $('div.merge_container').css('top',position.top-20 + 'px');
        //   $('div.merge_container span.arrow').css('top','52px');
        // }

        // $('div.merge_container h4').text('MERGE THESE '+kind+' OCCS');
        // $('div.merge_container p').text('There are new points in this '+kind+' source');
        // $('div.merge_container div a.merge_button').unbind('click');
        // $('div.merge_container div a.merge_button').bind('click',function(){mergeSource(query,kind)});
        // $('div.merge_container').fadeIn();
      }



      /*============================================================================*/
      /* Close Merge container.                                                     */
      /*============================================================================*/
      function closeMergeContainer(query,kind) {
        // $('div.merge_container').fadeOut();
        // $('a.merge').unbind('click');
        // $('a.merge').removeClass('active');
      }




      /*============================================================================*/
      /* Get data from api service thanks to the name (flickr,gbif,...etc).         */
      /*============================================================================*/
      function callSourceService(kind, element, query) {
        var url;
        switch(kind) {
          case 'add_flickr':  url = "/search/flickr/"; break;
          default:    url= "/search/gbif/"; break;
        }
        flickr_founded = new Array();
        gbif_founded = new Array();

        $.getJSON(url + query.replace(' ','+'),
            function(result){
			  var count = 0;
              switch(kind) {
                case 'add_flickr':  flickr_founded.push(result[0]); count = result[0].points.length; break;
                default:            gbif_founded.push(result[0]); count = result[0].points.length;
              }

              $(element).find('span p').text(((count>=1000)?'> ':'') + count + ((count == 1) ? " occ" : " occs") + ' found');

							if (count>=1000) {
								$(element).find('a.import_data').text('import first 1000');
	 						}


              onLoadedSource(element,result[0].points.length);
            }
        ).error(function() {
            $(element).find('span p').text('Sorry, the data provider is down.');
            $(element).find('span.loading a').removeClass('import_data').addClass('enabled').addClass('retry').text('retry');


        });
      }


      /*============================================================================*/
      /* Capitalize strings.                                                         */
      /*============================================================================*/
      String.prototype.capitalize = function() {
          return this.charAt(0).toUpperCase() + this.slice(1);
      }




