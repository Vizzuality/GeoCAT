
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				TotalPointsOperations => Class to control the number of points in the map.																				*/
	/*  																																																												*/
	/*==========================================================================================================================*/

		
			function TotalPointsOperations () {
				this.gbif = 0;
				this.flickr = 0;
				this.your = 0;
			}
			
			TotalPointsOperations.prototype = new Object();
			
			
			/*========================================================================================================================*/
			/* Add one point to the object depending on the kind. */
			/*========================================================================================================================*/
			TotalPointsOperations.prototype.add = function(kind) {
				switch(kind) {
					case 'gbif': 		this.gbif++;
													break;
					case 'flickr':  this.flickr++;
													break;
					default: 				this.your++;
				}
			}
			
			
			/*========================================================================================================================*/
			/* Deduct one point to the object depending on the kind. */
			/*========================================================================================================================*/
			TotalPointsOperations.prototype.deduct = function(kind) {
				switch(kind) {
					case 'gbif': 		this.gbif--;
													break;
					case 'flickr':  this.flickr--;
													break;
					default: 				this.your--;
				}
			}
			
			
			
			/*========================================================================================================================*/
			/* Get the total points of one kind. */
			/*========================================================================================================================*/
			TotalPointsOperations.prototype.get = function(kind) {
				switch(kind) {
					case 'gbif': 		return this.gbif;
													break;
					case 'flickr':  return this.flickr;
													break;
					default: 				return this.your;
				}
			}
			
			
			/*========================================================================================================================*/
			/* Get the total points of the object. */
			/*========================================================================================================================*/
			TotalPointsOperations.prototype.total = function() {
				return this.gbif + this.flickr + this.your;
			}
			
			