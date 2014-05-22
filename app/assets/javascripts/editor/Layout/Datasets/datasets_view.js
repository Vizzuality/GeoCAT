
  /**
   *  Datasets list view
   *
   */

  var DatasetsView = View.extend({

    initialize: function() {
      this._initViews();
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();
      this.collection.each(this._addDataset);
      return this;
    },

    _initViews: function() {
      var selector = new DatasetsSelector({
        el:         $('select'),
        collection: this.collection,
        map:        this.options.map
      });
      selector.render();
      selector.bind('onSelect', this._setActiveDataset, this);
      this.addView(selector);
    },

    _initBinds: function() {
      this.collection.bind('add',     this._addDataset, this);
      this.collection.bind('remove',  this._removeDataset, this);
    },

    _addDataset: function(m) {
      var v = new DatasetItem({ model: m });
      this.$('ul.datasets').append(v.render().el);
      this.addView(v);
    },

    _removeDataset: function(m) {},

    _setActiveDataset: function(value, cid) {
      this.collection.each(function(m) {
        if (m.get('name') === value && m.cid == cid && !m.get('removed')) {
          // Set active dataset
          m.set('active', true);
          // Change sources_collection global variable :S
          sources_collection = m.getSources();
        } else {
          m.set('active', false);
        }
      });     
    },

    _onSelectDataset: function(e) {
      if (e) this.killEvent(e);
      console.log("other dataset selected, change panes!");
    }

  })