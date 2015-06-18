
  /**
   *  Group item view (an item 
   *  from the groups list)
   */

  var GroupItem = View.extend({

    className:  'group',
    tagName:    'li',

    initialize: function() {
      this.template = this.getTemplate('groups/group_list_view');
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
      this.model.bind('change:removed', this._onRemovedChange, this);
    },

    _onActiveChange: function() {
      if (!this.model.get('removed')) {
        this.$el[ this.model.get('active') ? 'show' : 'hide' ]();
      }
    },

    _onRemovedChange: function() {
      this.$el[ !this.model.get('removed') ? 'show' : 'hide' ]();  
    }

  });
