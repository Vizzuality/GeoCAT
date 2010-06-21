

function MarkerTooltip(latlng, marker_id, opt, map) {
  this.latlng_ = latlng;
	this.inf = opt;
	this.marker_id = marker_id;
  this.offsetVertical_ = -205;
  this.offsetHorizontal_ = -116;
  this.height_ = 211;
  this.width_ = 233;
  this.setMap(map);
}

MarkerTooltip.prototype = new google.maps.OverlayView();

MarkerTooltip.prototype.draw = function() {
  var me = this;

  var div = this.div_;
  if (!div) {
    div = this.div_ = document.createElement('DIV');
    div.style.border = "none";
    div.style.position = "absolute";
    div.style.paddingLeft = "0px";
		div.style.opacity = "0";
		div.style.width = '233px';
		div.style.height = '211px';
		div.style.background = 'url(images/editor/info_tooltip.png) no-repeat 0 0';
		
		var button = document.createElement('a');
    button.style.position = "relative";
		button.style.float = "left";
		button.style.font = "normal 15px Arial";
		button.style.color = "#333333";
		button.style.cursor = "pointer";
		button.style.margin = "20px 0 0 20px"
		$(button).text('delete');
		$(button).click(function(ev){
			me.deleteMarker();
		});
		div.appendChild(button);
		
		var image = document.createElement('img');
    image.style.position = "relative";
		image.style.float = "left";
		image.style.margin = "20px 0 0 20px"
		image.src = "http://farm"+ this.inf.farm +".static.flickr.com/"+ this.inf.server +"/"+ this.inf.id +"_"+ this.inf.secret +"_s.jpg";
		div.appendChild(image);
		

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
	this.marker_id = marker_id;
	this.latlng_ = latlng;
	this.inf = opt;
	$(this.div_).find('img').attr('src',"http://farm"+ this.inf.farm +".static.flickr.com/"+ this.inf.server +"/"+ this.inf.id +"_"+ this.inf.secret +"_s.jpg");
	var div = this.div_;
  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (pixPosition) {
	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
	  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
  }
}

MarkerTooltip.prototype.deleteMarker = function() {
	deleteMarker(this.marker_id);
}


MarkerTooltip.prototype.hide = function() {
  if (this.div_) {
    var div = this.div_;
    $(div).animate({
      top: '-=' + 10 + 'px',
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

    // (we're using chaining on the popup) now animate it's opacity and position
    $(div).animate({
      top: '-=' + 10 + 'px',
      opacity: 1
    }, 400, 'swing');

	}

}

MarkerTooltip.prototype.toggle = function() {
  if (this.div_) {
    if (this.div_.style.visibility == "hidden") {
      this.show();
    } else {
      this.hide();
    }
  }
}

MarkerTooltip.prototype.toggleDOM = function() {
  if (this.getMap()) {
    this.setMap(null);
  } else {
    this.setMap(this.map_);
  }
}






