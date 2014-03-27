
  /**
   *  Layer module for WMS services
   *
   */


  var WMSLayerView = View.extend({

    tagName: 'li',

    events: {
      'click a': '_addLayer'
    },

    initialize: function() {
      this.template = this.getTemplate('new_layer_dialog/modules/wms_layer_item');
    },

    render: function() {
      var d = this.model.toJSON();
      d.enabled = this._validLayers().length > 0;
      
      this.$el.append(this.template(d));
      return this;
    },

    _validLayers: function() {
      var crss = this.model.get('crs');
      var bounding_boxes = this.model.get('bounding_boxes');
      
      var valid_crs = _.map(crss, function(crs){
        if (crs.search('3857') !== -1 ||  crs.search('900913') !== -1) {
          return crs;
        } else {
          return false
        }
      });

      var valid_bbox = _.map(bounding_boxes, function(bbox){
        if (bbox.crs && ( bbox.crs.search('3857') !== -1 ||  bbox.crs.search('900913') !== -1 )) {
          return bbox.crs;
        } else {
          return false
        }
      });

      return _.compact(valid_crs.concat(valid_bbox));
    },

    _addLayer: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var valid_crs = this._validLayers();

      if (valid_crs.length == 0) return false;
    
      this.model.set('valid_crs', valid_crs[0]);
      this.trigger('add_layer', this.model, this);
    }

  });




  var WMSLayersList = View.extend({

    initialize: function() {
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();

      this.collection.each(function(m) {
        var lyr_view = new WMSLayerView({
          model: m
        });

        this.$el.append(lyr_view.render().el);
        lyr_view.bind('add_layer', this._addLayer, this);
        this.addView(lyr_view);
      }, this);
    },

    _initBinds: function() {
      this.collection.bind('reset', this.render, this);
    },

    _addLayer: function(m) {
      this.trigger('add_layer', m, this);
    }

  });




  var WMS = NewLayerModule.URL.extend({

    _TEXTS: {
      error: 'Your WMS base URL is not valid or doesn\'t contain any layer with supported projections (3857, 900913).'
    },

    initialize: function(opts) {
      NewLayerModule.URL.prototype.initialize.call(this, opts);

      this.layers = new WMSLayers();

      this._initBinds();
    },

    _initBinds: function() {
      this.model.bind('change:state', this._onStateChange, this);
    },

    render: function() {
      NewLayerModule.URL.prototype.render.call(this);

      var layers_list = new WMSLayersList({
        el:         this.$('ul.wms_layers'),
        collection: this.layers
      });

      layers_list.bind('add_layer', this._addLayer, this);

      return this;
    },

    submit: function(e) {
      if (e) e.preventDefault();

      // Check status
      var state = this.model.get('state');
      if (state !== "idle" && state !== "") return;

      // State ok, go ahead!
      var $input = this.$('form input.text');
      var url = $input.val();
      var error = this._checkUrl(url);

      if (!error) {
        this._hideError();
        
        this.model.set({
          value: url,
          state: 'loading'
        });

        this._requestLayers(url);
      } else {
        this._showError(error);
      }
    },

    reset: function() {
      this.model.set('state', '');
      this.trigger('positionate', this);
    },

    _requestLayers: function(url) {
      var self = this;

      this.layers
        .setURL(url)
        .fetch({
          reset: true,
          success: function() {
            self.model.set('state', 'success');
            self.trigger('positionate', self);
          },
          error: function() {
            self.model.set('state', '' );
            this._showError(this._TEXTS.error);
            self.trigger('positionate', self);
          }
        });
    },

    _onStateChange: function() {
      var state = this.model.get('state');
      this.$('.input , .list').hide();

      if (state === "success") {
        this.$('.list').show();
      } else {
        this.$('.input').show();        
      }
    },

    _addLayer: function(m) {
      var url = this._generateURL(m);

      // Check if url is already added to the layers stack
      var error = this._checkUrl(url);

      if (!error) {
        this._hideError();
      } else {
        this._showError(error);
        return false;
      }

      // Add layer!
      var pos = this.options.layers.size();
      this.options.layers.add(
        new Layer({
          url:          url,
          name:         m.get('title') || m.get('name'),
          source_name:  m.get('attribution') || 'user',
          type:         'wms',
          added:        true
        })
      );

      // Bye!
      this.trigger('finished', this);
    },

    _generateURL: function(m) {

      var url = this.model.get('value') + '?';
      var params = [
        "FORMAT=image/png",
        "LAYERS=" + m.get('name'),
        "SRS=" + m.get('valid_crs'),
        "REQUEST=GetMap",
        "SERVICE=WMS",
        "VERSION=1.1.1",
        "TRANSPARENT=TRUE",
        "WIDTH=256",
        "HEIGHT=256"
      ];

      return url + params.join("&");      
    }

  });