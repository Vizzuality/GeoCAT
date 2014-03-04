

  /**
   *  Cellsize popup view
   *
   */


  var CellsizeView = View.extend({

    events: {
      'slide div.slider':   '_onSlide',
      'click .default':     '_setDefaultCellsize',
      'click .done':        'hide',
      'click #auto_value':  '_toggleAutoValue'
    },

    initialize: function(opts) {
      
      this.model = new Backbone.Model({
        active:   false,
        default:  false
      });

      this.analysis = opts.analysis;
      this._initBinds();
    },
    
    render: function() {
      var is_auto_value = this.analysis.get('celltype') == "auto-value";
      var cellsize = this.analysis.get('cellsize');

      // Auto value
      this.$('#auto_value')[ is_auto_value ? 'addClass' : 'removeClass' ]('selected')

      // Cellsize value and class
      if (!is_auto_value) {
        this.$('span p').text(
          (cellsize < 1 ? cellsize*1000 : cellsize ) +
          (cellsize < 1 ? "M" : "KM" )
        )  
      }
      this.$('span p')[ is_auto_value ? 'addClass' : 'removeClass' ]('disabled');

      // Slider enabled?
      this.$("div.slider").slider( is_auto_value ? 'disable' : 'enable' );

      // IUCN button
      this.$('.default')[ is_auto_value ? 'addClass' : 'removeClass' ]('disabled');
      
      return this;
    },

    _initBinds: function() {

      _.bindAll(this, '_checkClickOrigin', '_onSlide', '_toggleAutoValue');

      //Hull convex slider
      this.$("div.slider").slider({
        range: "min",
        value: 12,
        min: 1,
        max: 60
      });

      // Analysis change
      this.analysis.bind('change', this.render, this);
    },

    _onSlide: function(e, ui) {
      var value = 0;
      if (ui.value<11) {
        if (ui.value == 10) {
          value = 1;
        } else {
          value = (ui.value * 0.1).toFixed(1);
        }
      } else {
        value = ui.value - 10;
      }

      this.analysis.set({
        cellsize: value,
        celltype: 'user defined'
      });
    },

    _toggleAutoValue: function(e) {
      if (e) e.preventDefault();

      if (this.analysis.get('celltype') !== "auto-value") {
        this.analysis.set({
          cellsize: 0,
          celltype: "auto-value"
        });
      } else {
        var value = this.$('.slider').slider( "option", "value" );

        if (value < 10) {
          value = value / 10;
        } else {
          value -= 10;
        }

        this.analysis.set({
          cellsize: value,
          celltype: "user defined"
        });
      }
      
    },

    _setDefaultCellsize: function() {
      if (this.analysis.get('celltype') == "auto-value") {
        return false;
      }

      this.$("div.slider").slider({ value: 12 });

      this.analysis.set({
        cellsize: 2,
        celltype: "IUCN default"
      });
    },

    _bindBody: function() {
      $("body").bind('click', this._checkClickOrigin);
    },

    _unbindBody: function() {
      $("body").unbind('click', this._checkClickOrigin);
    },

    _checkClickOrigin: function(e) {
      var self = this;
      if (!$(e.target).closest(self.el).length) {
        self.hide();
      };
    },

    show: function() {
      this._bindBody();
      this.model.set('active', true);
      this.$el.fadeIn();
    },

    hide: function() {
      this._unbindBody();
      this.model.set('active', false);
      this.$el.fadeOut();
    },

    toggle: function() {
      var active = this.model.get('active');
      this[ active ? 'hide' : 'show' ]();
    }

  });