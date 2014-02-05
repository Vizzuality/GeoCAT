

		function MarkerTooltip(latlng, marker_id, opt, map) {
		  this.latlng_ = latlng;
			this.inf = opt;
			this.marker_id = marker_id;
			this.map_ = map;
		
		  this.offsetVertical_ = -230;
		  this.offsetHorizontal_ = -116;
		  this.height_ = 245;
		  this.width_ = 233;
		
		  this.setMap(map);
		}

		MarkerTooltip.prototype = new google.maps.OverlayView();

		MarkerTooltip.prototype.draw = function() {
						
		  var me = this;
			var num = 0;
	
		  var div = this.div_;
		  if (!div) {
		    div = this.div_ = document.createElement('DIV');
		    div.style.border = "none";
		    div.style.position = "absolute";
		    div.style.paddingLeft = "0px";
				div.style.opacity = "0";
				div.style.zIndex = global_zIndex;
				div.style.width = '233px';
				div.style.height = '245px';
				div.style.background = 'url(/assets/editor/tooltip_bkg.png) no-repeat 0 0';
		
				//Close Infowindow button
				var close_button = document.createElement('a');
		    close_button.style.position = "absolute";
				close_button.style.right = "1px";
				close_button.style.top = "1px";
				close_button.style.width = "21px";
				close_button.style.height = "21px";
				close_button.style.cursor = 'pointer';
				close_button.style.background = "url(/assets/editor/close_infowindow.png) no-repeat 0 0";
				$(close_button).text('');
				$(close_button).click(function(ev){
					try{ev.stopPropagation();}catch(e){event.cancelBubble=true;};
					me.hide();
				});
				$(close_button).hover(function(ev){
					$(close_button).css('background-position','0 -21px');
				},function(ev){
					$(close_button).css('background-position','0 0');
				});
				div.appendChild(close_button);
		
		
				//Marker Latitude
				var latitude = document.createElement('p');
				$(latitude).addClass('latitude');
		    latitude.style.position = "absolute";
				latitude.style.left = "26px";
				latitude.style.top = "14px";
				latitude.style.margin = "0";
				latitude.style.lineHeight = "29px";
				latitude.style.font = "normal 29px Georgia";
				latitude.style.color = "#666666";
				
				if (Math.floor(this.latlng_.lat())<0) {
				  var au_lat = Math.floor(this.latlng_.lat())+1;
				} else {
				  var au_lat = Math.floor(this.latlng_.lat());
				}
				
				$(latitude).text(au_lat);
				
				if ($(latitude).text().length>2) {
					if ($(latitude).text().length>3) {
						num = 2;
					} else {
						num = 4;
					}
				} else {
					num = 5;
				}
		
				var latitude_decimals = document.createElement('sup');
				latitude_decimals.style.color = "#666666";
				latitude_decimals.style.font = "normal 15px Georgia";
				$(latitude_decimals).text(String(Math.abs((this.latlng_.lat() % 1.0).toFixed(num))).substring(1));
				latitude.appendChild(latitude_decimals);
				div.appendChild(latitude);
		
		
				//Marker Longitude
				var longitude = document.createElement('p');
				$(longitude).addClass('longitude');
		    longitude.style.position = "absolute";
				longitude.style.left = "131px";
				longitude.style.top = "14px";
				longitude.style.margin = "0";
				longitude.style.lineHeight = "29px";
				longitude.style.font = "normal 29px Georgia";
				longitude.style.color = "#666666";
				
				if (Math.floor(this.latlng_.lng())<0) {
				  var au_lng = Math.floor(this.latlng_.lng())+1;
				} else {
				  var au_lng = Math.floor(this.latlng_.lng());
				}
				
				$(longitude).text(au_lng);
		
				if ($(longitude).text().length>2) {
					if ($(longitude).text().length>3) {
						num = 2;
					} else {
						num = 4;
					}
				} else {
					num = 5;
				}
		
				var longitude_decimals = document.createElement('sup');
				longitude_decimals.style.color = "#666666";
				longitude_decimals.style.font = "normal 15px Georgia";
				$(longitude_decimals).text(String(Math.abs((this.latlng_.lng() % 1.0).toFixed(num))).substring(1));
				longitude.appendChild(longitude_decimals);
				div.appendChild(longitude);


				//Marker description
				var description = document.createElement('p');
				$(description).addClass('description');
				description.style.position = "absolute";
				description.style.left = "24px";
				description.style.top = "97px";
				description.style.margin = "0";
				description.style.font = "normal 11px Arial";
				description.style.color = "#666666";
				$(description).text(this.inf.occurrenceRemarks || '');

				div.appendChild(description);
				

				//Marker collector
				var collector = document.createElement('p');
				$(collector).addClass('collector');
		    collector.style.position = "absolute";
				collector.style.left = "24px";
				collector.style.top = "129px";
				collector.style.margin = "0";
				collector.style.font = "normal 11px Arial";
				collector.style.color = "#666666";
				$(collector).text(this.inf.collector || '');
				div.appendChild(collector);

       
        var meters = this.inf.coordinateUncertaintyInMeters;
				var km_value;
	      if (meters !== "") {
	        km_value = ( meters < 1100 ) ? ( meters / 100 ) : (( meters / 1000 ) + 10);
	      } else {
	        km_value = 10;
	      }
        
				var precision = document.createElement('p');
				$(precision).addClass('precision');
		    precision.style.position = "absolute";
				precision.style.right = "22px";
				precision.style.top = "157px";
				precision.style.margin = "0";
				precision.style.font = "bold 10px Arial";
				precision.style.color = "#F4A939";
				var metric = (km_value < 11) ? 'M' : 'KM';
	      var value_showed = (km_value < 11) ? km_value * 100 : (km_value-10);
				$(precision).text(value_showed + metric);
				div.appendChild(precision);
				
				var precision_slider = document.createElement('div');
				$(precision_slider).attr('id','precision_slider');
				precision_slider.style.position = 'absolute';
				precision_slider.style.left = "22px";
				precision_slider.style.top = "170px";
				precision_slider.style.margin = "6px 0 0 0";
				precision_slider.style.height = '5px';
				precision_slider.style.width = '190px';
				div.appendChild(precision_slider);
		
				//Buttons
				var delete_button = document.createElement('a');
		    delete_button.style.position = "absolute";
				delete_button.style.left = "24px";
				delete_button.style.bottom = "29px";
				delete_button.style.width = "58px";
				delete_button.style.height = "19px";
				delete_button.style.cursor = 'pointer';
				delete_button.style.background = "url(/assets/editor/info_delete.png) no-repeat 0 0";
				$(delete_button).text('');
				$(delete_button).click(function(ev){
					try{ev.stopPropagation();}catch(e){event.cancelBubble=true;};
					me.deleteMarker();
				});
				$(delete_button).hover(function(ev){
					$(delete_button).css('background-position','0 -19px');
				},function(ev){
					$(delete_button).css('background-position','0 0');
				});
				div.appendChild(delete_button);
		
		
		
				var hide_button = document.createElement('a');
				$(hide_button).addClass('hide_button_');
		    hide_button.style.position = "absolute";
				hide_button.style.left = "87px";
				hide_button.style.bottom = "29px";
				hide_button.style.width = "58px";
				hide_button.style.height = "19px";
				hide_button.style.cursor = 'pointer';
				if (this.inf.geocat_active) {
					hide_button.style.background = "url(/assets/editor/info_hide.png) no-repeat 0 0";
				} else {
					hide_button.style.background = "url(/assets/editor/show_button.png) no-repeat 0 0";
				}
				$(hide_button).text('');
				$(hide_button).click(function(ev){
					try{ev.stopPropagation();}catch(e){event.cancelBubble=true;};
					me.makeActive();
				});
				$(hide_button).hover(function(ev){
					$(hide_button).css('background-position','0 -19px');
				},function(ev){
					$(hide_button).css('background-position','0 0');
				});
				div.appendChild(hide_button);

				google.maps.event.addDomListener(div,'mousedown',function(ev){ 
			    try{
						ev.stopPropagation();
					}catch(e){
						event.cancelBubble=true;
					}; 
			  });
			  
			  
			  var edit_button = document.createElement('a');
		    edit_button.style.position = "absolute";
				edit_button.style.right = "0px";
				edit_button.style.bottom = "29px";
				edit_button.style.width = "58px";
				edit_button.style.height = "19px";
				edit_button.style.cursor = 'pointer';
				edit_button.style.background = "url(/assets/editor/edit_button.png) no-repeat 0 0";
				$(edit_button).text('');
				$(edit_button).click(function(ev){
					try{ev.stopPropagation();}catch(e){event.cancelBubble=true;};
					me.editData();
				});
				$(edit_button).hover(function(ev){
					$(edit_button).css('background-position','0 -19px');
				},function(ev){
					$(edit_button).css('background-position','0 0');
				});
				div.appendChild(edit_button);

				google.maps.event.addDomListener(div,'mousedown',function(ev){ 
			    try{
						ev.stopPropagation();
					}catch(e){
						event.cancelBubble=true;
					}; 
			  });
				
		    var panes = this.getPanes();
		    panes.floatPane.appendChild(div);
		
				$("div#precision_slider").slider({
					range: "min",
					value: km_value,
					min: 1,
					max: 60,
					slide: function(event, ui) {
						var value = (ui.value<11)?ui.value*100:(ui.value-10)*1000;
						var metric = (ui.value<11)?'M':'KM';
						var value_showed = (ui.value<11)?ui.value*100:(ui.value-10);
						// occurrences[me.marker_id].set('distance',value);
						occurrences[me.marker_id].data.coordinateUncertaintyInMeters = value;
						$(div).find('p.precision').html(value_showed + metric);
					}
				});
		
				this.moveMaptoOpen();
		  }

			var pixPosition = me.getProjection().fromLatLngToDivPixel(me.latlng_);
		  if (pixPosition) {
			  div.style.width = me.width_ + 'px';
			  div.style.left = (pixPosition.x + me.offsetHorizontal_) + 'px';
			  div.style.height = me.height_ + 'px';
			  div.style.top = (pixPosition.y + me.offsetVertical_ - (($(div).css('opacity') == 1)? 10 : 0)) + 'px';
		  }
				
			if ($(div).css('opacity') == 0) {
				$(div).animate({
			    top: '-=' + 10 + 'px',
			    opacity: 1
			  }, 250, 'swing');
			}
		};

		MarkerTooltip.prototype.remove = function() {
		  if (this.div_) {
		    this.div_.parentNode.removeChild(this.div_);
		    this.div_ = null;
		  }
		};

		MarkerTooltip.prototype.getPosition = function() {
		 return this.latlng_;
		};


		MarkerTooltip.prototype.changePosition = function(latlng,marker_id,opt) {
			var num = 0;
			var me = this;
			
			this.marker_id = marker_id;
			this.latlng_ = latlng;
			this.inf = opt;
			var div = this.div_;
  		div.style.zIndex = global_zIndex + 1;
			
			if ((this.latlng_.lat()).toFixed(0).length>2) {
				num = 4;
			} else {
				num = 5;
			}
			if (!this.inf.geocat_active) {
				$(div).find('a.hide_button_').css('background-image','url(/assets/editor/show_button.png)');
			} else {
				$(div).find('a.hide_button_').css('background-image','url(/assets/editor/info_hide.png)');
			}
			
			if (Math.floor(this.latlng_.lat())<0) {
			  var au_lat = Math.floor(this.latlng_.lat())+1;
			} else {
			  var au_lat = Math.floor(this.latlng_.lat());
			}

			$(div).find('p.latitude').html(au_lat+'<sup style="color:rgb(102, 102, 102); font:normal 15px Georgia; ">'+String(Math.abs((this.latlng_.lat() % 1.0).toFixed(num))).substring(1)+'</sup>');
	
			if ((this.latlng_.lng()).toFixed(0).length>2) {
				if ((this.latlng_.lng()).toFixed(0).length>3) {
					num = 2;
				} else {
					num = 4;
				}
			} else {
				num = 5;
			}
			
			if (Math.floor(this.latlng_.lng())<0) {
			  var au_lng = Math.floor(this.latlng_.lng())+1;
			} else {
			  var au_lng = Math.floor(this.latlng_.lng());
			}

			$(div).find('p.longitude').html(au_lng+'<sup style="color:rgb(102, 102, 102); font:normal 15px Georgia;">'+String(Math.abs((this.latlng_.lng() % 1.0).toFixed(num))).substring(1)+'</sup>');
  		$(div).find('p.description').text(this.inf.occurrenceRemarks || '');
  		$(div).find('p.collector').text(this.inf.collector || '');

			// Slider
			var meters = this.inf.coordinateUncertaintyInMeters;
			var km_value;
      if (meters !== "") {
        km_value = ( meters < 1100 ) ? ( meters / 100 ) : (( meters / 1000 ) + 10);
      } else {
        km_value = 10;
      }

      $("div#precision_slider").slider({ value: km_value });
      
      var metric = (km_value < 11) ? 'M' : 'KM';
      var value_showed = (km_value < 11) ? km_value * 100 : (km_value-10);

      $(div).find('p.precision').text(value_showed + metric);
			$("div#precision_slider").slider({ value: km_value });
			// End slider

				
			this.moveMaptoOpen();	
			
		  var pixPosition = me.getProjection().fromLatLngToDivPixel(me.latlng_);
		  if (pixPosition) {
			  div.style.left = (pixPosition.x + me.offsetHorizontal_) + "px";
			  div.style.top = (pixPosition.y + me.offsetVertical_) + "px";
		  }

			this.show();
		}


		MarkerTooltip.prototype.makeActive = function() {
			this.hide();
			makeActive([{catalogue_id: this.marker_id}],false);
		}



		MarkerTooltip.prototype.deleteMarker = function() {
			this.hide();
			removeMarkers([{catalogue_id: this.marker_id}]);
		}


		MarkerTooltip.prototype.hide = function() {
		  if (this.div_) {
		    var div = this.div_;
		    $(div).stop().animate({
		      top: '+=' + 10 + 'px',
		      opacity: 0
		    }, 100, 'swing', function(ev){
					div.style.visibility = "hidden";
				});
		  }
		}


		MarkerTooltip.prototype.show = function() {
		  if (this.div_) {
		    var div = this.div_;
				$(div).css({opacity:0});
				div.style.visibility = "visible";

		    $(div).stop().animate({
		      top: '-=' + 10 + 'px',
		      opacity: 1
		    }, 250, 'swing');
				
			}
		}
		
		
		MarkerTooltip.prototype.editData = function() {
		  this.hide();
		  edit_metadata.changePosition(this.latlng_,this.marker_id,this.inf);
		}



		MarkerTooltip.prototype.isVisible = function() {
		  if (this.div_) {
		    var div = this.div_;
		
				if ($(div).css('visibility')=='visible') {
					return true;
				} else {
					return false;
				}
			}
		}
		
		
		MarkerTooltip.prototype.moveMaptoOpen = function() {
			var left = 0;
			var top = 0;
			
		  var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);

			if ((pixPosition.x + this.offsetHorizontal_) < 0) {
				left = (pixPosition.x + this.offsetHorizontal_ - 20);
			}
			
			if ((pixPosition.x - this.offsetHorizontal_) >= ($('div#map').width())) {
				left = (pixPosition.x - this.offsetHorizontal_ - $('div#map').width() + 20);
			}
			
			if ((pixPosition.y + this.offsetVertical_) < 0) {
				top = (pixPosition.y + this.offsetVertical_ - 10);
			}
			
			this.map_.panBy(left,top);
		}
