
  /**
   *  Layer module for XYZ urls
   *
   */


  var XYZ = NewLayerModule.URL.extend({

    _addLayer: function(url) {
      var pos = this.options.layers.size();
      this.options.layers.add(
        new Layer({
          url:          url,
          name:         'XYZ layer',
          source_name:  'user',
          type:         'xyz',
          added:        true
        })
      );
    },

    _checkUrl: function(url) {
      var error = NewLayerModule.URL.prototype._checkUrl.call(this, url);

      if (error) return error;

      // Type correct
      if (
          url.toLowerCase().search('{x}') == -1 ||
          url.toLowerCase().search('{y}') == -1 ||
          url.toLowerCase().search('{z}') == -1
        ) {
        return 'XYZ url doesn\'t contain {x},{y} and {z}'
      }

      return '';
    }

  });