



  var XYZ = NewLayerModule.extend({

    events: {
      'submit form': 'submit'
    },

    submit: function(e) {
      if (e) e.preventDefault();

      var $input = this.$('form input.text');
      var url = $input.val();
      var error = this._checkUrl(url);

      if (!error) {
        this._hideError();
        this._addLayer(url);
        this.trigger('finished', this);
      } else {
        this._showError(error);
      }
    },

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
      // URL valid
      if (url.search('http://') != 0 && url.search('https://') != 0) {
        return 'URL provided it\'s not valid'
      }

      // Type correct
      if (
          url.toLowerCase().search('{x}') == -1 ||
          url.toLowerCase().search('{y}') == -1 ||
          url.toLowerCase().search('{z}') == -1
        ) {
        return 'XYZ url doesn\'t contain {x},{y} and {z}'
      }

      // Layer previously added?
      var alreadyAdded = this.options.layers.find(function(l) { return l.get('url').toLowerCase() == url.toLowerCase() })
      if (alreadyAdded) {
        return 'Layer already added to your list'
      }

      return '';
    },

    _hideError: function() {
      this.$('div.error').hide();
    },

    _showError: function(error) {
      // Show error from the errors array
      this.$('div.error')
        .find('p').text(error)
        .parent()
        .show();
    }

  });