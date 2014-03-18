
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
      name:   'DWC',
      url:    '/search/dwc',
      exts:   '',
      text:   'Import .DWC',
      type:   'uploadDWC'
    },
    {
      name:   'geocat-csv',
      url:    '/editor',
      exts:   /(\.|\/)(geocat|csv)$/i,
      text:   'Import .GeoCAT, .CSV',
      type:   'upload'
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
      _.bindAll(this, 'toggle', 'reset');
      // God, please, don't take it into consideration...
      $("#add_source_button").click(this.toggle);

    },

    _addSource: function(s) {
      var v = new window['New' + s.get('type').capitalize() + 'SourceItem']({
        model: s
      });
      v.bind('selected', this._selectSource, this);
      v.bind('import', this._importSource, this);
      v.bind('dwc', this._dwcSource, this);
      
      this.$('ul.add_new_sources').append(v.render().el);
      this.addView(v);

    },

    _importSource: function(data) {
      // Again, please, god :)
      addSourceToMap(data, true, false);
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
      if (reduction_analysis) return;

      this.model.set('visible', true);
      this.render();
      this.$el.fadeIn();
    },

    hide: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      this.model.set('visible', false);
      this.$el.fadeOut(this.reset);
    },

    reset: function() {
      this._resetState();
      this.clearSubViews();
    }


  });