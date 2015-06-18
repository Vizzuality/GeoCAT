
  /**
   *  Layer module for CartoDB viz urls
   *
   */


  var CartoDB = NewLayerModule.URL.extend({

    _addLayer: function(url) {
      var pos = this.options.layers.size();
      this.options.layers.add(
        new Layer({
          url:          url,
          name:         'CartoDB layer',
          source_name:  'user',
          type:         'cartodb',
          added:        true
        })
      );
    },

    _checkUrl: function(url) {
      var error = NewLayerModule.URL.prototype._checkUrl.call(this, url);

      if (error) return error;

      // CartoDB api
      if (url.search('cartodb.com/api/v2/viz') === -1) {
        return 'URL is not a valid CartoDB url'
      }

      // viz.json
      if (url.search('viz.json') === -1) {
        return 'CartoDB URL should end with viz.json'
      }

      // Already a CartoDB layer added?
      var alreadyAdded = this.options.layers.find(function(l) { return l.get('type').toLowerCase() === "cartodb" })
      if (alreadyAdded) {
        return 'A CartoDB layer is already added'
      }

      return '';
    }

  })