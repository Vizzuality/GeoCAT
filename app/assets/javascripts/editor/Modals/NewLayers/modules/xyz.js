



  var XYZ = View.extend({

    render: function() {
      this.$el.html('xyz');

      return this;
    }

  })

/*
  _onSubmit: function(e) {
      if (e) e.preventDefault();
      var $input = this.$('form.import input[type="text"]');
      var url = $input.val();
      var error = this._checkUrl(url);

      if (!error) {
        this._hideError();
        var pos = this.collection.size();
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


  */