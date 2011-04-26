
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
				this.source_points = [];
				this.sources = sources;
			}



			/*============================================================================*/
			/*  Check the sources points for merge later.																	*/
			/*============================================================================*/
			MergeOperations.prototype.checkSources = function() {
				if (this.sources.length>0) {
					var me = this;
					setTimeout(function(ev){
						me.requestPoints();
					},1000);
				}
			}
		

		
			/*============================================================================*/
			/*  Get the sources included in the tool.																			*/
			/*============================================================================*/
			MergeOperations.prototype.requestPoints = function() {
			  var me = this;
			  if (this.sources.length>0) {
			    var url = "/search/" + this.sources[0].kind + '/' + this.sources[0].query.replace(' ','+');
					$.getJSON(url,
					  function(result){
					    var species = {};
					    species.kind = result[0].name;
					    species.query = result[0].specie.replace('+',' ');
					    species.points = result[0].points;
					    me.source_points.push(species);
					    
					    me.sources = _.rest(me.sources);
					    me.requestPoints();
						}
					);
			  } else {
			    this.selectPoints();
			  }
			}
			
			
			
			/*============================================================================*/
			/*  Select the new points for each source                                     */
			/*============================================================================*/
			MergeOperations.prototype.selectPoints = function() {
			  var me = this;
			  _.each(this.source_points,function(source){
			    source.points = _.select(source.points, function(point){ return occurrences[point.catalogue_id]==undefined;});
			    if (source.points.length>0) {
			      me.activateMerge(source.query,source.kind);
			    }
			  });
			  
			  this.source_points = _.select(this.source_points, function(source){ return source.points.length>0;});
			}
			
			
			
			/*============================================================================*/
			/*  Active the sources in the list                                            */
			/*============================================================================*/
			MergeOperations.prototype.activateMerge = function(query,kind) {
        $('ul#sources_list li[species="'+query+'"][type="'+kind+'"] ').animate({boxShadow: '0 0 10px #666666'},500);
        $('ul#sources_list li[species="'+query+'"][type="'+kind+'"] ').delay(500).animate({boxShadow: '0 0 0 #1e2022'},500,function(){
          $(this).css('box-shadow','none').css('-webkit-box-shadow','none').css('-moz-box-shadow','none');
        });
        $('ul#sources_list li[species="'+query+'"][type="'+kind+'"] a.merge_specie').addClass('update');
        $('ul#sources_list li[species="'+query+'"][type="'+kind+'"] a.merge_specie').bind('click',function(){
          openMergeContainer(query,kind);
        });
			}
			
			
			
			function mergeSource(query,kind) {
			  $('div.merge_container').fadeOut();
			  $('ul#sources_list li[species="'+query+'"][type="'+kind+'"] a.merge_specie').removeClass('update').unbind('click');
			  _.each(merge_object.source_points,function(element){
			    if (element.kind == kind && element.query == query) {
			      addSourceToMap(element,true,true);
			      return;
			    }
			  });
			}
			

			
			
			