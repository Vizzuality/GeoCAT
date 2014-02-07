
  
  /**
   *  Sort custom map panes
   *
   */


  var MapSources = Backbone.Model.extend({

    defaults: {
      sources:  {},
      map:      {}
    },

    _START_INDEX: 105,

    initialize: function() {
      var sources = this.get('sources');
      sources.bind('change', this._changeSource, this);
      sources.bind('remove add reset', this._managePanes, this);
    },

    _changeSource: function(m) {
      if (m.changed && m.changed.position !== undefined) {
        this._managePanes();
      }
    },

    _managePanes: function() {
      // Order sources
      var i = this.get('sources').size();
      var self = this;

      this.get('sources').each(function(s) {
        var pane = s.getPane();
        var pos = s.get('position');
        if (pane) {
          pane.style.zIndex = i + self._START_INDEX - pos;
        }
      });

      // Float pane on the top
      var float_pane = this.getFloatPane();
      float_pane.style.zIndex = this._START_INDEX + this.get('sources').size() + 1;
    },

    getFloatPane: function() {
      var ov = this.ov = new google.maps.OverlayView(); 
      ov.onAdd = function(){}; 
      ov.draw = function(){}; 
      ov.onRemove = function(){};
      ov.setMap(this.get('map'));
      return ov.getPanes().floatPane;
    },

    removeFloatPane: function() {
      if (this.ov) {
        this.ov.setMap(null);
        delete this.ov;  
      }
    }

  });