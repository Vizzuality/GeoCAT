

  /**
   *  Sort custom map panes
   *
   */


  var MapSources = Backbone.Model.extend({

    defaults: {
      groups: {},
      map:      {}
    },

    _START_INDEX: 105,

    initialize: function() {
      this._setSources();
      this._bindGroupsEvent();
    },

    _bindGroupsEvent: function() {
      this.get('groups').bind('change:active', this._setSources, this);
    },

    _setSources: function() {
      this._unsetSources();
      // Get source collection
      var active_group = this._getActiveGroup();

      if (active_group) {
        this.sources = active_group.getSources();
        this.sources.bind('change',           this._changeSource, this);
        this.sources.bind('remove add reset', this._managePanes, this);
      }
    },

    _getActiveGroup: function() {
      var group;

      this.get('groups').each(function(m){
        if (m.get('active')) {
          group = m;
        }
      })

      return group;
    },

    _unsetSources: function() {
      if (this.sources) {
        this.sources.unbind('change',           this._changeSource, this);
        this.sources.unbind('remove add reset', this._managePanes, this);
      }
    },

    _changeSource: function(m) {
      if (m.changed && m.changed.position !== undefined) {
        this._managePanes();
      }
    },

    _managePanes: function() {
      // Order sources
      var i = this.sources.size();
      var self = this;

      this.sources.each(function(s) {
        var pane = s.getPane();
        var pos = s.get('position');
        if (pane) {
          pane.style.zIndex = i + self._START_INDEX - pos;
        }
      });

      // Float pane on the top
      var float_pane = this.getFloatPane();
      float_pane.style.zIndex = this._START_INDEX + this.sources.size() + 1;
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
