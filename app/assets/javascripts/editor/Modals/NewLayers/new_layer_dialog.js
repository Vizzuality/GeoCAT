
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
   *    - CartoDB
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
        name:   'CartoDB',
        module: 'CartoDB'
      },
      {
        name:   'KML',
        module: 'KML'
      },
      {
        name:   'Fusion Tables',
        module: 'FusionTables',
        slug:   'FusionTables'
      },
      {
        name:   'WMS',
        module: 'WMS'
      }
    ],

    className:  'dialog new_layer_dialog',
    tagName:    'div',

    events: {
      'click .close': 'hide',
      'click .back':  'reset',
      'click .ok':    'ok'
    },

    initialize: function() {
      this.template = this.getTemplate('new_layer_dialog/new_layer_dialog');
      this.collection = new ModuleTypes(this._TYPES);
      $(document).trigger('new_layer_dialog');
    },

    render: function() {
      this.$el.append(this.template());

      this._initTabPane();
      this._initBinds();

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
        var mod = this[name] = new window[d.module]({
          template: name,
          layers:   this.options.layers_collection,
          model:    m
        });

        mod.bind('positionate', this.positionate, this); // Positionate dialog correctly
        mod.bind('finished',    this.hide,        this); // Task finished? Hide dialog

        mod.render();
        this.panes.addTab( name, mod );

      }, this);

      this.tabs.linkToPanel(this.panes);

      // Active the first one
      this.panes.active('XYZ');
    },

    _initBinds: function() {
      _.bindAll(this, 'clean', 'hide');

      this.collection.bind('change', this._checkFooter, this);
      this.panes.bind('tabEnabled', this._checkFooter, this);
      $(document).bind('new_layer_dialog', this.hide);
    },

    _destroyBinds: function() {
      $(document).unbind('new_layer_dialog', this.hide);
    },

    _checkFooter: function() {
      var pane = this.panes.getActivePane();
      var state = pane.model.get('state');
      var tab = this.panes.activeTab;
      var $ok = this.$('.ok');

      // Ok disabled?
      $ok[ state === "idle" || state === "" ? 'removeClass' : 'addClass' ]('disabled');

      // Back button visibility?
      this.$('.back')[ state === "success" ? 'show' : 'hide' ]();

      // Loader
      this.$('.loader')[ state === "loading" ? 'show' : 'hide' ]();

      // Positionate
      this.positionate();
    },

    positionate: function(e) {
      var h = this.$el.innerHeight() / 2;

      this.$el.animate({
        marginTop: -h
      }, 300);
    },

    reset: function(e) {
      this.killEvent(e);
      var pane = this.panes.getActivePane();
      pane.reset();
    },

    ok: function(e) {
      this.killEvent(e);
      var pane = this.panes.getActivePane();
      pane.submit();
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function(e) {
      this.killEvent(e);
      this.$el.fadeOut(this.clean);
    },

    clean: function() {
      this._destroyBinds();
      View.prototype.clean.call(this);
    }

  })
