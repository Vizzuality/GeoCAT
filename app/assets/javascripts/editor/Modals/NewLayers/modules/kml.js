  
  /**
   *  Layer module for KML urls
   *
   */


  var KML = NewLayerModule.URL.extend({

    _addLayer: function(url) {
      var pos = this.options.layers.size();
      this.options.layers.add(
        new Layer({
          url:          url,
          name:         'KML layer',
          source_name:  'user',
          type:         'kml',
          added:        true
        })
      );
    },

    _checkUrl: function(url) {
      var error = NewLayerModule.URL.prototype._checkUrl.call(this, url);

      if (error) return error;
      
      // URL valid
      if (url.substr(url.length - 4).toLowerCase() !== ".kml") {
        return 'KML provided it\'s not valid'
      }

      return '';
    }

  });