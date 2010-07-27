
			/* kind: type of action -> Edit || Remove || Show-Hide */
				/*	Remove: marker_id */
				/*	Show-Hide: marker_id */
				/*	Edit:  Marker_id, what, new_value */

			function UnredoOperations () {
				this.position = 0;
				this.actions = [];
			}
			
			
			
			UnredoOperations.prototype.Do = function(kind,marker_id,data) {
				var obj = new Object();
				obj.kind = kind;
				obj.marker_id = marker_id;
				obj.inf = data;
				this.actions.push(obj);
				this.position++;
			}
			
			
			UnredoOperations.prototype.Redo = function() {
				this.position++;
			}
			
			
			UnredoOperations.prototype.Undo = function() {
				if (this.position!=0) {
					this.position--;
					switch(this.actions[this.position].kind) {
						case 'add': 		removeMarker(this.actions[this.position].marker_id,true);
														break;
						case 'edit': 		
														break;
						case 'hide': 		makeActive(this.actions[this.position].marker_id,true);
														break;						
						case 'show': 		makeActive(this.actions[this.position].marker_id,true);
														break;						
						case 'remove': 	addMarker(this.actions[this.position].marker_id,null,true);
														break;						
						default: 				null;
						
						
					}
				}
			}