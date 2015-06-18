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
      var self = this;

      function setLayer(l) {
        self._orderLayer(m);
        m.set('layer', l, { silent: true });
        self._manageLayers();
      }

      if (m.get('type') === "fusion-tables") {
        this._createFusionTables(m, setLayer);
      } else if (m.get('type') === "kml") {
        this._createKML(m, setLayer);
      } else if (m.get('type') === "cartodb") {
        this._createCartoDB(m, setLayer);
      } else if (m.get('type') === "wms") {
        this._createWMS(m, setLayer);
      } else {
        this._createXYZ(m, setLayer);
      }
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

    _createXYZ: function(m, callback) {
      var xyz = new google.maps.ImageMapType({
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
      });

      callback(xyz);
    },


     _createWMS: function(m, callback) {
      var wms_lyr = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          var lULP = new google.maps.Point(coord.x * 256, (coord.y + 1) * 256);
          var lLRP = new google.maps.Point((coord.x + 1) * 256, coord.y * 256);

          var projectionMap = new MercatorProjection();

          var lULg = projectionMap.fromDivPixelToSphericalMercator(lULP, zoom);
          var lLRg = projectionMap.fromDivPixelToSphericalMercator(lLRP, zoom);

          var lUL_Latitude = lULg.y;
          var lUL_Longitude = lULg.x;
          var lLR_Latitude = lLRg.y;
          var lLR_Longitude = lLRg.x;
          //GJ: there is a bug when crossing the -180 longitude border (tile does not render) - this check seems to fix it
          if (lLR_Longitude < lUL_Longitude) {
            lLR_Longitude = Math.abs(lLR_Longitude);
          }

          return m.get('url') + "&bbox=" + lUL_Longitude + "," + lUL_Latitude + "," + lLR_Longitude + "," + lLR_Latitude;
        },
        tileSize:   new google.maps.Size(256, 256),
        opacity:    m.get('opacity'),
        isPng:      true,
        name:       m.get('name'),
        urlPattern: m.get('url')
      });

      callback(wms_lyr);
    },

    _createKML: function(m, callback) {
      var kml = new google.maps.KmlLayer({
        url: m.get('url'),
        suppressInfoWindows: false,
        preserveViewport: true
      });
      callback(kml);
    },

    _createCartoDB: function(m, callback) {
      var self = this;
      var layergroup = cartodb.createLayer(this.get('map'), m.get('url'));
      layergroup.callback = callback;

      layergroup
        .on('done', function(layer) {
          // Set layer model
          this.callback(layer);
        })
        .on('error', function(e) {
          console.log(e);
        });
    },

    _createFusionTables: function(m, callback) {

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

      callback(new google.maps.FusionTablesLayer(ft_opts));
    },

    _removeLayer: function(l) {
      var t = l.get('type');
      var map = this.get('map');

      if (t === "kml" || t === "fusion-tables") {
        var layer = l.get('layer');
        if (!_.isEmpty(layer)) layer.setMap(null)
      } else if (t === "cartodb") {
        // Remove legendS
        map.viz && map.viz.legends && map.viz.legends.clean();
      }

      this._manageLayers();
    },

    _cleanLayers: function() {
      var map = this.get('map');

      // Image layers
      _.each(map.overlayMapTypes, function(a,i) {
        var l = map.overlayMapTypes.getAt(i);

        // If it is a CartoDB layer
        if (l && l.type && l.type === "layergroup") {
          // Hide infowindow
          l.infowindow && l.infowindow.set('visibility', false);
          // Hide legends (HACK!)
          map.viz && map.viz.legends && map.viz.legends.hide();

          _.each(l.getSubLayers(),function(sublyr,i) {
            sublyr.setInteraction(false);
          });
        }

        map.overlayMapTypes.setAt(i, null);
      });

      // Non image layers
      this.get('layers').each(function(l) {
        var t = l.get('type');
        var layer = l.get('layer');

        if (t === "kml" || t === "fusion-tables") {
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
          if (type === "xyz" || type === "wms") {
            map.overlayMapTypes.setAt(index, layer);
            index++;
          } else if (type === "kml" || type === "fusion-tables") {
            if (!_.isEmpty(layer)) layer.setMap(map)
          } else if (type === "cartodb") {
            if (layer) {
              // Hide legends (HACK!)
              map.viz && map.viz.legends && map.viz.legends.show();

              _.each(layer.getSubLayers(),function(sublyr,i) {
                sublyr.setInteraction(true);
                sublyr.show();
              });
            }

            map.overlayMapTypes.setAt(index, layer);
            index++;
          }
        }
      })
    }

  });