
  /**
   * Create a new pane for this source
   *
   */


  var SourcePane = View.extend({

    tagName: 'div',

    initialize: function(opts) {
      this.options = opts;
      this.render();
    },

    render: function() {
      var overlay = this.getOverlayPane();
      var style = $(overlay).attr('style');
      this.$el.attr('style', style);
      this.$el.insertBefore(overlay);
      this.removeFloatPane();
      return this;
    },

    getOverlayPane: function() {
      var ov = this.ov = new google.maps.OverlayView();
      ov.onAdd = function(){};
      ov.draw = function(){};
      ov.onRemove = function(){};
      ov.setMap(this.options.map);
      return ov.getPanes().overlayMouseTarget;
    },

    removeFloatPane: function() {
      this.ov.setMap(null);
      delete this.ov;
    }

  });