
    /**
     *  Metadata infowindow class
     *
     *  - A GMaps overlay view.
     *  - A model created storing all overlay properties + occurence info
     */


    var MetadataModel = Backbone.Model.extend({

      defaults: {
        latitude: '',
        longitude: '',
        collectionCode: '',
        institutionCode: '',
        catalogNumber: '',
        basisOfRecord: '',
        collector: '',
        collectorNumber: '',
        eventDate: '',
        country: '',
        stateProvince: '',
        county:'',
        verbatimElevation: '',
        locality: '',
        coordinateUncertaintyInMeters: '',
        identifiedBy: '',
        occurrenceRemarks: '',
        occurrenceDetails: ''
      }

    });



    /**
     *  Metadata infowindow class
     *
     *  - A GMaps overlay view.
     *  - A model created storing all overlay properties + occurence info
     */

    function MetadataInfowindow(latlng, info, map) {
      
      this.model = new Backbone.Model({
        visible:          false,
        latlng:           latlng,
        offsetVertical:   -28,
        offsetHorizontal: 4,
        height:           533,
        width:            381,
        map:              map,
        data:             new MetadataModel(info)
      });

      this.setMap(map);
    }

    MetadataInfowindow.prototype = new google.maps.OverlayView();

    _.extend(MetadataInfowindow.prototype, Backbone.Events);

    _.extend(MetadataInfowindow.prototype, {

      draw: function() {
        var self = this;
        var div = this.model.get('div');

        if (!div) {
          div = document.createElement('div');
          this.model.set('div', div);
          $(div).addClass('metadata_infowindow');

          this.render();
          
          var panes = this.getPanes();
          panes.floatPane.appendChild(div);
        }

        // Positionate overlay
        this.setPosition();
      },

      render: function() {
        var div = this.model.get('div');
        div.style.zIndex= global_zIndex + 1;
        var data = this.model.get('data').toJSON();
        this.unBindEvents();
        $(div).html(JST['editor/views/metadata_infowindow'](data))
        this.bindEvents();
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

        _.bindAll(this, 'changeDistance', 'save', 'hide');
        
        $(div).find('.save').bind('click', this.save);
        $(div).find('a.close, a.cancel').bind('click', this.hide);
        
        $(div).find("div.slider").slider({
          range:  "min",
          value:  11,
          min:    1,
          max:    60,
          update: self.changeDistance
        });

        $(div).bind('mousedown', this.stopPropagation);
        $(div).bind('dblclick', this.stopPropagation);
      },

      unBindEvents: function() {
        var div = this.model.get('div');
        $(div).find('.save').unbind('click');
        $(div).find('a.close, a.cancel').unbind('click');
        $(div).find("div.slider").slider('destroy');
        $(div).unbind('mousedown', this.stopPropagation);
        $(div).unbind('dblclick', this.stopPropagation);
      },

      stopPropagation: function(ev) {
        try { ev.stopPropagation() } catch(e) { ev.cancelBubble=true }
      },

      changeDistance: function(e, ui) {
        var div = this.model.get('div');
        var value = (ui.value < 11) ? ui.value*100 : (ui.value-10)*1000;
        var metric = (ui.value<11) ? 'M' : 'KM';
        var value_showed = (ui.value<11) ? ui.value*100 : (ui.value-10);
        
        // NOOOOO, global :(
        var marker_id = this.model.get('marker_id');
        occurrences[marker_id].set('distance',value);
        occurrences[marker_id].data.coordinateUncertaintyInMeters = value;
        
        $(div).find('.slider_value').html(value_showed + metric);
      },

      changePosition: function(latlng,marker_id,opt) {
        // Clean old data model
        var data = this.model.get('data');
        data.destroy();

        delete data;

        // Add latitude and longitude
        opt.latitude = latlng.lat();
        opt.longitude = latlng.lng();

        this.model.set({
          latlng:     latlng,
          marker_id:  marker_id,
          data:       new MetadataModel(opt)
        });
        
        // Fill data into gaps :D
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


      save: function() {

      },

      transformCoordinates: function(point) {
        return this.getProjection().fromContainerPixelToLatLng(point);
      },


      // Move map to let metadata infowindow appears
      moveMaptoOpen: function() {
        var left = 0;
        var top = 0;
        
        var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.model.get('latlng'));
        var container = this.model.get('map').getDiv();
        
        if (($(container).width() - pixPosition.x) < (this.model.get('width') + this.model.get('offsetHorizontal'))) {
          left = -(($(container).width() - pixPosition.x) - (this.model.get('width') + this.model.get('offsetHorizontal')));
        }
        
        if (($(container).height()-pixPosition.y) < this.model.get('height')) {
          top = -($(container).height() - pixPosition.y - this.model.get('height'));
        }
        
        this.model.get('map').panBy(left,top);
      },

      getPosition: function() {
        return this.model.get('latlng');
      },

      hide: function(e) {
        if (e) e.preventDefault();

        var div = this.model.get('div');
        if (div) $(div).fadeOut();
        this.model.set('visible', false);
      },

      show: function() {
        var div = this.model.get('div');
        if (div) $(div).fadeIn();
        this.model.set('visible', true);
      },

      // Infowindow is visible?
      isVisible: function() {
        return this.model.get('visible');
      }

    });
