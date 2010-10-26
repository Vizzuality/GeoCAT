
			/* kind: type of action -> Edit || Remove || Add */
				/*	Remove: marker_id, data */
				/*	Add: marker_id, data */
				/*	Edit:  Marker_id, what, new_value */

			function UnredoOperations () {
				this.position = 0;
				this.actions = new Array();
			}
			
			
			
			UnredoOperations.prototype.Do = function(kind,prev_data,new_data) {
				var obj = new Object();
				var data_obj;
				obj.kind = kind;
				obj.data = [];
				
				
				//add all the points changed
				if (new_data!=null) {
					for (var i=0; i<new_data.length; i++) {
						data_obj = new Object();
						data_obj.marker_id = new_data[i].catalogue_id;
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
			}
			
			
			
			
			UnredoOperations.prototype.Redo = function() {
				if (this.actions.length!=this.position) {
					switch(this.actions[this.position].kind) {
						case 'remove': 	removeMarkersfromAction(this.actions[this.position].data);
														$('#action_info span').text('Removed ' + this.actions[this.position].data.length + ((this.actions[this.position].data.length==1)?' point':' points'));
														break;
						case 'add': 		addMarkersfromAction(this.actions[this.position].data);
														$('#action_info span').text('Added ' + this.actions[this.position].data.length + ((this.actions[this.position].data.length==1)?' point':' points'));
														break;	
						case 'move': 		moveMarkerfromAction(this.actions[this.position].data[0].marker_id,this.actions[this.position].data[0].new_.latlng);
														$('#action_info span').text('Moved point to ('+this.actions[this.position].data[0].new_.latlng.b+','+this.actions[this.position].data[0].new_.latlng.c+')');
														break;
						case 'active':  makeActive(this.actions[this.position].data,true);
														if (this.actions[this.position].data.length==1) {
															$('#action_info span').text('The point is '+((this.actions[this.position].data[0].new_.active)?'active':'no active')+' now');
														} else {
															$('#action_info span').text(this.actions[this.position].data.length+' points are '+((this.actions[this.position].data[0].new_.active)?'active':'no active')+' now');
														}
														break;
						default: 				null;
					}
					this.position++;
				}	else {
					$('#action_info span').text('There are no actions to redo');
				}
				$('#action_info').stop(true).fadeTo(200,1);
			}
			
			
			
			
			UnredoOperations.prototype.Undo = function() {
				if (this.position!=0) {
					this.position--;
					
					switch(this.actions[this.position].kind) {
						case 'remove': 	addMarkersfromAction(this.actions[this.position].data);
														$('#action_info span').text('Added ' + this.actions[this.position].data.length + ((this.actions[this.position].data.length==1)?' point':' points'));
														break;
						case 'add': 		removeMarkersfromAction(this.actions[this.position].data);
														$('#action_info span').text('Removed ' + this.actions[this.position].data.length + ((this.actions[this.position].data.length==1)?' point':' points'));
														break;
						case 'move': 		moveMarkerfromAction(this.actions[this.position].data[0].marker_id,this.actions[this.position].data[0].old_.latlng);
														$('#action_info span').text('Returned point to ('+this.actions[this.position].data[0].old_.latlng.b+','+this.actions[this.position].data[0].old_.latlng.c+')');
														break;
						case 'active': 	makeActive(this.actions[this.position].data,true);
														if (this.actions[this.position].data.length==1) {
															$('#action_info span').text('The point is '+((!this.actions[this.position].data[0].new_.active)?'active':'no active')+' now');
														} else {
															$('#action_info span').text(this.actions[this.position].data.length+' points are '+((!this.actions[this.position].data[0].new_.active)?'active':'no active')+' now');
														}
														break;			
						default: 				null;
					}
				} else {
					$('#action_info span').text('There are no actions to undo');
				}
				$('#action_info').stop(true).fadeTo(200,1);
			}
			
			
			
			
			UnredoOperations.prototype.now = function() {
				console.log('position: ' + this.position);
				console.log('actions: ');
				console.log(this.actions);
			}