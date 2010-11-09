
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				TotalPointsOperations => Class to control the number of points in the map.																				*/
	/*  																																																												*/
	/*==========================================================================================================================*/

		
			function TotalPointsOperations () {
				this.gbif = 0;
				this.flickr = 0;
				this.your = 0;
				
				
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
					
					// Print the correct observations
					this.addSourceToList(kind);
					this.calculateSourcePoints(kind);
					this.calculateMapPoints();
					this.resizeBarPoints();
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
					
					// Print the correct observations
					this.calculateSourcePoints(kind);
					this.calculateMapPoints();
					this.resizeBarPoints();
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
				
				

				/*============================================================================*/
				/* Calculate number of points in the map, and show in the sources container.	*/
				/*============================================================================*/
				TotalPointsOperations.prototype.calculateMapPoints = function() {
					$('div.sources span p.count_points').text( this.total() + ' POINTS');
				}



				/*============================================================================*/
				/* Calculate number of points for each source. 																*/
				/*============================================================================*/
				TotalPointsOperations.prototype.calculateSourcePoints = function(kind) {
					switch (kind) {
						case 'gbif': 		$('#GBIF_points span').text('GBIF Points ('+ this.get(kind) +')');
														break;
						case 'flickr': 	$('#Flickr_points span').text('Flickr Points ('+ this.get(kind) +')');
														break;
						default: 				$('#our_points span').text('Your Points ('+ this.get(kind) +')');
					}
				}



				/*============================================================================*/
				/* Create different bars depending on number of points of each sources. 			*/
				/*============================================================================*/
				TotalPointsOperations.prototype.resizeBarPoints = function() {
					var me = this;
					
					if (me.get('flickr')!=0) {
						if ((((205*me.get('flickr'))/me.total())-217)<(-204)) {
							$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position','-204px 0');
						} else {
							$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position',((205*me.get('flickr'))/me.total()) - 217+ 'px 0');
						}				
						$('div#editor div#tools div.center div.right div.sources a.pink span').hover(function(ev){
							$(this).css('background-position','right 0');
						}, function(ev){
							if ((((205*me.get('flickr'))/me.total())-217)<(-204)) {
								$(this).css('background-position','-204px 0');
							} else {
								$(this).css('background-position',((205*me.get('flickr'))/me.total()) - 217+ 'px 0');
							}				
						});
					} else {
						$('div.sources ul li a.pink').parent().remove();
					}



					if (me.get('gbif')!=0) {
						if ((((205*me.get('gbif'))/me.total())-217)<(-204)) {
							$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position','-204px 0');
						} else {
							$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position',((205*me.get('gbif'))/me.total()) - 217+ 'px 0');
						}
						$('div#editor div#tools div.center div.right div.sources a.green span').hover(function(ev){
							$(this).css('background-position','right 0');
						}, function(ev){
							if ((((205*me.get('gbif'))/me.total())-217)<(-204)) {
								$(this).css('background-position','-204px 0');
							} else {
								$(this).css('background-position',((205*me.get('gbif'))/me.total()) - 217+ 'px 0');
							}				
						});
					} else {
						$('div.sources ul li a.green').parent().remove();
					}



					if (me.get('your')!=0) {
						if ((((205*me.get('your'))/me.total())-217)<(-204)) {
							$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position','-204px 0');
						} else {
							$('div#editor div#tools div.center div.right div.sources a.blue span').css('background-position',((205*me.get('your'))/me.total()) - 217+ 'px 0');
						}
						$('div#editor div#tools div.center div.right div.sources a.blue span').hover(function(ev){
							$(this).css('background-position','right 0');
						}, function(ev){
							if ((((205*me.get('your'))/me.total())-217)<(-204)) {
								$(this).css('background-position','-204px 0');
							} else {
								$(this).css('background-position',((205*me.get('your'))/me.total()) - 217+ 'px 0');
							}				
						});
					} else {
						$('div.sources ul li a.blue').parent().remove();
					}
				}
			
			
				
				
				/*============================================================================*/
				/* Add the source to the list if it doesn't exist. 														*/
				/*============================================================================*/
				TotalPointsOperations.prototype.addSourceToList = function(kind) {
					switch (kind) {
						case 'gbif': 		if (!$('#GBIF_points').length) {
															$('div.sources ul#sources_list').append('<li><a class="green" id="GBIF_points"><span> GBIF Points ('+ this.get(kind) +')</span></a><a onclick="openDeleteAll(\'green\')" class="delete_all"></a><a class="merge"></a></li>');
														}
														break;
						case 'flickr': 	if (!$('#Flickr_points').length) {
															$('div.sources ul#sources_list').append('<li><a class="pink" id="Flickr_points"><span> Flickr Points ('+ this.get(kind) +')</span></a><a onclick="openDeleteAll(\'pink\')" class="delete_all"></a><a class="merge"></a></li>');
														}
														break;
						default: 				if (!$('#our_points').length) {
															$('div.sources ul#sources_list').append('<li><a class="blue" id="our_points"><span> Your Points ('+ this.get(kind) +')</span></a><a onclick="openDeleteAll(\'blue\')" class="delete_all"></a><a class="merge"></a></li>');
														}
					}
				}

			}
			
			TotalPointsOperations.prototype = new Object();