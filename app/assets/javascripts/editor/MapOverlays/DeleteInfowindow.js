

		function DeleteInfowindow(latlng, marker_id, opt, map) {
		  this.latlng_ = latlng;
			this.inf = opt;
			this.marker_id = marker_id;
		  this.offsetVertical_ = -110;
		  this.offsetHorizontal_ = -97;
		  this.height_ = 131;
		  this.width_ = 193;
		  this.setMap(map);
		}

		DeleteInfowindow.prototype = new google.maps.OverlayView();

		DeleteInfowindow.prototype.draw = function() {
		  var me = this;
			var num = 0;
	
		  var div = this.div_;
		  if (!div) {
		    div = this.div_ = document.createElement('DIV');
		    div.className = 'delete_infowindow';
		    div.style.zIndex = global_zIndex;
				$(div).append(JST['editor/views/delete_infowindow']());
				this._bindEvents();
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

		DeleteInfowindow.prototype._unbindEvents = function() {
			var div = this.div_;
			if (div) {
				$(div).find('.cancel').off('click', null);
				$(div).find('.yes').off('click', null);
			}
		}

		DeleteInfowindow.prototype._bindEvents = function() {
			var div = this.div_;
			if (div) {
				var self = this;

				$(div).find('.cancel').on('click', function(e) {
					if (e) e.preventDefault();
					self.hide()
				});

				$(div).find('.yes').on('click', function(e) {
					if (e) e.preventDefault();
					self.deleteMarker();
				});
			}
		}

		DeleteInfowindow.prototype.remove = function() {
		  if (this.div_) {
		    this.div_.parentNode.removeChild(this.div_);
		    this._unbindEvents();
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
  		div.style.zIndex = global_zIndex + 1;
	
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