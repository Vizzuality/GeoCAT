
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
		
		head.ready(function(){
		  head.js("http://maps.google.com/maps/api/js?v=3.4&libraries=geometry&sensor=false&callback=initApplication");
		});
		
		function initApplication() {		  	
		  
			//Add Markers and so on
			head.js("/javascripts/editor/MapOverlays/GapsOverlay.js",
			        "/javascripts/editor/MapOverlays/MarkerOverTooltip.js",
			        "/javascripts/editor/MapOverlays/MarkerTooltip.js",
			        "/javascripts/editor/MapOverlays/PolygonOverTooltip.js",
			        "/javascripts/editor/MapOverlays/DeleteInfowindow.js",
			        "/javascripts/editor/Models/CreateMarker.js",
			        "/javascripts/editor/Models/MergeOperations.js",
			        "/javascripts/plugins/tileoverlay.js",
			        "/javascripts/editor/MapOVerlays/CanvasTest.js",
			      function(){
			        mainApp();
        			createMap();
        			startSources();
              //Adding layers
              layers = new LayerCustomization(upload_information.data.layers);

        			//if the application comes through an upload file
        			if (upload_information.success) {
        				uploadGeoCAT(upload_information);
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
			      }
			);
		}