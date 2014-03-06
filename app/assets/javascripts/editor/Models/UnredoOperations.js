
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*							UnredoOperations => Class to perform undo-redo actions.																											*/
			/*																																																													*/
			/*											(*Kind of acions: ADD, REMOVE, MOVE, VISIBLE, EDIT*)																								*/	
			/*  																																																												*/
			/*==========================================================================================================================*/


			function UnredoOperations () {
				this.position = 0;
				this.actions = new Array();
				var me = this;
				
				/* Binding events of DOM elements related to UnredoOperations  */
				//Undo-redo action fade when rollout bottom zone
				$("div.footer").hover(function(ev){},
					function(ev){
						$("#action_info").fadeTo(500,0);
				});
				
				// Undo action.
				$('a.undo').click(function(){me.Undo();});

				// Redo action.
				$('a.redo').click(function() {me.Redo();});
			}


			// New un-redo operations when reduction process
			// is running

			_.extend(UnredoOperations.prototype, {

				// start reduction analysis,
				// store last actions and clean it
				startReduction: function() {
					this.old = {
						position: this.position,
						actions: 	_.clone(this.actions)
					};

					this.position = 0;
					this.actions = [];
				},

				// discard last changes and back to original
				discardReduction: function() {
					// Show mamufas
					showMamufasMap();

					// Loop through reduction actions until position specified
					for (var i = (this.position - 1); i >= 0; i--) {
						var d = this.actions[i].data;
						var k = this.actions[i].kind;

						switch(k) {
							case 'remove': 	this.restoreMarkers(d); break;
							case 'add': 		this.removeMarkers(d); break;
							case 'move': 		this.moveMarker(d[0].catalogue_id,d[0].old_.latlng); break;
	            case 'edit': 		this.changeData(d[0].catalogue_id,d[0].old_.info); break;
							case 'active': 	makeActive(d,true); break;
							default:
						}
					}

					// Reset to original values
					this.position = this.old.position;
					this.actions = this.old.actions; 
					delete this.old;

					// Update analysis
					$(document).trigger('occs_updated');

					// Hide mamufas
					hideMamufasMap(false);
				},

				// apply changes, concat actions
				applyReduction: function() {
					// Get old history up to old position :D
					var old_actions = this.old.actions.slice(0,this.old.position);
					// Concat old + new
					this.actions = old_actions.concat(this.actions);
					// All past actions length + new position! Sum old position
					// + new position is an error because old position could be
					// 0, n or (n/2) :S
					this.position = this.old.position + this.position; 

					delete this.old;
				}

			});
			
			
			
			/*======================================================================*/
			/* Function so save the performed action in the actions Array. 					*/
			/*======================================================================*/
			UnredoOperations.prototype.Do = function(kind,prev_data,new_data) {

				var obj = new Object();
				var data_obj;
				obj.kind = kind;
				obj.data = [];

				//add all the points changed
				if (new_data!=null) {
					for (var i=0; i<new_data.length; i++) {
						data_obj = new Object();
						data_obj.catalogue_id = new_data[i].catalogue_id;
						data_obj.new_ = new_data[i];
						if (prev_data!=null) {
							data_obj.old_ = prev_data[i];
						}
						obj.data.push(data_obj);
					}
				}

				//New action, delete next actions made before
				if (this.position<(this.actions.length-1)) {
					this.actions.splice(this.position,this.actions.length-this.position);
				}

				//Add new action to actions array and change one position
				this.actions[this.position] = obj;
				this.position++;

				//Change application to unsave - new action
				changeApplicationTo(1);
			}



			/*======================================================================*/
			/* Redo function. 																											*/
			/*======================================================================*/
			UnredoOperations.prototype.Redo = function() {
				if (this.actions.length!=this.position) {

					var actions_data = this.actions[this.position].data;
					var actions_count = this.actions[this.position].data.length;
					var actions_kind = this.actions[this.position].kind;

					switch(actions_kind) {
						case 'remove': 	this.removeMarkers(actions_data);
														$('#action_info span').text('Removed ' + actions_count + ((actions_count==1)?' point':' points'));
														break;
						case 'add': 		this.restoreMarkers(actions_data);
														$('#action_info span').text('Added ' + actions_count + ((actions_count==1)?' point':' points'));
														break;	
						case 'move': 		this.moveMarker(actions_data[0].catalogue_id,actions_data[0].new_.latlng);
														$('#action_info span').text('Moved point to ('+actions_data[0].new_.latlng.lat().toFixed(2)+','+actions_data[0].new_.latlng.lng().toFixed(2)+')');
														break;
  					case 'edit': 	  this.changeData(actions_data[0].catalogue_id,actions_data[0].new_.info);
  													$('#action_info span').text('Edition restored');
  													break;
						case 'active':  makeActive(actions_data,true);
														if (actions_count==1) {
															$('#action_info span').text('The point is '+((actions_data[0].new_.geocat_active)?'active':'no active')+' now');
														} else {
															$('#action_info span').text(actions_count+' points are '+((actions_data[0].new_.geocat_active)?'active':'no active')+' now');
														}
														break;
						default: 				null;
					}
					this.position++;
					changeApplicationTo(1);
				}	else {
					$('#action_info span').text("There aren't more actions to redo");
				}
				$('#action_info').stop(true).fadeTo(200,1);
			}



			/*======================================================================*/
			/* Undo function. 																											*/
			/*======================================================================*/
			UnredoOperations.prototype.Undo = function() {
				if (this.position!=0) {
					this.position--;
          
					var actions_data = this.actions[this.position].data;
					var actions_count = this.actions[this.position].data.length;
					var actions_kind = this.actions[this.position].kind;
					
					switch(actions_kind) {
						case 'remove': 	this.restoreMarkers(actions_data);
														$('#action_info span').text('Added ' + actions_count + ((actions_count==1)?' point':' points'));
														break;
						case 'add': 		this.removeMarkers(actions_data);
														$('#action_info span').text('Removed ' + actions_count + ((actions_count==1)?' point':' points'));
														break;
						case 'move': 		this.moveMarker(actions_data[0].catalogue_id,actions_data[0].old_.latlng);
														$('#action_info span').text('Returned point to ('+actions_data[0].old_.latlng.lat().toFixed(2)+','+actions_data[0].old_.latlng.lng().toFixed(2)+')');
														break;
            case 'edit': 		this.changeData(actions_data[0].catalogue_id,actions_data[0].old_.info);
  													$('#action_info span').text('Edition undone');	
  													break;		
						case 'active': 	makeActive(actions_data,true);
														if (actions_count==1) {
															$('#action_info span').text('The point is '+((actions_data[0].new_.geocat_active)?'no active':'active')+' now');
														} else {
															$('#action_info span').text(actions_count+' points are '+((!actions_data[0].new_.geocat_active)?'no active':'active')+' now');
														}
														break;			
						default: 				null;
					}
					changeApplicationTo(1);
				} else {
					$('#action_info span').text("There aren't more actions to undo");
				}
				$('#action_info').stop(true).fadeTo(200,1);
			}
			
			
			/*======================================================================*/
			/* Add markers from an action performed.																*/
			/*======================================================================*/
			UnredoOperations.prototype.restoreMarkers = function(restore_info) {
			  
			  this.hideAllOverlays();
			  if (convex_hull.isVisible()) {
          // mamufasPolygon();
          analysis_map.stop();
        }

        // Remove spiderfy!
  			oms.unspiderfy();

				// Recursive function for add markers.
				function AsynRestoreMarkers(count, observations_data) {
					if (observations_data.length>count) {
						occurrences[observations_data[count].catalogue_id].data.geocat_removed = false;
						occurrences[observations_data[count].catalogue_id].setMap(map);

						// points.add(occurrences[observations_data[count].catalogue_id].data.geocat_query,occurrences[observations_data[count].catalogue_id].data.geocat_kind);
						var query = occurrences[observations_data[count].catalogue_id].data.geocat_query;
						var type = occurrences[observations_data[count].catalogue_id].data.geocat_kind;
						var alias = occurrences[observations_data[count].catalogue_id].data.geocat_alias;
						sources_collection.sumUp(query, type, alias);

						count = count+1;
						setTimeout(function(){AsynRestoreMarkers(count, observations_data);},0);
					} else {
					  if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
						hideMamufasMap(false);
					}
				}

				if (restore_info.length>20) {
					showMamufasMap();
				}
				
				AsynRestoreMarkers(0, restore_info);
			}
			
			
			
			
			
			/*======================================================================*/
			/* Move marker from previous action performed.													*/
			/*======================================================================*/
			UnredoOperations.prototype.moveMarker = function(marker_id, latlng) {
			  
			  this.hideAllOverlays();
			  
				occurrences[marker_id].data.longitude = latlng.lng();
				occurrences[marker_id].data.latitude = latlng.lat();
				occurrences[marker_id].setPosition(latlng);

				// Remove spiderfy!
			  oms.unspiderfy();

				if (convex_hull.isVisible()) {
					$(document).trigger('occs_updated');
				}
			}
			
			
			
			/*======================================================================*/
			/* Change occurence data.                     .													*/
			/*======================================================================*/
			UnredoOperations.prototype.changeData = function(marker_id, data_) {
				occurrences[marker_id].setPosition(new google.maps.LatLng(data_.latitude, data_.longitude));
				occurrences[marker_id].data = data_;
				this.hideAllOverlays();
			}
			
			
			
			
			/*======================================================================*/
			/* Hide all overlays.                     .													*/
			/*======================================================================*/
			UnredoOperations.prototype.hideAllOverlays = function(marker_id, data_) {
			  if (click_infowindow!=undefined)
			    click_infowindow.hide();
  			if (delete_infowindow!=undefined)
  			  delete_infowindow.hide();
        if (edit_metadata!=undefined)
          edit_metadata.hide();
			}
			
			
			
			
			
			/*======================================================================*/
			/* Remove markers from an action performed.															*/
			/*======================================================================*/
			UnredoOperations.prototype.removeMarkers = function(restore_info) {
				
				this.hideAllOverlays();
				if (convex_hull.isVisible()) {
          // mamufasPolygon();
          analysis_map.stop();
        }

				// Remove spiderfy!
			  oms.unspiderfy();
				
				// Recursive function for remove markers.
				function AsynRemoveMarkers(count, observations_data) {
					if (observations_data.length>count) {
						occurrences[observations_data[count].catalogue_id].data.geocat_removed = true;
						occurrences[observations_data[count].catalogue_id].setMap(null);
						
						// points.deduct(observations_data[count].new_.geocat_query,observations_data[count].new_.geocat_kind);
						var query = observations_data[count].new_.geocat_query;
						var type = observations_data[count].new_.geocat_kind;
						sources_collection.deduct(query, type);

						count = count+1;
						setTimeout(function(){AsynRemoveMarkers(count,observations_data);},0);
					} else {
					  if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
						hideMamufasMap(false);
					}
				}
				
				if (restore_info.length>20) {
					showMamufasMap();
				}
				AsynRemoveMarkers(0, restore_info);
			}