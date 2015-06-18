
  /**
   *  Groups list view
   *
   */

  var GroupsView = View.extend({

    initialize: function() {
      this._initViews();
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();
      this.collection.each(this._addGroup);
      return this;
    },

    _initViews: function() {
      var selector = new GroupsSelector({
        el:         $('select'),
        collection: this.collection,
        map:        this.options.map
      });
      selector.render();
      selector.bind('onSelect', this._setActiveGroup, this);
      this.addView(selector);
    },

    _initBinds: function() {
      this.collection.bind('add',     this._addGroup, this);
      this.collection.bind('remove',  this._removeGroup, this);
    },

    _addGroup: function(m) {
      var v = new GroupItem({ model: m });
      this.$('ul.groups').append(v.render().el);
      this.addView(v);
    },

    _removeGroup: function(m) {},

    _setActiveGroup: function(value, cid) {
      this.collection.each(function(m) {
        if (m.get('name') === value && m.cid == cid && !m.get('removed')) {
          // Set active group
          m.set('active', true);
          // Change sources_collection global variable :S
          sources_collection = m.getSources();
        } else {
          m.set('active', false);
        }
      });
    },

    _onSelectGroup: function(e) {
      if (e) this.killEvent(e);
      console.log("other group selected, change panes!");
    }

  })
