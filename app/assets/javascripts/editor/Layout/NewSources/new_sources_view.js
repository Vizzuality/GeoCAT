
  /**
   *  Sources view (it includes sources list)
   *
   */

  var new_sources_list = [

    {
      name:   'Flickr',
      url:    '/search/flickr/<%= value %>',
      text:   'Add points from Flickr'
    },
    {
      name:   'GBIF',
      url:    '/search/gbif/<%= value %>',
      text:   'Add points from GBIF'
    },
    {
      name:   'iNaturalist',
      url:    '/search/inaturalist/<%= value %>',
      text:   'Add points from iNaturalist'
    },
    {
      name:   'Picasa',
      url:    '/search/picasa/<%= value %>',
      text:   'Add points from Picasa'
    },
    {
      name:   'DWC',
      url:    '/search/dwc',
      exts:   /(\.|\/)(zip)$/i,
      text:   'Import .DWC',
      type:   'uploadDWC'
    },
    {
      name:   'geocat-csv',
      url:    '/editor',
      exts:   /(\.|\/)(geocat|csv)$/i,
      text:   'Import .GeoCAT, .CSV',
      type:   'uploadGeoCATCSV'
    }

  ];



  /**
   *  New sources list view (it includes new sources list)
   *
   */

  var NewSourcesListView = View.extend({

    events: {
      'click .close': 'hide'
    },

    initialize: function() {
      this.model = new Backbone.Model({
        visible:  false,
        selected: null
      });

      this.collection = new NewSourceCollection(new_sources_list);
      this._initBinds();
    },

    render: function() {
      this.$('ul.add_new_sources').html('');
      this.collection.each(this._addSource, this);
      return this;
    },

    _initBinds: function() {
      _.bindAll(this, 'toggle', 'reset', '_onKeyPress');
      // God, please, don't take it into consideration...
      $("#add_source_button").click(this.toggle);
    },

    _initKeyBind: function() {
      $(document).bind('keydown',this._onKeyPress);
    },

    _onKeyPress: function(e) {
      if (e.keyCode === 27) this.hide()
    },

    _destroyKeyBind: function() {
      $(document).unbind('keydown',this._onKeyPress);
    },

    _addSource: function(s) {
      var v = new window['New' + s.get('type').capitalize() + 'SourceItem']({
        model: s
      });
      v.bind('selected',  this._selectSource, this);
      v.bind('import',    this._importSource, this);
      v.bind('dwc',       this._dwcSource,    this);
      v.bind('close',     this.hide,          this);
      v.bind('changeApp', this._changeApp,    this);

      this.$('ul.add_new_sources').append(v.render().el);
      this.addView(v);
    },

    _importSource: function(data, splitOn) {
      // Again, please, god :)
      if(splitOn !== undefined && ['group', 'species_name'].indexOf(splitOn) >=0) {
        _.each(_.groupBy(data.points, splitOn), function(points, key) {
          addSourceToMap({group: key, points: points}, true, false);
        });
        $('.select2-container').select2('open')
      } else {
        var activeGroup = groups.getActive();
        if(activeGroup !== undefined) {
          data.group = activeGroup.get('name');
        }
        addSourceToMap(data, true, false);
      }
      this.hide();
    },

    _dwcSource: function(species) {
      this.hide();
      var specie_selector = new SpecieSelector(species);
    },

    _selectSource: function(selected_model) {
      this.collection.each(function(s) {
        if (selected_model != s) {
          s.set('selected', false);
        } else {
          s.set('selected', true);
        }
      });
    },

    _changeApp: function(step) {
      changeApplicationTo(step);
      this.hide();
    },

    _resetState: function() {
      this.collection.each(function(s) {
        s.set({
          state:    'idle',
          value:    '',
          selected: false
        })
      });
    },

    toggle: function() {
      if (reduction_analysis || this.model.get('visible')) {
        this.hide();
      } else {
        this.show();
      }
    },

    show: function() {
      // Arg!
      if (reduction_analysis) return;

      this.model.set('visible', true);
      this.render();
      this.$el.fadeIn();
      this._initKeyBind();
    },

    hide: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      this.model.set('visible', false);
      this.$el.fadeOut(this.reset);
    },

    reset: function() {
      this._resetState();
      this.clearSubViews();
    },

    clean: function() {
      this._resetState();
      this._destroyKeyBind();
      View.prototype.clean.call(this);
    },

  });
