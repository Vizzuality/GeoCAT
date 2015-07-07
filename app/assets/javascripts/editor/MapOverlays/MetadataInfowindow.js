
    /**
     *  Metadata infowindow class
     *
     *  - A GMaps overlay view.
     *  - A model created storing all overlay properties + occurence info
     */


    var MetadataModel = Backbone.Model.extend({

      defaults: {
        geocat_active: true,
        geocat_changed: false,
        geocat_kind: 'user',
        geocat_query: '',
        geocat_removed: false,
        // geocat_alias: '',
        catalogue_id: '',
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
        interpretedFrom: '',
        presence: 'Extant',
        scientificName: '',
        locality: '',
        seasonal: 'Resident',
        origin: 'Native',
        coordinateUncertaintyInMeters: '',
        identifiedBy: '',
        occurrenceRemarks: '',
        occurrenceDetails: ''
      }

    });



    /**
     *  Metadata infowindow view
     *
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

      _.bindAll(this, 'changeDistance', 'save', 'hide', 'submit', 'setExtraInfo');

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
        this.setDistance();

        if (data.geocat_kind === "gbif") {
          this.getExtraInfo();
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

        $(div).find('form').bind('submit', this.submit);
        $(div).find('.save').bind('click', this.submit);
        $(div).find('a.close, a.cancel').bind('click', this.hide);

        $(div).find("div.slider").slider({
          range:  "min",
          value:  10,
          min:    1,
          max:    60,
          slide:  self.changeDistance
        });

        $(div).find('form select').select2({ minimumResultsForSearch: 10 });

        $(div).bind('mousedown', this.stopPropagation);
        $(div).bind('dblclick', this.stopPropagation);
      },

      unBindEvents: function() {
        var div = this.model.get('div');
        $(div).find('.save').unbind('click', this.submit);
        $(div).find('form').unbind('submit', this.submit);
        $(div).find('a.close, a.cancel').unbind('click', this.hide);
        $(div).find("div.slider").slider('destroy');
        $(div).find('form select').select2('destroy');
        $(div).unbind('mousedown', this.stopPropagation);
        $(div).unbind('dblclick', this.stopPropagation);
      },

      stopPropagation: function(ev) {
        try { ev.stopPropagation() } catch(e) { ev.cancelBubble=true }
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
        var metric = (ui.value<11) ? 'M' : 'KM';
        var value_showed = (ui.value<11) ? ui.value*100 : (ui.value-10);
        $(div).find('.slider_value').html(value_showed + metric);
      },

      getExtraInfo: function() {
        $.ajax({
          url:      'http://api.gbif.org/v0.9/occurrence/' + this.model.get('data').get('gbifKey') + '/verbatim',
          success:  this.setExtraInfo,
          error:    this.removeLoader
        })
      },

      setExtraInfo: function(r) {
        this.removeLoader();

        if (r.fields && r.fields.scientificName) {
          var v = r.fields.scientificName;
          var div = this.model.get('div');

          // Change first data
          var marker_id = this.model.get('marker_id');
          this.model.get('data').set('interpretedFrom', v);
          occurrences[marker_id].data['interpretedFrom'] = v;

          // Then change html
          $(div).find('#metadata_interpretedFrom').text('Interpreted from: ' + v);
        }
      },

      removeLoader: function(e) {
        if (e) console.log(e);
        var div = this.model.get('div');
        $(div).find('div.loader').remove();
      },

      changePosition: function(latlng,marker_id,opt) {
        // Clean old data model
        var data = this.model.get('data');
        data.clear();
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

      checkFields: function() {
        var errors = []
        var div = this.model.get('div');

        $(div).find('form input[data-validation]').each(function(i,el) {
          var validations = $(el).data('validation').split(' ');
          var _id = $(el).attr('id');
          var value = $(el).val();
          var error = "";

          if (!_.isEmpty(value) && _.contains(validations, 'date')) {
            if (!value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)) {
              error = "Date is not valid, it should be yyyy-mm-dd"
            }
          }

          if (!_.isEmpty(value) && _.contains(validations, 'url')) {
            if (value.search('http://') != 0 && value.search('https://') != 0) {
              error = "Value is not a valid url"
            }
          }

          if (!_.isEmpty(value) && _.contains(validations, 'number')) {
            if (!(!isNaN(parseFloat(value)) && isFinite(value))) {
              error = "Value is not valid, it has to be a number"
            }
          }

          if (_.contains(validations, 'empty')) {
            if (value.replace(/ /,'') === "") {
              error = "Value can't be empty"
            }
          }

          // Set error :(
          if (error) {
            errors.push({ id: _id, error: error })
            $(el).addClass('error');
          } else {
            $(el).removeClass('error');
          }

        });

        return errors;
      },

      submit: function(e) {
        if (e && e.preventDefault) e.preventDefault();

        var errors = this.checkFields();
        if (errors.length == 0) {
          this.hideError();
          this.save();
          this.hide();
        } else {
          this.showError(errors[0]);
        }
      },

      save: function() {
        var div = this.model.get('div');
        var marker_id = this.model.get('marker_id');
        var old_data = this.model.get('data').toJSON();

        // Get new data
        var new_data = {};
        // All fields
        _.each(old_data, function(val,i){
          var $field = $(div).find('#metadata_' + i);

          if ($field.length == 0) {
            // console.log('not found ' + i + ' in metadata :(');
          } else {
            var value = $field.val();
            new_data[i] = value;
          }

        });

        // slider value == coordinateUncertaintyInMeters
        var slider_value = $(div).find('.slider').slider("value");
        var meters = (slider_value < 11) ? slider_value * 100 : (slider_value - 10) * 1000;
        new_data.coordinateUncertaintyInMeters = meters;

        // Geocat changed?
        new_data.geocat_changed = true;

        // Extend new_data from old_data
        new_data = _.extend(_.clone(old_data), new_data);

        occurrences[marker_id].redraw();
        occurrences[marker_id].data = new_data;
        occurrences[marker_id].setPosition(new google.maps.LatLng(new_data.latitude,new_data.longitude));

        if (convex_hull.isVisible()) {
          $(document).trigger('occs_updated');
        }
        this.hide();

        actions.Do('edit',
          [{ catalogue_id: marker_id, info: old_data }],
          [{ catalogue_id: marker_id, info: new_data }]
        );
      },


      hideError: function() {
        var div = this.model.get('div');
        $(div).find('span.error').stop().fadeOut();
      },

      showError: function(error) {
        var div = this.model.get('div');
        // Positionate error
        var pos = $(div).find("#" + error.id).closest('.field').position();

        // Show it
        $(div).find('span.error')
          .css({
            top:  pos.top,
            left: pos.left
          })
          .find('p').text(error.error)
          .parent()
          .stop()
          .fadeIn()
          .delay(3000)
          .fadeOut();
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
        this.hideError();
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
