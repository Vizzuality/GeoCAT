
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
														$('#action_info span').text('Moved point to ('+actions_data[0].new_.latlng.lat()+','+actions_data[0].new_.latlng.lng()+')');
														break;
						case 'active':  makeActive(actions_data,true);
														if (actions_count==1) {
															$('#action_info span').text('The point is '+((actions_data[0].new_.active)?'active':'no active')+' now');
														} else {
															$('#action_info span').text(actions_count+' points are '+((actions_data[0].new_.active)?'active':'no active')+' now');
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
														$('#action_info span').text('Returned point to ('+actions_data[0].old_.latlng.lat()+','+actions_data[0].old_.latlng.lng()+')');
														break;
						case 'active': 	makeActive(actions_data,true);
														if (actions_count==1) {
															$('#action_info span').text('The point is '+((actions_data[0].new_.active)?'no active':'active')+' now');
														} else {
															$('#action_info span').text(actions_count+' points are '+((!actions_data[0].new_.active)?'no active':'active')+' now');
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

					// Recursive function for add markers.
					function AsynRestoreMarkers(count, observations_data) {
						if (observations_data.length>count) {
							_markers[observations_data[count].catalogue_id].data.removed = false;
							_markers[observations_data[count].catalogue_id].setMap(map);
							total_points.add(observations_data[count].new_.kind);
							if (convex_hull.isVisible()) {
								convex_hull.addPoint(_markers[observations_data[count].catalogue_id]);
							}
							count = count+1;
							setTimeout(function(){
								AsynRestoreMarkers(count, observations_data);
							},0);
						} else {
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
				_markers[marker_id].data.longitude = latlng.c;
				_markers[marker_id].data.latitude = latlng.b;
				_markers[marker_id].setPosition(latlng);
				if (convex_hull.isVisible()) {
					convex_hull.calculateConvexHull(false);
				}
			}
			
			
			
			
			/*======================================================================*/
			/* Remove markers from an action performed.															*/
			/*======================================================================*/
			UnredoOperations.prototype.removeMarkers = function(restore_info) {
				
				// Recursive function for remove markers.
				function AsynRemoveMarkers(count, observations_data) {
					if (observations_data.length>count) {
						_markers[observations_data[count].catalogue_id].data.removed = true;
						_markers[observations_data[count].catalogue_id].setMap(null);
						total_points.deduct(observations_data[count].new_.kind);
						if (convex_hull.isVisible()) {
							convex_hull.deductPoint(observations_data[count].catalogue_id);
						}
						count = count+1;
						setTimeout(function(){
							AsynRemoveMarkers(count,observations_data);
						},0);
					} else {
						hideMamufasMap(false);
					}
				}
				
				if (restore_info.length>20) {
					showMamufasMap();
				}
				AsynRemoveMarkers(0, restore_info);
			}