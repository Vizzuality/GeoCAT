

    function GapsOverlay(latlng, info, map) {
      this.latlng_ = latlng;
    	this.inf = info;
      this.offsetVertical_ = 0;
      this.offsetHorizontal_ = -390;
      this.height_ = 533;
      this.width_ = 381;
      this.setMap(map);
    }

    GapsOverlay.prototype = new google.maps.OverlayView();

    GapsOverlay.prototype.draw = function() {
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
    		div.style.background = 'url(/images/editor/gaps_bkg.png) no-repeat 0 0';

    		


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

      // $(div).animate({
      //         top: '-=' + 10 + 'px',
      //         opacity: 1
      //       }, 250, 'swing');

    };

    GapsOverlay.prototype.remove = function() {
      if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      }
    };

    GapsOverlay.prototype.getPosition = function() {
     return this.latlng_;
    };


    GapsOverlay.prototype.changePosition = function(latlng,marker_id,opt) {

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


    GapsOverlay.prototype.deleteMarker = function() {
    	this.hide();
    	removeMarkers([{catalogue_id: this.marker_id}]);
    }


    GapsOverlay.prototype.hide = function() {
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


    GapsOverlay.prototype.show = function() {
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


    GapsOverlay.prototype.isVisible = function() {
      if (this.div_) {
        var div = this.div_;		
		
    		if ($(div).css('visibility')=='visible') {
    			return true;
    		} else {
    			return false;
    		}
    	}
    }





