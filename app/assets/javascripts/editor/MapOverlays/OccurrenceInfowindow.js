
	/**
	 *	Occurence infowindow, it is like a preview
	 *	of the data from this feature
	 *
	 */


	function OccurrenceInfowindow(latlng, marker_id, opt, map) {

		this.model = new Backbone.Model({
      visible:          false,
      latlng:           latlng,
      offsetVertical:   -235,
      offsetHorizontal: -117,
      height:           251,
      width:            235,
      map:              map,
      marker_id:  			marker_id,
      data:             new Backbone.Model(opt)
    });
	
	  this.setMap(map);

	  _.bindAll(this, 'changeDistance', 'editData', 'makeActive', 'deleteMarker', 'hide');
	}

	OccurrenceInfowindow.prototype = new google.maps.OverlayView();

	_.extend(OccurrenceInfowindow.prototype, {

		draw: function() {
			var self = this;
      var div = this.model.get('div');
      var show = false;

      if (!div) {
        div = document.createElement('div');
        this.model.set('div', div);
        $(div).addClass('occurrence_infowindow');

        this.render();
        
        var panes = this.getPanes();
        panes.floatPane.appendChild(div);
        show = true;
      }

      if (show) this.moveMaptoOpen()

      // Positionate overlay
      this.setPosition();

      if (show) this.show()
		},

		render: function() {
			var div = this.model.get('div');
      div.style.zIndex= global_zIndex + 1;
      var data = this.model.get('data').toJSON();
      this.unBindEvents();
      $(div).html(JST['editor/views/occurrence_infowindow'](data))
      this.bindEvents();
      this.setDistance();
		},

		setPosition: function() {
			var div = this.model.get('div');
      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.model.get('latlng'));

      if (pixPosition) {
        div.style.width = this.model.get('width') + "px";
        div.style.left = (pixPosition.x + this.model.get('offsetHorizontal')) + "px";
        div.style.height = this.model.get('height') + "px";
        div.style.top = (pixPosition.y + this.model.get('offsetVertical')) + "px";
      }
		},

		remove: function() {
			var div = this.model.get('div');
      if (div) {
        div.parentNode.removeChild(div);
        div = null;
        this.model.unset('div');
        this.unBindEvents();
      }
		},

		bindEvents: function() {
			var div = this.model.get('div');
			var self = this;

			$(div).find('a.close').bind('click', 	this.hide);
			$(div).find('a.edit').bind('click', 	this.editData);
			$(div).find('a.hide').bind('click', 	this.makeActive);
			$(div).find('a.show').bind('click', 	this.makeActive);
			$(div).find('a.delete').bind('click', this.deleteMarker);
			$(div).find("div.slider").slider({
        range:  "min",
        value:  10,
        min:    1,
        max:    60,
        slide:  self.changeDistance
      });
			$(div).bind('mousedown', this.stopPropagation);
      $(div).bind('dblclick', this.stopPropagation);
		},

		unBindEvents: function() {
			var div = this.model.get('div');

			$(div).find('a.close').unbind('click', 	this.hide);
			$(div).find('a.edit').unbind('click', 	this.editData);
			$(div).find('a.hide').unbind('click', 	this.makeActive);
			$(div).find('a.show').unbind('click', 	this.makeActive);
			$(div).find('a.delete').unbind('click', this.deleteMarker);
			$(div).find("div.slider").slider('destroy');
			$(div).unbind('mousedown', this.stopPropagation);
      $(div).unbind('dblclick', this.stopPropagation);
		},

		stopPropagation: function(e) {
			try { e.stopPropagation() } catch(e) { e.cancelBubble=true }
		},

		setDistance: function() {
			var div = this.model.get('div');
      var meters = this.model.get('data').get('coordinateUncertaintyInMeters');

      //Value
      var km_value;
      if (meters !== "") {
        km_value = ( meters < 1100 ) ? ( meters / 100 ) : (( meters / 1000 ) + 10);
      } else {
        km_value = 10;
      }

      $(div).find('div.slider').slider({ value: km_value });
      
      var metric = (km_value < 11) ? 'M' : 'KM';
      var value_showed = (km_value < 11) ? km_value * 100 : (km_value-10);
      $(div).find('.slider_value').html(value_showed + metric);
		},

		changeDistance: function(e, ui) {
			var div = this.model.get('div');
			var value = (ui.value<11)?ui.value*100:(ui.value-10)*1000;
      var metric = (ui.value<11) ? 'M' : 'KM';
      var value_showed = (ui.value<11) ? ui.value*100 : (ui.value-10);
      $(div).find('.slider_value').html(value_showed + metric);
      debugger;
      this.model.get('data').set('coordinateUncertaintyInMeters',value);
      occurrences[this.model.get('marker_id')].data.coordinateUncertaintyInMeters = value;
		},

		changePosition: function(latlng, marker_id, opt) {
	    var data = this.model.get('data');
      data.clear();
      data.destroy();

      delete data;

      this.model.set({
        latlng:     latlng,
        marker_id:  marker_id,
        data:       new Backbone.Model(opt)
      });
      
      // Fill data
      this.render();

      this.moveMaptoOpen();
      this.setPosition();
      this.show();
		},

		setPosition: function() {
			var div = this.model.get('div');
      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.model.get('latlng'));

      if (pixPosition) {
        div.style.width = this.model.get('width') + "px";
        div.style.left = (pixPosition.x + this.model.get('offsetHorizontal')) + "px";
        div.style.height = this.model.get('height') + "px";
        div.style.top = (pixPosition.y + this.model.get('offsetVertical')) + "px";
      }
		},

		getPosition: function() {
			return this.model.get('latlng');
		},

		getMarkerId: function() {
			return this.model.get('marker_id')
		},

		editData: function(e) {
			if (e) e.preventDefault();
    	this.hide();
    	edit_metadata.changePosition(
    		this.model.get('latlng'),
    		this.model.get('marker_id'),
    		this.model.get('data').toJSON()
    	);
  	},

  	makeActive: function(e) {
  		if (e) e.preventDefault();
    	this.hide();
    	makeActive([{ catalogue_id: this.model.get('marker_id') }], false);
  	},

  	deleteMarker: function(e) {
  		if (e) e.preventDefault();
    	this.hide();
    	removeMarkers([{ catalogue_id: this.model.get('marker_id') }]);
  	},

		isVisible: function() {
			return this.model.get('visible');
		},

		hide: function(e) {
			if (e) e.preventDefault();
			var div = this.model.get('div');
			if (div) {
	      $(div).stop().animate({
	        top: '+=' + 10 + 'px',
	        opacity: 0
	      }, 100, 'swing', function(ev){
	        $(div).css('display', 'none');
	      });
	    }
	    this.model.set('visible', false);
		},

		show: function() {
			var div = this.model.get('div');
			if (div) {
	      $(div).css({
	      	top: '+=' + 10 + 'px',
	      	display:'block',
	      	opacity:0
	      });

	      $(div).stop().animate({
	        top: '-=' + 10 + 'px',
	        opacity: 1
	      }, 250, 'swing'); 
	    }
	    this.model.set('visible', true);
		},

		moveMaptoOpen: function() {
			var left = 0;
	    var top = 0;
	    
	    var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.model.get('latlng'));
      var container = this.model.get('map').getDiv();

	    if ((pixPosition.x + this.model.get('offsetHorizontal')) < 0) {
	      left = (pixPosition.x + this.model.get('offsetHorizontal') - 20);
	    }
	    
	    if ((pixPosition.x - this.model.get('offsetHorizontal')) >= ($(container).width())) {
	      left = (pixPosition.x - this.model.get('offsetHorizontal') - $(container).width() + 20);
	    }
	    
	    if ((pixPosition.y + this.model.get('offsetVertical')) < 0) {
	      top = (pixPosition.y + this.model.get('offsetVertical') - 10);
	    }
	    
	    this.model.get('map').panBy(left,top);
		}

	});
