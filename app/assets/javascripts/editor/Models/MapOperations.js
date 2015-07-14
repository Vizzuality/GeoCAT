			/*==========================================================================================================================*/
			/*  																																																												*/
			/*				MapOperations => Class to create and interact with the map.																												*/
			/*  																																																												*/
			/*==========================================================================================================================*/


			var map;												// Map object
      var oms;                        //
			var bounds;											// LatLngBounds object to visualize the map correctly
			var geocoder;                   // Geocoder application

			var occurrences = {};						// All the markers of the map (Associative array)
			var global_id = 0; 							// Global id for your own markers
			var global_zIndex = 1;					// Z-index for the markers


			// Control vars for map objects
			var click_infowindow;						// Gray main infowindow object
			var over_tooltip;								// Tiny over infowindow object
			var over_polygon_tooltip;				// Tiny over polygon object
			var delete_infowindow;					// Delete infowindow object
			var selection_polygon; 					// Selection polygon tool
			var drawing = false;						// Flag to know if user is drawing selection rectangle
      var edit_metadata;              // Metadata window

			var over_marker = false;				// True if cursor is over marker, false opposite
			var over_mini_tooltip = false; 	// True if cursor is over mini tooltip, false opposite
			var over_polygon = false				// True if cursor is over selection polygon, false opposite
			var is_dragging = false;				// True if user is dragging a marker, false opposite
			var say_polygon_tooltip = false; 	// True if cursor is over polygon tooltip, false opposite


			function createMap() {
				//initialize map
			  var myOptions = {
			    zoom: 2,
			    center: new google.maps.LatLng(30,0),
			    mapTypeId: google.maps.MapTypeId.TERRAIN,
					disableDefaultUI: true,
					scrollwheel: false,
					streetViewControl: false,
					scaleControl: true
			  };

			  map = new google.maps.Map(document.getElementById("map"), myOptions);


        function setLocation() {
          var c = map.getCenter();
          $('.map-center-label').text('Lat,Lon: ' + c.lat().toFixed(5) + ',' + c.lng().toFixed(5))
        }

        google.maps.event.addListener(map, "center_changed", setLocation);
        setLocation();

				bounds = new google.maps.LatLngBounds();
        geocoder = new google.maps.Geocoder();
        oms = new OverlappingMarkerSpiderfier(map, { markersWontMove: true, markersWontHide: true });

        oms.addListener('click', function(m,e) {
          m._click(e);
        });

				google.maps.event.clearListeners(map, 'tilesloaded');


        //--- GROUPS MAGIC ---//

        groups = new GroupsCollection();

        groups_view = new GroupsView({
          el:         $('div.sources'),
          collection: groups,
          map:        map
        });

        // map sources -> panes!
        map_sources = new MapSources({
          map:        map,
          groups:   groups
        });

        // Analysis stuff
        analysis_data = new AnalysisData();           // Analysis data (cell size, cell type, ...)
        analysis_map = new AnalysisMap({              // Analysis in the map (polygons, cells, AOO, EOO,...)
          map: map,
          analysis: analysis_data
        });

        convex_hull = analysis_view = new AnalysisView({
          el:             $('div.analysis'),
          analysis_map:   analysis_map,
          analysis_data:  analysis_data
        });
        // End analysis

				actions = new UnredoOperations();								// Un-Re-Do Object
        edit_metadata = new MetadataInfowindow(new google.maps.LatLng(0,0), null, map);


				selection_polygon = new google.maps.Polygon({
		      strokeColor: "#000000",
		      strokeOpacity: 1,
		      strokeWeight: 1,
		      fillColor: "#FFFFFF",
		      fillOpacity: 0
		    });

				/*========================MAP EVENTS==========================*/

				//Click map event
				google.maps.event.addListener(map,"click",function(event){
					if (state == 'add') {
						addMarker(event.latLng,null,false);
					}
				});


				//Change cursor depending on application state
				google.maps.event.addListener(map,"mouseover",function(event){
						switch(state) {
							case 'add': 			map.setOptions({draggableCursor: "url(/assets/editor/add_cursor.png),default"});
																break;
							case 'selection': map.setOptions({draggableCursor: "url(/assets/editor/selection_cursor.png),default"});
																break;
							case 'remove': 		map.setOptions({draggableCursor: "url(/assets/editor/remove_cursor.png),default"});
																break;
							default: 					map.setOptions({draggableCursor: "url(/assets/editor/default_cursor.png),default"});
						}
				});


				//Zoom change = Zoom control change
				google.maps.event.addListener(map,"zoom_changed",function(event){moveZoomControl();});



				/*========================DOM EVENTS==========================*/
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


				$('div.search_place').hover(function(ev){
					$(this).stop(ev).fadeTo(0,1);
				},function(ev){
					$(this).stop(ev).fadeTo(0,0.5);
				});


				// Selection tool
				$('div#map').mousedown(function(ev){
				  if (state=="selection" && !say_polygon_tooltip) {
            google.maps.event.clearListeners(selection_polygon, 'mouseover');
            google.maps.event.clearListeners(selection_polygon, 'mouseout');
            if (over_polygon_tooltip!=null) {
             over_polygon_tooltip.hide();
            }

				    var position = {};
				    position.x = ev.pageX-($('div#map').offset().left);
				    position.y = ev.pageY-($('div#map').offset().top);
				    var latlng = edit_metadata.transformCoordinates(new google.maps.Point(position.x,position.y));

				    selection_polygon.setOptions({fillOpacity: 0});
            drawing = true;
            selection_polygon.setPath([latlng,latlng,latlng,latlng]);
				    selection_polygon.setMap(map);

				    $('div#map').mousemove(function(ev){
              position.x = ev.pageX-($('div#map').offset().left);
  				    position.y = ev.pageY-($('div#map').offset().top);
  				    var latLng = edit_metadata.transformCoordinates(new google.maps.Point(position.x,position.y));

              selection_polygon.setPath([
                selection_polygon.getPath().getAt(0),
                new google.maps.LatLng(selection_polygon.getPath().getAt(0).lat(),latLng.lng()),
                latLng,
                new google.maps.LatLng(latLng.lat(),selection_polygon.getPath().getAt(0).lng()),
                selection_polygon.getPath().getAt(0)]);
				    });

				    $('div#map').mouseup(function(ev){
				      var position = {};
				      position.x = ev.pageX-($('div#map').offset().left);
  				    position.y = ev.pageY-($('div#map').offset().top);
  				    var latLng = edit_metadata.transformCoordinates(new google.maps.Point(position.x,position.y));

				      $('div#map').unbind('mouseup');
				      $('div#map').unbind('mousemove');
              drawing = false;
              selection_polygon.setOptions({fillOpacity: 0.40});
              google.maps.event.clearListeners(map, 'mousemove');
              google.maps.event.clearListeners(selection_polygon, 'click');

              if (over_polygon_tooltip!=null) {
                over_polygon_tooltip.changeData(markersInPolygon(),latLng);
              } else {
                over_polygon_tooltip = new PolygonOverTooltip(latLng, markersInPolygon(), map);
              }

              google.maps.event.addListener(selection_polygon,'mouseover',function(){
               if (over_polygon_tooltip!=null) {
                 over_polygon_tooltip.show();
               }
               over_polygon = true;
              });

              google.maps.event.addListener(selection_polygon,'mouseout',function(){
               if (over_polygon_tooltip!=null && !say_polygon_tooltip) {
                 over_polygon_tooltip.hide();
               }
               over_polygon = false;
              });
				    });
				  }
				});
			}



			/*============================================================================*/
			/* Show loading map stuff. 																										*/
			/*============================================================================*/
			function showMamufasMap() {
				$('#mamufas_map').css('background','url(/assets/editor/mamufas_bkg.png) repeat 0 0');
				$('#mamufas_map').fadeIn();
				$('#loader_map').fadeIn();
			}


			/*============================================================================*/
			/* Hide loading map stuff with YouTube effect (false without effect). 				*/
			/*============================================================================*/
			function hideMamufasMap(effect) {
				$('#loader_map').fadeOut(function(ev){
					if (effect) {
						$('#mamufas_map').css('background','none');
						$('div#import_success').css('width','202px');
						$('div#import_success').css('height','139px');
						$('div#import_success').css('margin-top','-70px');
						$('div#import_success').css('margin-left','-101px');
						$('div#import_success').css('opacity', '0.7');
						$('div#import_success img').css('width','202px');
						$('div#import_success img').css('height','58px');
						$('div#import_success img').css('margin-top','40px');
						$('div#import_success').fadeIn(function(ev){
							$(this).delay(1000).animate({height:417, width:606, opacity:0, marginTop:-209, marginLeft:-303}, 300,function(ev){
								$('#mamufas_map').fadeOut();
							});
							$(this).children('img').delay(1000).animate({height:174, width:606, marginTop:122}, 300);
							$('div#import_success').delay(300).fadeOut();
						});
					} else {
						$('#mamufas_map').fadeOut(function(){$('#mamufas_map').css('background','none');});
					}

					$('#mamufas_map').delay(2000).fadeOut(function(){
						$('#mamufas_map').css('background','none');
						$('div#import_success').css('display','none');
						$('div#import_success').css('width','202px');
						$('div#import_success').css('height','139px');
						$('div#import_success').css('margin-top','-70px');
						$('div#import_success').css('margin-left','-101px');
						$('div#import_success').css('opacity', '0.7');
						$('div#import_success img').css('width','202px');
						$('div#import_success img').css('height','58px');
						$('div#import_success img').css('margin-top','40px');
					});

				});
			}




	/*============================================================================*/
	/* Add a new source to the application (GBIF, FLICKR OR YOUR DATA). 					*/
	/*============================================================================*/
	function addSourceToMap(information, getBound, uploadAction, symbol) {
        if (convex_hull.isVisible()) {
          // mamufasPolygon();
          analysis_map.stop();
        }

        var point_changes = [];

        // Remove spiderfy!
        oms.unspiderfy();

        // Create group or get the correct one
        // if it comes defined
        if (information.group) {
          var group = groups.find(function(m) {
            if (m.get('name') === information.group) {
              return m
            }
          });

          if (!group) {
            group = new GroupModel({
              name: information.group,
              symbol: symbol
            }, {
              map: map
            })
            groups.push(group);
          }
        }

				/* Recursive service for adding markers. */
        function asynAddMarker(i,total,_bounds, uploadAction, observations) {
          if (i < total){
            var info_data = {};
            $.extend(info_data, observations[i]);

            if (group) {
              info_data.dcid = group.cid;
            }

            if (info_data.catalogue_id && occurrences[info_data.catalogue_id]===undefined) {

              // If the point doesnt have info about _active and _removed
							if (info_data.geocat_active===undefined || info_data.geocat_active===null) {
                info_data.geocat_active = true;
              }
							if (info_data.geocat_removed===undefined || info_data.geocat_removed===null) info_data.geocat_removed = false;

							var geocat_query = info_data.geocat_query ? info_data.geocat_query.toLowerCase() : 'user';
              var geocat_kind = info_data.geocat_kind ? info_data.geocat_kind.toLowerCase() : 'user';
							var latlng = new google.maps.LatLng(parseFloat(info_data.latitude),parseFloat(info_data.longitude));

              groups.sum(info_data, geocat_kind, geocat_query);

              bounds.extend(latlng);

              var marker = new GeoCATMarker(latlng, geocat_kind, true, true, info_data, (info_data.geocat_removed)?null:map, symbol);
              oms.addMarker(marker)

              occurrences[marker.data.catalogue_id] = marker;
              occurrences[marker.data.catalogue_id].data.geocat_query = geocat_query;
              occurrences[marker.data.catalogue_id].data.geocat_kind = geocat_kind;

              if (!info_data.geocat_active) {
                var marker_id = marker.data.catalogue_id;
                occurrences[marker_id].setActive(false);
              }
            } else {
							if (info_data.geocat_active==undefined || info_data.geocat_active==null) info_data.geocat_active = true;
							if (info_data.geocat_removed==undefined || info_data.geocat_removed==null) info_data.geocat_removed = false;

							var geocat_query = info_data.geocat_query ? info_data.geocat_query.toLowerCase() : 'user';
							var geocat_kind = info_data.geocat_kind ? info_data.geocat_kind.toLowerCase() : 'user';
              // var geocat_alias = info_data.geocat_alias;
							var latlng = new google.maps.LatLng(parseFloat(info_data.latitude),parseFloat(info_data.longitude));

              // sources_collection.sumUp(geocat_query, geocat_kind, geocat_alias);
              groups.sum(info_data, geocat_kind, geocat_query);

							bounds.extend(latlng);
							global_id++;
							info_data.catalogue_id = 'user_' + global_id;

							var marker = new GeoCATMarker(latlng, geocat_kind, true, true, info_data, (info_data.geocat_removed)?null:map);
              oms.addMarker(marker)

              occurrences[marker.data.catalogue_id] = marker;
              occurrences[marker.data.catalogue_id].data.geocat_query = geocat_query;
              occurrences[marker.data.catalogue_id].data.geocat_kind = geocat_kind;
						}

            // Check if marker was created and it is added to the stack
						if (marker && !occurrences[marker.data.catalogue_id].data.geocat_removed)
							point_changes.push(occurrences[marker.data.catalogue_id].data);

            i++;
            setTimeout(function(){asynAddMarker(i,total,_bounds,uploadAction,observations);},0);
          } else {
            if (uploadAction) {
              $('body').trigger('hideMamufas');
            } else {
              hideMamufasMap(true);
            }

            if (_bounds) map.fitBounds(bounds)

            if (convex_hull.isVisible()) $(document).trigger('occs_updated')

            // Store action
            actions.Do('add',null,point_changes);
          }
        }

        if (information.points.length>20) showMamufasMap()

        asynAddMarker(0,information.points.length,getBound,uploadAction,information.points);
			}



			/*============================================================================*/
			/* Place correctly zoom control with map zoom. 																*/
			/*============================================================================*/
			function moveZoomControl() {
				$('#zoom ul li').removeClass('selected');
				var actual_zoom = map.getZoom();
				if (actual_zoom<3) {
					$('#zoom ul li:eq(13)').addClass('selected');
				} else if (actual_zoom>14) {
					$('#zoom ul li:eq(0)').addClass('selected');
				} else {
					$('#zoom ul li:eq('+(15-actual_zoom)+')').addClass('selected');
				}
			}




			/*============================================================================*/
			/* Remove selection polygon from map. 																				*/
			/*============================================================================*/
			function removeSelectionPolygon() {
				selection_polygon.setPath([]);
				selection_polygon.setMap(null);
			}



			/*============================================================================*/
			/* Return markers what contains the selection polygon. 												*/
			/*============================================================================*/
			function markersInPolygon() {

        //Check if the polygon contains this point
        function Contains(polygon, point) {
          var j=0;
          var oddNodes = false;
          var x = point.lng();
          var y = point.lat();
          for (var i=0; i < polygon.getPath().getLength(); i++) {
            j++;
            if (j == polygon.getPath().getLength()) {j = 0;}
            if (((polygon.getPath().getAt(i).lat() < y) && (polygon.getPath().getAt(j).lat() >= y)) || ((polygon.getPath().getAt(j).lat() < y) && (polygon.getPath().getAt(i).lat() >= y))) {
              if ( polygon.getPath().getAt(i).lng() + (y - polygon.getPath().getAt(i).lat()) /  (polygon.getPath().getAt(j).lat()-polygon.getPath().getAt(i).lat()) *  (polygon.getPath().getAt(j).lng() - polygon.getPath().getAt(i).lng())<x ) {
                oddNodes = !oddNodes;
              }
            }
          }
          return oddNodes;
        };

        var markers_polygon = [];
			  _.each(occurrences, function(element){
         if (!element.data.geocat_removed && Contains(selection_polygon,element.getPosition())) {
           markers_polygon.push(element.data);
         }
        });
        return markers_polygon;
			}


      /*========================================*/
      /* Delete all the markers from a group. */
      /*========================================*/
      function deleteGroup(group) {
        closeMapWindows();
        showMamufasMap();

        if (convex_hull.isVisible()) {
          analysis_map.stop();
        }

        // Remove spiderfy!
        oms.unspiderfy();

        // Vars
        var removed_markers = [];
        var occsCopy = $.extend(true,{},occurrences);
        var s; // Actual source


        function asyncRemoveMarker(query,type) {
          for (var i in occsCopy) {
            var d = occsCopy[i].data;

            if ((d.geocat_kind === type) && (!d.geocat_removed) && (d.scid === s.cid)) {
              groups.deduct(occurrences[i].data, type, query);

              removed_markers.push(occurrences[i].data);
              occurrences[i].data.geocat_removed = true;
              occurrences[i].setMap(null);
            }
            delete occsCopy[i];
            break;
          }

          if (i==undefined) {
            asyncRemoveSource();
          } else {
            setTimeout(function(){
              asyncRemoveMarker(query,type)
            },10);
          }
        }

        var j;
        function asyncRemoveSource() {
          if (j === undefined) {
            j = 0;
          } else {
            ++j;
          }

          if (group.getSources().size() > 0 && group.getSources().at(j)) {
            s = group.getSources().at(j);
            asyncRemoveMarker(s.get('query'),s.get('type'));
          } else {
            // Make group removed
            group.set('removed', true);

            actions.Do('remove', null, removed_markers);
            hideMamufasMap(false);
            delete occsCopy;

            $(document).trigger('occs_removed');

            if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
          }
        }

        // Let's start it!
        asyncRemoveSource();
      }



			/*============================================================================*/
			/* Delete all the markers of a query and type. 																*/
			/*============================================================================*/
			function deleteAll(query,type) {
        closeMapWindows();
        showMamufasMap();

        if (convex_hull.isVisible()) {
          analysis_map.stop();
        }

        // Remove spiderfy!
        oms.unspiderfy();

        var remove_markers = [];
        var occsCopy = $.extend(true,{},occurrences);
        var s = groups.getActive().getSources().where({ type: type, query: query })[0];

        if (!s) {
          console.log("Delete all function can't find this source { query:" + query + ", type:" + type + " }" );
        }

        function asynRemoveMarker(query,type) {
          for (var i in occsCopy) {
            var d = occsCopy[i].data;
            if ((d.geocat_kind == type) && (!d.geocat_removed) && (d.scid === s.cid)) {
              groups.deduct(occurrences[i].data, type, query);

              remove_markers.push(occurrences[i].data);
              occurrences[i].data.geocat_removed = true;
              occurrences[i].setMap(null);
            }
            delete occsCopy[i];
            break;
          }

          if (i==undefined) {
            actions.Do('remove', null, remove_markers);
            hideMamufasMap(false);
            delete occsCopy;
            if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
          } else {
            setTimeout(function(){
              asynRemoveMarker(query,type)
            },0);
          }
        }

        asynRemoveMarker(query,type);
			}



			/*============================================================================*/
			/* Remove markers from map and the marker information. 												*/
			/*============================================================================*/
			function removeMarkers(remove_markers) {
        closeMapWindows();
        if (convex_hull.isVisible()) {
          // mamufasPolygon();
          analysis_map.stop();
        }

        // Remove spiderfy!
        oms.unspiderfy();

        function asynRemoveMarker(i,total, observations) {
          if(i < total){
            var marker_id = observations[i].catalogue_id;
  					var query = occurrences[marker_id].data.geocat_query;
  					var kind = occurrences[marker_id].data.geocat_kind;

            // sources_collection.deduct(query, kind);
            groups.deduct(occurrences[marker_id].data, kind, query);

            occurrences[marker_id].data.geocat_removed = true;
            occurrences[marker_id].setMap(null);
            i++;
            setTimeout(function(){asynRemoveMarker(i,total,observations);},0);
          } else {
            if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
            hideMamufasMap(false);
          }
        }


        if (remove_markers.length>0) {
          if (remove_markers.length>20) {
            showMamufasMap();
          }
          asynRemoveMarker(0,remove_markers.length,remove_markers);
          actions.Do('remove', null, remove_markers);
        }
			}




			/*============================================================================*/
			/* Add new marker to the map. */
			/*============================================================================*/
			function addMarker(latlng, fromAction) {
		        oms.unspiderfy();

						global_id++;
						global_zIndex++;
						var date = new Date();

						var inf = {
		          coordinateUncertaintyInMeters:  15000,
		          collector:                      '',
		          eventDate:                      date.getFullYear()+'-'+(date.getMonth()+1)+"-"+date.getDate(),
		          occurrenceRemarks:              '',
		          catalogue_id:                   'user_' + global_id,
		          latitude:                       latlng.lat(),
		          longitude:                      latlng.lng(),
		          geocat_active:                  true,
		          geocat_kind:                    'user',
		          geocat_query:                    'user',
		          geocat_removed:                 false
		        };


				// inf.coordinateUncertaintyInMeters = 15000;
				// inf.geocat_active = true;
				// inf.geocat_kind = 'user';
				// inf.geocat_query = 'user';
				// inf.geocat_removed = false;
				// inf.collector = "";
				// inf.eventDate = date.getFullYear()+'-'+(date.getMonth()+1)+"-"+date.getDate();
				// inf.occurrenceRemarks = ""
				// inf.catalogue_id = 'user_' + global_id;
				// inf.latitude = latlng.lat();
				// inf.longitude = latlng.lng();

		        // // Add one to the source collection
		        // sources_collection.sumUp('user', 'user', 'User ocss');

		        // Add the new point to the proper Group >> SourceCollection (data, type, query)
		        groups.sum(inf, 'user', 'user');

		        // Get alias and add it.
		        // var alias = sources_collection.find(function(m){
		        //   return m.get('type') == inf.geocat_kind &&  m.get('query') == inf.geocat_query
		        // }).get('alias');
		        // inf.geocat_alias = alias;

		        var marker = new GeoCATMarker(latlng, 'user', false, false, inf, map);
						bounds.extend(latlng);

						//Save occurence
						occurrences[inf.catalogue_id] = marker;
		        // Store action
						actions.Do('add', null, [marker.data]);

		        if (convex_hull.isVisible()) {
		          analysis_map.addPoint(marker);
		        }
			}



			/*============================================================================*/
			/* Put all (or only one) markers active or not. */
			/*============================================================================*/
			function makeActive (markers_id, fromAction) {

		        if (markers_id.length>0) {

		          if (convex_hull.isVisible()) {
		            // mamufasPolygon();
		            analysis_map.stop();
		          }


		          for (var i=0; i<markers_id.length; i++) {
		           var marker_id = markers_id[i].catalogue_id;
		           occurrences[marker_id].setActive(!occurrences[marker_id].data.geocat_active);
		            // Add or deduct the marker from _active_markers
		            if (!occurrences[marker_id].data.active) {
		              analysis_map.deductPoint(marker_id);
		            } else {
		              analysis_map.addPoint(occurrences[marker_id]);
		            }
		          }

		          //If the action doesnt come from the UnredoOperations object
		          if (!fromAction) {
		            actions.Do('active', null, markers_id);
		          }

		          if (convex_hull.isVisible()) {
		            $(document).trigger('occs_updated');
		          }
		        }
				sessionStorage.removeItem('toggleing_global');
			}



			/*============================================================================*/
			/* Put all (or only one) markers active or not. */
			/*============================================================================*/
			function hideAll(query,kind,active, cid) {
		        var hideMarkers = _.select(occurrences,
                function(element,key) {
                  return element.data.geocat_active!==active &&
                         element.data.scid === cid &&
                         !element.data.geocat_removed});
		        var hide_markers = [];

		        showMamufasMap();
		        asynHideMarker(query,kind,active);

		        if (convex_hull.isVisible()) {
		          // mamufasPolygon();
		          analysis_map.stop();
		        }

		        function asynHideMarker(query,kind,active) {
		          for (var i in hideMarkers) {
		            var _id = hideMarkers[i].data.catalogue_id;
		            occurrences[_id].setActive(active);
		            hide_markers.push(occurrences[_id].data);
		            delete hideMarkers[i];
		            break;
		          }

		          if (i==undefined) {
		            actions.Do('active', null, hide_markers);
		            hideMamufasMap(false);
		            if (convex_hull.isVisible()) {
		              $(document).trigger('occs_updated');
		            }
		            delete hideMarkers;
		          } else {
		            setTimeout(function(){asynHideMarker(query,kind,active)},0);
		          }
		        }
			}



			/*============================================================================*/
			/* Put all the markers with/without drag property.	 													*/
			/*============================================================================*/
			function activeMarkersProperties() {
			  _.each(occurrences, function(element){
  		    if (state=='add') {
            element.setClickable(false);
            element.setCursor('hand');
          } else {
            element.setCursor('pointer');
          }

          if (state=='remove') {
            element.setClickable(true);
          }

          if (state=='select') {
            element.setClickable(true);
            element.setDraggable(true);
          } else {
            element.setDraggable(false);
          }
			  });
			}



			/*============================================================================*/
			/* Set status of the application. 																						*/
			/*============================================================================*/
			function setStatus(status) {
			  state = status;

				$("div.left a.select").removeClass('selected');
				$("div.left a.add").removeClass('selected');
				$("div.left a.remove").removeClass('selected');
				$("div.left a.selection").removeClass('selected');
				$("div.left a."+status).addClass('selected');

        // Remove double click zoom when app is in 'add' status
        if (status != "add") {
				  map.setOptions({disableDoubleClickZoom:false});
				} else {
				  map.setOptions({disableDoubleClickZoom:true});
				}

        if (status == "selection") {
          map.setOptions({draggable:false});
        } else {
          map.setOptions({draggable:true});
        }

				//Remove selection tool addons
				google.maps.event.clearListeners(map, 'mousemove');
				removeSelectionPolygon();

				activeMarkersProperties();
			}



			/*============================================================================*/
			/* Search box.                     																						*/
			/*============================================================================*/
			function searchPlace() {
			  var address = $("#search_location_input").attr('value');
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.fitBounds(results[0].geometry.bounds);
          } else {
            $("span.search_not_found").stop().fadeIn().delay(2000).fadeOut();
          }
        });
			}



			/*============================================================================*/
			/* Close all floating map windows.                     												*/
			/*============================================================================*/
			function closeMapWindows() {
			  if (click_infowindow!=undefined) click_infowindow.hide();
  			if (delete_infowindow!=undefined) delete_infowindow.hide();
        if (edit_metadata!=undefined) edit_metadata.hide();
			}


