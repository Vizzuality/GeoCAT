
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				PointsOperations => Class to control the number of points in the map.             																*/
	/*  																																																												*/
	/*==========================================================================================================================*/

		
			function PointsOperations () {
				
				//jScrollpane & sortable
        $('ul#sources_list').jScrollPane({autoReinitialise:true});
        $('ul#sources_list').sortable({revert:true,items: 'li'});
        $('ul#sources_list').disableSelection();
				
				
				/*Hash array with all sources*/
				this.sources = [];
				this.total = 0;
				
				
				
				/*============================================================================*/
				/* Add one point to the object depending on the specie. 											*/
				/*============================================================================*/
				PointsOperations.prototype.add = function(query,kind) {
					
					if (this.sources[query]!=undefined) {
					  this.sources[query] = this.sources[query]+1;
					} else {
					  this.sources[query] = 1;
					  this.total = this.total + 1;
					}
					
					// Print the correct observations
					this.addSpecieList(query,kind);
					this.calculateMapSpecies();
				}


				/*============================================================================*/
				/* Deduct one point to the object depending on the specie. */
				/*============================================================================*/
				PointsOperations.prototype.deduct = function(query,kind) {
					if (this.sources[query]!=undefined) {
					  this.sources[query] = this.sources[query]-1;
					}
					
					if (this.sources[query]==0) {
					  this.total = this.total - 1;
					}
					
					// Print the correct observations
				  this.removeSpecieList(query, specie);
				  this.calculateMapSpecies();
				}



				/*============================================================================*/
				/* Get the total points of one specie. 																				*/
				/*============================================================================*/
				PointsOperations.prototype.get = function(query) {
					return this.sources[query];
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
					$('div.sources span H3').text( this.total + ' ' + ((this.total<2)?'OCC':'OCCS') + ' IN YOUR ASSESSMENT');
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
				  
				  
				  if ($('ul#sources_list li[specie="'+query+'"]').length>0) {
				    $('li[specie="'+query+'"] span.points p').text(me.sources[query]+' '+kind_name+' '+((me.sources[query]>1)?'points':'point'));
				  } else {
				    var api =  $('ul#sources_list').data('jsp');
      		  api.getContentPane().prepend(
      		            '<li specie="'+query+'">'+
                        '<span class="'+kind_class+'"></span>'+
                        '<h3>'+((query=="user")?"User occs":query)+'</h3>'+
                        '<a class="visible_specie on"></a>'+
                        '<span class="points">'+
                          '<p>'+me.sources[query]+' '+kind_name+' '+((me.sources[query]>1)?'points':'point')+'</p>'+
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
          
          if (this.sources[query]==0) {
            var api =  $('ul#sources_list').data('jsp');
      		  api.getContentPane().children('li[specie="'+query+'"]').remove();
      		  api.reinitialise();
          } else {
            $('li[specie="'+query+'"] span.points p').text(me.sources[query]+' '+kind_name+' '+((me.sources[query]>1)?'points':'point'));
          }
				}
			}
			
			PointsOperations.prototype = new Object();