
  /**
   *
   *
   */

  var DatasetItem = View.extend({

    className:  'dataset',
    tagName:    'li',

    initialize: function() {
      this.template = this.getTemplate('datasets/dataset_list_view');
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();

      this.$el.html(this.template());

      // sources view
      var v = this.sources = new SourcesView({
        el:         this.$('ul.sources_list'),
        collection: this.model.getSources(),
        map:        this.model.getMap()
      });
      v.render();
      this.addView(v);

      return this;
    },

    _initBinds: function() {
      this.model.bind('change:active', this._onActiveChange, this);
    },

    _onActiveChange: function() {
      this.$el[ this.model.get('active') ? 'show' : 'hide' ]();
    }

  });