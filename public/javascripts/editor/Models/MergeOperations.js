
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*									MergeOperations => Operations with merging data between sources																					*/
			/*																types: 																																										*/
			/*																				Uploading																																					*/
			/*																				Importing																																					*/
			/*																				Refreshing																																				*/
			/*  																																																												*/
			/*==========================================================================================================================*/			


			function MergeOperations(sources) {
				this.gbif_points = [];
				this.flickr_points = [];
				this.sources = sources;
			}



			/*============================================================================*/
			/*  Check the sources points for merge later.																	*/
			/*============================================================================*/
			MergeOperations.prototype.checkSources = function() {
				if (this.sources.length>0) {
					var me = this;
					setTimeout(function(ev){
						me.requestPoints(0);
					},1000);
				}
			}
		

		
			/*============================================================================*/
			/*  Get the sources included in the tool.																			*/
			/*============================================================================*/
			MergeOperations.prototype.requestPoints = function(count) {
				var me = this;
				if (this.sources[count]=="your") {
					count++;
					try {
						if (this.sources[count]!=undefined) {
							me.requestPoints(count);
						}
					}
					catch (e) {
						activeMerge();
					}
				} else {
					var url = "/search/" + this.sources[count] + '/' + specie.replace(' ','+');
					$.getJSON(url,
							function(result){
								for (var i=0; i<result[0].points.length; i++) {
									if (_markers[result[0].points[i].catalogue_id]==undefined && _markers[result[0].points[i].catalogue_id]==null) {
										if (me.sources[count]=="gbif") {
											me.gbif_points.push(result[0].points[i]);
										} else {
											me.flickr_points.push(result[0].points[i]);
										}
									}
								}
								count++;
								try {
									if (this.sources[count]!=undefined) {
										me.requestPoints(count);
									}
								}
								catch (e) {
									activeMerge();
								}
							}
					);
				}
			}
			
			
			
			
			// addSourceToMap({points: merge_object.flickr_points, kind:'flickr'},true,false);
			