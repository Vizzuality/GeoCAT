

		function DeleteInfowindow(latlng, marker_id, opt, map) {
		  this.latlng_ = latlng;
			this.inf = opt;
			this.marker_id = marker_id;
		  this.offsetVertical_ = -110;
		  this.offsetHorizontal_ = -94;
		  this.height_ = 123;
		  this.width_ = 187;
		  this.setMap(map);
		}

		DeleteInfowindow.prototype = new google.maps.OverlayView();

		DeleteInfowindow.prototype.draw = function() {
		  var me = this;
			var num = 0;
	
		  var div = this.div_;
		  if (!div) {
		    div = this.div_ = document.createElement('DIV');
		    div.style.border = "none";
		    div.style.position = "absolute";
		    div.style.paddingLeft = "0px";
				div.style.opacity = "0";
				div.style.width = '187px';
				div.style.height = '123px';
				div.style.background = 'url(/images/editor/delete_bkg.png) no-repeat 0 0';
		
				//Close Infowindow button
				var cancel_button = document.createElement('a');
		    cancel_button.style.position = "absolute";
				cancel_button.style.right = "83px";
				cancel_button.style.bottom = "32px";
				cancel_button.style.cursor = 'pointer';
				cancel_button.style.font = 'normal 11px Arial';
				cancel_button.style.textDecoration = 'underline';
				cancel_button.style.color = '#333333';
				$(cancel_button).text('cancel');
				$(cancel_button).click(function(ev){
					me.hide();
				});
				$(cancel_button).hover(function(ev){
					$(cancel_button).css('color','#000000');
				},function(ev){
					$(cancel_button).css('color','#333333');
				});
				div.appendChild(cancel_button);
		
		
				//Delete Infowindow button
				var delete_button = document.createElement('a');
		    delete_button.style.position = "absolute";
				delete_button.style.right = "20px";
				delete_button.style.bottom = "28px";
				delete_button.style.width = '51px';
				delete_button.style.height = '19px';
				delete_button.style.cursor = 'pointer';
				delete_button.style.background = 'url(/images/editor/yes_delete_button.png) no-repeat 0 0';
				$(delete_button).click(function(ev){
					me.deleteMarker();
				});
				$(delete_button).hover(function(ev){
					$(delete_button).css('background-position','0 -19px');
				},function(ev){
					$(delete_button).css('background-position','0 0');
				});
				div.appendChild(delete_button);
		

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

			$(div).animate({
		    top: '-=' + 10 + 'px',
		    opacity: 1
		  }, 250, 'swing');

		};

		DeleteInfowindow.prototype.remove = function() {
		  if (this.div_) {
		    this.div_.parentNode.removeChild(this.div_);
		    this.div_ = null;
		  }
		};

		DeleteInfowindow.prototype.getPosition = function() {
		 return this.latlng_;
		};


		DeleteInfowindow.prototype.changePosition = function(latlng,marker_id,opt) {
	
			this.marker_id = marker_id;
			this.latlng_ = latlng;
			this.inf = opt;
			var div = this.div_;

	
		  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
		  if (pixPosition) {
			  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
			  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
		  }
			this.show();
		}


		DeleteInfowindow.prototype.deleteMarker = function() {
			this.hide();
			removeMarkers([{catalogue_id: this.marker_id}]);
		}


		DeleteInfowindow.prototype.hide = function() {
		  if (this.div_) {
		    var div = this.div_;
		    $(div).stop().animate({
		      top: '+=' + 15 + 'px',
		      opacity: 0
		    }, 100, 'swing', function(ev){
					div.style.visibility = "hidden";
				});
		  }
		}


		DeleteInfowindow.prototype.show = function() {
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


		DeleteInfowindow.prototype.isVisible = function() {
		  if (this.div_) {
		    var div = this.div_;		
				
				if ($(div).css('visibility')=='visible') {
					return true;
				} else {
					return false;
				}
			}
		}