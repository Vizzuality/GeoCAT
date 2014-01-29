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