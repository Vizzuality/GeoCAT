
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				PointsOperations => Class to control the number of points in the map.             																*/
	/*  																																																												*/
	/*==========================================================================================================================*/

		
			function PointsOperations() {
				
				//jScrollpane & sortable
        $('ul#sources_list').jScrollPane({autoReinitialise:true});
        $('ul#sources_list').sortable({revert:false, items: 'li', cursor:'pointer'});
        $('ul#sources_list').disableSelection();
				
				
				/*Hash array with all sources*/
				this.sources = [];
				this.total = 0;
				
				
				
				/*============================================================================*/
				/* Add one point to the object depending on the specie. 											*/
				/*============================================================================*/
				PointsOperations.prototype.add = function(query,kind) {
				  if (this.sources[query+'_'+kind]==undefined || this.sources[query+'_'+kind]==0) {
					  this.total = this.total + 1;
					  this.sources[query+'_'+kind] = 0;
				  }
				  
					this.sources[query+'_'+kind] = this.sources[query+'_'+kind]+1;
					
					// Print the correct observations
					this.addSpecieList(query,kind);
					this.calculateMapSpecies();
				}


				/*============================================================================*/
				/* Deduct one point to the object depending on the specie. */
				/*============================================================================*/
				PointsOperations.prototype.deduct = function(query,kind) {
				  if (this.sources[query+'_'+kind]!=undefined) {
					  this.sources[query+'_'+kind] = this.sources[query+'_'+kind]-1;
					}
					
					if (this.sources[query+'_'+kind]==0) {
					  this.total = this.total - 1;
					}
					
					// Print the correct observations
				  this.removeSpecieList(query, kind);
				  this.calculateMapSpecies();
				}



				/*============================================================================*/
				/* Get the total points of one specie. 																				*/
				/*============================================================================*/
				PointsOperations.prototype.get = function(query,kind) {
					return this.sources[query+'_'+kind];
				}


				/*============================================================================*/
				/* Get the total points of the object. 																				*/
				/*============================================================================*/
				PointsOperations.prototype.total = function() {
					return this.total;
				}
				
				

				/*============================================================================*/
				/* Calculate number of points in the map, and show in the sources container.	*/
				/*============================================================================*/
				PointsOperations.prototype.calculateMapSpecies = function() {
					$('div.sources span h3').text(this.total + ' SPECIES IN YOUR ASSESSMENT');
				}



				/*============================================================================*/
				/* Add the source to the list if it doesn't exist. 														*/
				/*============================================================================*/
				PointsOperations.prototype.addSpecieList = function(query,kind) {
				  var me = this;
				  
				  var kind_class,kind_name;
			    if (kind == "gbif") {
			      kind_class = "green";
			      kind_name = "GBIF";
			    } else if (kind == "flickr") {
			      kind_class = "pink";
			      kind_name = "Flickr";
			    } else {
			      kind_class = "blue";
			      kind_name = "User";
			    }
				  
				  
				  if ($('ul#sources_list li[species="'+query+'"][type="'+kind+'"]').length>0) {
				    $('li[species="'+query+'"][type="'+kind+'"] span.points p').text(me.sources[query+'_'+kind]+' '+kind_name+' '+((me.sources[query+'_'+kind]>1)?'points':'point'));
				  } else {
				    var api =  $('ul#sources_list').data('jsp');
      		  api.getContentPane().prepend(
      		            '<li species="'+query+'" type="'+kind+'">'+
                        '<span class="'+kind_class+'"></span>'+
                        '<h3>'+((kind=="user")?"User occs":query)+'</h3>'+
                        '<a class="visible_specie on"></a>'+
                        '<span class="points">'+
                          '<p>'+me.sources[query+'_'+kind]+' '+kind_name+' '+((me.sources[query+'_'+kind]>1)?'points':'point')+'</p>'+
                          '<a class="merge_specie"></a>'+
                          '<a class="delete_specie"></a>'+
                        '</span>'+
                      '</li>');
      		  api.reinitialise();
				  }
				  
				}
				
				
				/*============================================================================*/
				/* Remove the specie to the list if it doesn't exist. 												*/
				/*============================================================================*/
				PointsOperations.prototype.removeSpecieList = function(query,kind) {
          var kind_class,kind_name;
			    if (kind == "gbif") {
			      kind_class = "green";
			      kind_name = "GBIF";
			    } else if (kind == "flickr") {
			      kind_class = "pink";
			      kind_name = "Flickr";
			    } else {
			      kind_class = "blue";
			      kind_name = "User";
			    }
          
          if (this.sources[query+'_'+kind]==0) {
            var api =  $('ul#sources_list').data('jsp');
      		  api.getContentPane().children('li[species="'+query+'"][type="'+kind+'"]').remove();
      		  api.reinitialise();
          } else {
            $('li[species="'+query+'"][type="'+kind+'"] span.points p').text(this.sources[query+'_'+kind]+' '+kind_name+' '+((this.sources[query+'_'+kind]>1)?'points':'point'));
          }
				}
			}
			
			PointsOperations.prototype = new Object();