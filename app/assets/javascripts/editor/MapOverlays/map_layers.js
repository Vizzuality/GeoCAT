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
      } else {
        this._manageLayers();  
      }
    },

    _addLayers: function() {
      var layers = this.get('layers');
      layers.each(this._addLayer, this);
    },

    _addLayer: function(m) {
      var layer;

      if (m.get('type') === "fusion-tables") {
        layer = this._createFusionTables(m);
      } else if (m.get('type') === "kml") {
        layer = this._createKML(m);
      } else {
        layer = this._createXYZ(m);
      }

      this._orderLayer(m);
      m.set('layer', layer, { silent: true });
      this._manageLayers();
    },

    _orderLayer: function(m) {
      m.set('position', 0, { silent:true });
      this.get('layers').each(function(mod) {
        if (mod !== m) {
          var pos = mod.get('position') + 1;
          mod.set('position', pos, { silent:true })
        }
      });
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

    _createFusionTables: function(m) {

      var ft_opts = {
        query: {
          select:   '',
          from:     '',
          where:    ''
        },
        styleId:    '',
        templateId: ''
      };

      var url = m.get('url');

      // Query parameter
      var query = url.getParameterValue('q');

      // Query parameter: WHERE clause
      var wherePos = url.indexOf('where');
      if (wherePos != -1) {
        var filter = query.substring('where'.length + wherePos);
        ft_opts.query.where = decodeURIComponent(filter);
      }

      // Query parameter: document ID
      var fromPos = query.indexOf('from');
      var docIdStartPos = fromPos + 'from '.length;
      var docIdEndPos = query.length;
      if (wherePos != -1) {
        docIdEndPos = wherePos - docIdStartPos;
      }
      
      ft_opts.query.from = query.substring(docIdStartPos,docIdStartPos + docIdEndPos).trim();
      ft_opts.query.select = url.getParameterValue('l');
      ft_opts.styleId = url.getParameterValue('y');
      ft_opts.templateId = url.getParameterValue('tmplt');

      return new google.maps.FusionTablesLayer(ft_opts);
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
        if (l.get('type') === "kml" || l.get('type') === "fusion-tables") {
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
          } else if (type === "kml" || type === "fusion-tables") {
            if (!_.isEmpty(layer)) layer.setMap(map)
          }
        }
      })
    }

  });