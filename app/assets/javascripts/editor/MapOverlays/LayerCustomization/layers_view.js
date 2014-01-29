
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
      var l = new LayerView({ model:m });
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