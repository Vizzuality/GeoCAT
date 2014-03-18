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