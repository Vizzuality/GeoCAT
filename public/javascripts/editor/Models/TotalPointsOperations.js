

		
			function TotalPointsOperations () {
				this.gbif = 0;
				this.flickr = 0;
				this.your = 0;
			}
			
			TotalPointsOperations.prototype.add = function(kind) {
				switch(kind) {
					case 'gbif': 		this.gbif++;
													break;
					case 'flickr':  this.flickr++;
													break;
					default: 				this.your++;
				}
			}
			
			TotalPointsOperations.prototype.deduct = function(kind) {
				switch(kind) {
					case 'gbif': 		this.gbif--;
													break;
					case 'flickr':  this.flickr--;
													break;
					default: 				this.your--;
				}
			}
			
			TotalPointsOperations.prototype.get = function(kind) {
				switch(kind) {
					case 'gbif': 		return this.gbif;
													break;
					case 'flickr':  return this.flickr;
													break;
					default: 				return this.your;
				}
			}
			
			TotalPointsOperations.prototype.total = function() {
				return this.gbif + this.flickr + this.your;
			}