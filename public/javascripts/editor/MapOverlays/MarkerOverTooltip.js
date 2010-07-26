

		function MarkerOverTooltip(latlng, marker_id, map) {
		  this.latlng_ = latlng;
			this.marker_id = marker_id;
		  this.offsetVertical_ = -21;
		  this.offsetHorizontal_ = 1;
		  this.height_ = 22;
		  this.width_ = 57;
		  this.setMap(map);
		}

		MarkerOverTooltip.prototype = new google.maps.OverlayView();

		MarkerOverTooltip.prototype.draw = function() {
		  var me = this;

		  var div = this.div_;
		  if (!div) {
		    div = this.div_ = document.createElement('DIV');
		    div.style.border = "none";
		    div.style.position = "absolute";
		    div.style.paddingLeft = "0px";
				div.style.width = '57px';
				div.style.height = '22px';
				div.style.background = 'url(images/editor/over_bkg.png) no-repeat 0 0';
		
				$(div).hover(function(){
					over_mini_tooltip = true;
				}, function(){			
					over_mini_tooltip = false;
					setTimeout(function(ev){
						if (!over_marker) {
							me.hide();
						}
					},50);
				});
		
				var button_i = document.createElement('a');
		    button_i.style.position = "absolute";
				button_i.style.left = "4px";
				button_i.style.top = "4px";
				button_i.style.width = "14px";
				button_i.style.height = "14px";		
				button_i.style.background = "url(../images/editor/over_i.png) no-repeat 0 0";
				button_i.style.cursor = "pointer";
				$(button_i).hover(function(ev){
					$(this).css('background-position','0 -14px');
				}, function(ev){
					$(this).css('background-position','0 0');
				});
				div.appendChild(button_i);
		
				var button_o = document.createElement('a');
		    button_o.style.position = "absolute";
				button_o.style.left = "21px";
				button_o.style.top = "4px";
				button_o.style.width = "14px";
				button_o.style.height = "14px";		
				button_o.style.background = "url(../images/editor/over_o.png) no-repeat 0 0";
				button_o.style.cursor = "pointer";
				$(button_o).click(function(ev){
					me.makeActive();
				});
				$(button_o).hover(function(ev){
					$(this).css('background-position','0 -14px');
				}, function(ev){
					$(this).css('background-position','0 0');
				});
				div.appendChild(button_o);		
		
		
				var button_x = document.createElement('a');
		    button_x.style.position = "absolute";
				button_x.style.left = "38px";
				button_x.style.top = "4px";
				button_x.style.width = "14px";
				button_x.style.height = "14px";		
				button_x.style.background = "url(../images/editor/over_x.png) no-repeat 0 0";
				button_x.style.cursor = "pointer";
				$(button_x).click(function(ev){
					me.deleteMarker();
				});
				$(button_x).hover(function(ev){
					$(this).css('background-position','0 -14px');
				}, function(ev){
					$(this).css('background-position','0 0');
				});
				div.appendChild(button_x);
		

		    var panes = this.getPanes();
		    panes.floatPane.appendChild(div);
		  }

		  // Position the overlay 
		  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
		  if (pixPosition) {
			  div.style.width = this.width_ + "px";
			  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
			  div.style.height = this.height_ + "px";
			  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
		  }
		};

		MarkerOverTooltip.prototype.remove = function() {
		  if (this.div_) {
		    this.div_.parentNode.removeChild(this.div_);
		    this.div_ = null;
		  }
		};

		MarkerOverTooltip.prototype.getPosition = function() {
		 return this.latlng_;
		};


		MarkerOverTooltip.prototype.changePosition = function(latlng,marker_id) {
			this.marker_id = marker_id;
			this.latlng_ = latlng;
			var div = this.div_;
		  var pixPosition = this.getProjection().fromLatLngToDivPixel(latlng);
		  if (pixPosition) {
			  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
			  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
		  }
		}
		
		
		MarkerOverTooltip.prototype.deleteMarker = function() {
			this.hide();
			removeMarker(this.marker_id);
		}
		
		
		MarkerOverTooltip.prototype.makeActive = function() {
			this.hide();
			makeActive(this.marker_id);
		}
		


		MarkerOverTooltip.prototype.hide = function() {
		  if (this.div_) {
		    var div = this.div_;
				div.style.visibility = "hidden";	
		  }
		}


		MarkerOverTooltip.prototype.show = function() {
		  if (this.div_) {
		    var div = this.div_;  
				div.style.visibility = "visible";
			}
		}
		
		
		MarkerOverTooltip.prototype.isVisible = function() {
		  if (this.div_) {
		    var div = this.div_;

				if ($(div).css('visibility')=='visible') {
					return true;
				} else {
					return false;
				}
			}
		}






