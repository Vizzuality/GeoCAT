
		var report_name;  							/*** Report name ***/
		var state = 'select';						// State of the map & application

		var points;								      // Points operations for each specie
		var convex_hull;								// Convex Hull model Object for calculating the polygon
		var actions;										// UnredoOperations model Object for actions made by the user.
		var merge_object; 							// MergeOperations model Object for recover points from server like GBIF or Flickr
    var layers;                     // LayersCustomization variable


		/*============================================================================*/
		/* DOM loaded.									 																							*/
		/*============================================================================*/
		

    window.onload = initApplication;  
		
		function initApplication() {		  	
		
      mainApp();
  		createMap();
  		startSources();
  		
      //Adding layers
      if (!_.isEmpty(upload_information) && upload_information.data) {
        layers = new LayerCustomization(upload_information.data.layers);
      } else {
        layers = new LayerCustomization([]);
      }

      // Adding DWC points?
      if (upload_information && ( upload_information.species || ( upload_information.errors && !_.isEmpty(upload_information.errors)))) {
        var species_selector = new SpecieSelector(upload_information);
      }

  		//if the application comes through an upload file
  		if (upload_information.data && upload_information.data.sources!=null) {
  		  $('div.header h1 p').text(upload_information.data.reportName);
        $('div.header h1 sup').text('saved');
  			changeApplicationTo(2);
  			uploadGeoCAT(upload_information);
  		} else if (_.isEmpty(upload_information)) {
  			$('#welcome').show();
  			// Trick to hide welcome window if user clicks off this container
  			$('body').click(function(event) {
  		    if (!$(event.target).closest('#welcome').length) {
  		      $('#welcome').fadeOut();
  					$('body').unbind('click');
  		    };
  			});
  		}
		}