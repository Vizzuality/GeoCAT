
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
				
				
				/* Binding events of DOM elements related to UnredoOperations  */
				
				//Undo-redo action fade when rollout bottom zone
				$("div.footer").hover(function(ev){},
					function(ev){
						$("#action_info").fadeTo(500,0);
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
					changeAppToSave(0);
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
							case 'remove': 	removeMarkersfromAction(actions_data);
															$('#action_info span').text('Removed ' + actions_count + ((actions_count==1)?' point':' points'));
															break;
							case 'add': 		addMarkersfromAction(actions_data);
															$('#action_info span').text('Added ' + actions_count + ((actions_count==1)?' point':' points'));
															break;	
							case 'move': 		moveMarkerfromAction(actions_data[0].catalogue_id,actions_data[0].new_.latlng);
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
						changeAppToSave(0);
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
							case 'remove': 	addMarkersfromAction(actions_data);
															$('#action_info span').text('Added ' + actions_count + ((actions_count==1)?' point':' points'));
															break;
							case 'add': 		removeMarkersfromAction(actions_data);
															$('#action_info span').text('Removed ' + actions_count + ((actions_count==1)?' point':' points'));
															break;
							case 'move': 		moveMarkerfromAction(actions_data[0].catalogue_id,actions_data[0].old_.latlng);
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
						changeAppToSave(0);
					} else {
						$('#action_info span').text("There aren't more actions to undo");
					}
					$('#action_info').stop(true).fadeTo(200,1);
				}

			}
			
			
			
			
			
			
			
			/*======================================================================*/
			/* Undo action.	 																												*/
			/*======================================================================*/
			function unDoAction() {
				actions.Undo();
				changeApplicationTo(0);
			}


			/*======================================================================*/
			/* Redo action.	 																												*/
			/*======================================================================*/
			function reDoAction() {
				actions.Redo();
				changeApplicationTo(0);
			}


			/*========================================================================================================================*/
			/* Remove markers from an action performed.	 */
			/*========================================================================================================================*/
			function removeMarkersfromAction(restore_info) {
				showMamufasMap();
				_information = restore_info;
				removeMarkersfromActionAsync(0);
			}


			/*========================================================================================================================*/
			/* Recursive function for remove markers.	 */
			/*========================================================================================================================*/
			function removeMarkersfromActionAsync(count) {
				if (_information.length>count) {
					_markers[_information[count].catalogue_id].data.removed = true;
					_markers[_information[count].catalogue_id].setMap(null);
					total_points.deduct(_information[count].new_.kind);
					if (convex_hull.isVisible()) {
						convex_hull.deductPoint(_information[count].catalogue_id);
					}
					count = count+1;
					setTimeout("removeMarkersfromActionAsync("+count+")",0);
				} else {
					hideMamufasMap(false);
				}
			}



			/*========================================================================================================================*/
			/* Add markers from an action performed.	 */
			/*========================================================================================================================*/		
			function addMarkersfromAction(restore_info) {
					showMamufasMap();
					_information = restore_info;
					addMarkersfromActionAsync(0);
			}



			/*========================================================================================================================*/
			/* Recursive function for add markers.	 */
			/*========================================================================================================================*/
			function addMarkersfromActionAsync(count) {
				if (_information.length>count) {
					_markers[_information[count].catalogue_id].data.removed = false;
					_markers[_information[count].catalogue_id].setMap(map);
					total_points.add(_information[count].new_.kind);
					if (convex_hull.isVisible()) {
						convex_hull.addPoint(_markers[_information[count].catalogue_id]);
					}
					count = count+1;
					setTimeout("addMarkersfromActionAsync("+count+")",0);
				} else {
					hideMamufasMap(false);
				}
			}


			/*========================================================================================================================*/
			/* Move marker from previous action performed.	 */
			/*========================================================================================================================*/
			function moveMarkerfromAction(marker_id, latlng) {
				_markers[marker_id].data.longitude = latlng.c;
				_markers[marker_id].data.latitude = latlng.b;
				_markers[marker_id].setPosition(latlng);
				if (convex_hull.isVisible()) {
					convex_hull.calculateConvexHull();
				}
			}
			
			