
  /**
   *  New layer dialog
   *
   *  It lets you to add a new layer to
   *  the map.
   *  
   *  Types are:
   *
   *    - XYZ
   *    - KML
   *    - Fusion Tables
   *    - WMS
   *    - ...
   *
   */


  var LayerDialog = View.extend({

    _TYPES: [
      {
        name:   'XYZ',
        module: 'XYZ'
      },
      {
        name:   'KML',
        module: 'KML'
      },
      {
        name:   'Fusion Tables',
        module: 'FusionTables',
        slug:   'fusion-tables'
      },
      {
        name:   'WMS',
        module: 'WMS'
      }
    ],

    className:  'dialog new_layer_dialog',
    tagName:    'div',

    events: {
      'click .close': 'hide'
    },

    initialize: function() {
      this.template = this.getTemplate('new_layer_dialog');
      this.collection = new ModuleTypes(this._TYPES);
      this._initBinds();
    },

    render: function() {
      this.$el.append(this.template());
      this._initTabPane();
      return this;
    },

    _initTabPane: function() {
      
      // Render tabs
      this.collection.each(function(m) {

        var d = m.toJSON();

        if (!d.name || !d.module) {
          console.log('Module name or class not specified :(');
          return false;
        }

        // Generate tab
        var tab_template = this.getTemplate('tab');
        this.$('.tabs ul').append(tab_template(d));
      }, this);

      // Create tabs
      this.tabs = new Tabs({
        el: this.$('.tabs ul'),
        slash: true
      });
      this.addView(this.tabs);


      // Create TabPane
      this.panes = new TabPane({
        el: this.$(".panes")
      });
      this.addView(this.panes);


      // Create panes
      this.collection.each(function(m) {

        var d = m.toJSON();

        if (!d.name || !d.module || !window[d.module]) {
          console.log('Module name or class not specified :(');
          return false;
        }

        // Create pane
        var name = d.slug || d.name;
        var mod = this[name] = new window[d.module]();
        mod.render();
        this.panes.addTab( name, mod );

      }, this);

      this.tabs.linkToPanel(this.panes);

      // Active the first one
      this.panes.active('xyz');
    },

    _initBinds: function() {
      _.bindAll(this, 'clean');
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function(e) {
      if (e) e.preventDefault();
      this.$el.fadeOut(this.clean);
    }

  })