  
  /**
   *  Layer model.
   *  
   *  - It needs at least a url (xyz or kml type).
   *  - We could guess the type thanks to the url.    
   *
   */

  var Layer = Backbone.Model.extend({
    
    defaults: {
      url:          '',
      type:         'xyz',  // xyz or kml
      tms:          false,
      opacity:      1,
      source_name:  '',
      source_url:   '',
      name:         '',
      position:     0,
      added:        false, 
      layer:        {},     // GMaps layer object
      common:       false   // If layer is from common sources
    }

  });


  /**
   *  Layers collection.
   *  
   *  - Made of several layer models.
   *
   */
  
  var Layers = Backbone.Collection.extend({

    model: Layer,

    comparator: function(m) {
      return -m.get('position')
    },

    getDefaultLayers: function() {
      var self = this;

      $.getJSON("/data/layers.json",function(result){
        
        var layers = result.layers;
        var arr = [];

        _.each(layers, function(l) {
          var already_added = self.find(function(m) { return m.get('url') === l.url });
          if (!already_added) {
            l.default = true;
            arr.push(l);
          }
        });

        self.add(arr);
      });
    }

  });


  /**
   *  Model that manage custom layers in the map
   *
   */

  var MapLayers = Backbone.Model.extend({

    defaults: {
      layers: {},
      map:    {}
    },

    initialize: function() {
      var layers = this.get('layers');
      layers.bind('change', this._changeLayer, this);
      layers.bind('remove', this._removeLayer, this);
      layers.bind('add',    this._addLayer, this);
      layers.bind('reset',  this._addLayers, this);
    },

    _changeLayer: function(m) {
      if (m.changed.opacity !== undefined) {
        m.get('layer').set('opacity', m.get('opacity'));  
      }
    
      this._manageLayers();
    },

    _addLayers: function() {
      var layers = this.get('layers');
      layers.each(this._addLayer, this);
    },

    _addLayer: function(m) {
      var layer;
      if (m.get('type') === "xyz") {
        layer = this._createXYZ(m);
      } else {
        layer = this._createKML(m);
      }

      m.set('layer', layer, { silent: true });
      this._manageLayers();
    },

    _createXYZ: function(m) {
      return new google.maps.ImageMapType({
        getTileUrl: function(tile, zoom) {
          var y = tile.y;
          var tileRange = 1 << zoom;
          if (y < 0 || y  >= tileRange) {
            return null;
          }
          if (m.get('tms')) {
            y = Math.pow(2, zoom) - tile.y - 1;
          }
          var x = tile.x;
          if (x < 0 || x >= tileRange) {
            x = (x % tileRange + tileRange) % tileRange;
          }
          return this.urlPattern
            .replace(/\{X\}|\{x\}/g, x)
            .replace(/\{Y\}|\{y\}/g, y)
            .replace(/\{Z\}|\{z\}/g, zoom);
        },
        tileSize:   new google.maps.Size(256, 256),
        opacity:    m.get('opacity'),
        isPng:      true,
        name:       m.get('name'),
        urlPattern: m.get('url')
      })
    },

    _createKML: function(m) {
      return new google.maps.KmlLayer({
        url: m.get('url'),
        suppressInfoWindows: false,
        preserveViewport: true
      });
    },

    _removeLayer: function(l) {
      if (l.get('type') === "kml") {
        var layer = l.get('layer');
        if (!_.isEmpty(layer)) layer.setMap(null)
      }

      this._manageLayers();
    },

    _cleanLayers: function() {
      var map = this.get('map');
      
      _.each(map.overlayMapTypes, function(a,i) {
        map.overlayMapTypes.setAt(i, null);
      });

      this.get('layers').each(function(l) {
        if (l.get('type') === "kml") {
          var layer = l.get('layer');
          if (!_.isEmpty(layer)) layer.setMap(null)
        }
      });
      
    },

    _manageLayers: function() {
      var map = this.get('map');
      var index = 0;

      // Clean overlay types
      this._cleanLayers();
      
      // Show layers already added
      this.get('layers').sort().each(function(l) {
        var layer = l.get('layer');
        var type = l.get('type'); 
        if (l.get('added')) {
          if (type === "xyz") {
            map.overlayMapTypes.setAt(index, layer);
            index++;
          } else if (type === "kml") {
            if (!_.isEmpty(layer)) layer.setMap(map)
          }
        }
      })
    }

  });


  /**
   *  Layer item view.
   *  
   *  - It needs a Layer model.
   *
   */

  var LayerItem = View.extend({

    tagName: 'li',

    events: {
      'dblclick input':       '_startEdit',
      'click input':          'killEvent',
      'focusout input':       '_finishEdit',
      'click .add':           '_onAddClick',
      'slidechange .slider':  '_onSlideChange',
      'submit form':          '_onSubmit',
      'click .remove':        '_onRemove'
    },

    initialize: function() {
      _.bindAll(this, '_onSlideChange', '_finishEdit', '_startEdit', '_onAddClick');
      this.template = this.getTemplate('layer_item');
      this.model.bind('change:added', this._toggleSlider, this);
      this.model.bind('change:added', this._toggleSelected, this);
    },

    render: function() {
      this.clearSubViews();
      this.$el.html(this.template(this.model.toJSON()));

      // Set cid as data
      this.$el.attr('data-cid', this.cid);
      
      // Set slider
      this.$slider = this.$('div.slider');
      this.$slider.slider({
        range:  'min',
        min:    0,
        max:    1,
        step:   0.1,
        value:  this.model.get('opacity')
      });

      // Check if slider should appear
      this._toggleSlider();
      // Check if add is seleect
      this._toggleSelected();

      return this;
    },

    _onRemove: function(e) {
      if (e) e.preventDefault();
      this.model.destroy();
      this.remove();
    },

    _toggleSelected: function() {
      var isAdded = this.model.get('added');
      this.$('a.add')
        [ !isAdded ? 'removeClass' : 'addClass' ]('selected')
        .text( !isAdded ? 'add' : 'added' )
    },

    _toggleSlider: function() {
      var isAdded = this.model.get('added') && this.model.get('type') === "xyz";
      this.$('div.foot')[ !isAdded ? 'hide' : 'show' ]()
    },

    _onAddClick: function(e) {
      if (e) e.preventDefault();
      this.model.set('added', !this.model.get('added'));
    },

    _startEdit: function(e) {
      if (e) e.preventDefault();

      var $input = this.$('input');
      this.old_value = $input.val();
      this.$('input').removeAttr('readonly');
    },

    _finishEdit: function(e) {
      if (e) e.preventDefault();

      this.$('input').attr('readonly', 'readonly')
      var value = this.$('input').val();
      
      if (!value) {
        value = this.old_value;
      }
      this.model.set({ name: value },{ silent: true });
    },

    _onSlideChange: function(e, ui) {
      this.model.set('opacity', ui.value);
    },

    _onSubmit: function(e) {
      if (e) e.stopPropagation();
      this._finishEdit(e);
    },

    clean: function() {
      this.$slider.slider('destroy');
      view.prototype.clean.call(this);
    }

  });


  /**
   *  Layers list view.
   *  
   *  - It needs a Layers collection.
   *  - It manages rendering and fetching default layers ;).
   *
   */

  var LayersView = View.extend({

    id: 'layer_dialog',
    tagName: 'div',

    events: {
      'click .close': 'hide',
      'submit form':  '_onSubmit'
    },

    initialize: function() {
      _.bindAll(this, '_orderLayers');

      this.model = new Backbone.Model({ visible: false });
      this.collection.bind('reset',   this.render,       this);
      this.collection.bind('add',     this._addLayer,    this);
      this.collection.bind('remove',  this._removeLayer, this);
      this.template = this.getTemplate('layer_dialog');
    },
    
    render: function() {
      this.clearSubViews();
      this.$el.html(this.template());
      _.each(this.collection.last(this.collection.length).reverse(), this._addLayer, this);
      this._makeSortable();

      return this;
    },

    _makeSortable: function() {
      // Draggable!
      var self = this;
      this.$('ul').sortable({
        revert:false,
        items: 'li',
        cursor: 'pointer',
        beforeStop: function(event,ui){
          $(ui.item).removeClass('moving');
        },
        update: this._orderLayers,
        start: function(event,ui){
          $(ui.item).addClass('moving');
        }
      });
    },

    _orderLayers: function() {
      var self = this;
      // Loop layers and change position attribute
      this.$('ul > li').each(function(i,el){
        var cid = $(el).data('cid');
        self._subviews[cid].model.set('position', i, { silent: true });
      });

      // Triggering event for reordering layers
      this.collection.trigger('change', { changed: {} });
    },

    _addLayer: function(m, pos) {
      var l = new LayerItem({ model:m });
      this.$('ul').append(l.render().el);
      this.addView(l);
    },

    _removeLayer: function(m) {},


    _onSubmit: function(e) {
      if (e) e.preventDefault();
      var $input = this.$('form.import input[type="text"]');
      var url = $input.val();
      var error = this._checkUrl(url);

      if (!error) {
        this._hideError();
        this.collection.add(
          new Layer({
            url: url,
            name: 'User',
            source_name: 'user',
            type: this._getLayerType(url),
            added: true
          })
        );
        $input.val('');
      } else {
        this._showError(error);
      }
    },

    _getLayerType: function(url) {
      return url.substr(url.length - 4) == ".kml" ? 'kml' : 'xyz'
    },

    _checkUrl: function(url) {
      // URL valid
      if (url.search('http://') != 0 && url.search('https://') != 0) {
        return 'URL provided it\'s not valid'
      }

      // Type correct
      var type = this._getLayerType(url);
      if (
          type === "xyz" && (
          url.toLowerCase().search('{x}') == -1 ||
          url.toLowerCase().search('{y}') == -1 ||
          url.toLowerCase().search('{z}') == -1 )
        ) {
        return 'XYZ url doesn\'t contain {x},{y} and {z}'
      }

      // Layer previously added?
      var alreadyAdded = this.collection.find(function(l) { return l.get('url').toLowerCase() == url.toLowerCase() })
      if (alreadyAdded) {
        return 'Layer already added to your list'
      }

      return '';
    },

    _hideError: function() {
      this.$('span.error').stop().fadeOut();
    },

    _showError: function(error) {
      // Show error from the errors array
      this.$('span.error')
        .find('p').text(error)
        .parent()
        .stop()
        .fadeIn()
        .delay(2000)
        .fadeOut();
    },

    show: function(e) {
      if (e) {
        var $a = $(e.target);
        var pos = $a.offset();
        pos.top -= 55;
        pos.left += 40;
        this.$el.css(pos)
      }

      this.$el
        .css({
          marginLeft: '-=10px',
          opacity:    0,
          display:    'block'
        })
        .animate({
          marginLeft: '+=10px',
          opacity:    1
        }, 150);

      this.model.set('visible', true);
    },

    hide: function(e) {
      if (e) e.preventDefault();

      this.$el
        .animate({
          marginLeft: '-=10px',
          opacity:    0
        }, 150, function() {
          $(this).css({
            marginLeft: '+=10px',
            display:    'none'
          })
        });

      this.model.set('visible', false);
    },

    isVisible: function() {
      return this.model.get('visible');
    }

  });