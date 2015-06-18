
  /**
   *  Layer module for Fusion Table urls
   *
   */


  var FusionTables = NewLayerModule.URL.extend({

    _addLayer: function(url) {
      var pos = this.options.layers.size();
      this.options.layers.add(
        new Layer({
          url:          url,
          name:         'Fusion Tables layer',
          source_name:  'user',
          type:         'fusion-tables',
          added:        true
        })
      );
    },

    _checkUrl: function(url) {
      var error = NewLayerModule.URL.prototype._checkUrl.call(this, url);

      if (error) return error;

      // Fusion tables url
      var vizmap = url.getParameterValue('viz');
      if (!vizmap || vizmap !== "MAP") return "Fusion table url doesn't contain 'viz' parameter with MAP value included"

      // q parameter
      var query = url.getParameterValue('q');
      if (!query) return "Fusion table url doesn't contain 'q' parameter"

      // from parameter
      var fromPos = query.indexOf('from');
      if (fromPos === -1) return "Fusion table url doesn't contain 'from' clause"

      // select parameter
      var select = url.getParameterValue('l');
      if (!select) return "Fusion table url doesn't contain 'l' parameter (select)"

      return '';
    }

  })