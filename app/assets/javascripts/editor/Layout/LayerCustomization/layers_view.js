
  /**
   *  Layers list view.
   *  
   *  - It needs a Layers collection.
   *  - It manages rendering and fetching default layers ;).
   *
   */

  var LayersView = View.extend({

    id:       'layers_overlay',
    tagName:  'div',

    events: {
      'click .close':         'hide',
      'click .add_new_layer': '_openNewLayer'
    },

    initialize: function() {
      _.bindAll(this, '_orderLayers');

      this.model = new Backbone.Model({ visible: false });
      this.collection.bind('reset',   this.render,       this);
      this.collection.bind('add',     this._addLayer,    this);
      this.collection.bind('remove',  this._removeLayer, this);
      this.template = this.getTemplate('layers_overlay');
    },
    
    render: function() {
      this.clearSubViews();
      this.$el.html(this.template());
      _.each(this.collection.last(this.collection.length).sort(), this._addLayer, this);
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
      this.$('ul').prepend(l.render().el);
      this.addView(l);
    },

    _removeLayer: function(m) {},

    _openNewLayer: function(e) {
      if (e) e.preventDefault();

      var layer_dialog = new LayerDialog();
      $('.center-map').append(layer_dialog.render().el);
      layer_dialog.show();

      this.hide();
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