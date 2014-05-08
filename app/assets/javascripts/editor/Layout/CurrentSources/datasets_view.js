
  /**
   *
   *
   */

  var DatasetsView = View.extend({

    events: {
      'change select':          '_setActiveDataset',
      'click a.create_dataset': '_createDataset'
    },

    initialize: function() {
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();
      this.collection.each(this._addDataset);
      return this;
    },

    _addDataset: function(m) {
      var v = new DatasetItem({ model: m });
      this.$('ul.datasets').append(v.render().el);
      this.addView(v);
    },

    _removeDataset: function(m) {
      console.log("dataset should be removed!");
    },

    _initBinds: function() {
      _.bindAll(this, '_createDataset');
      // Set select
      this.collection.bind('add remove',  this._changeSelect, this);
      this.collection.bind('add',         this._addDataset, this);
      this.collection.bind('remove',      this._removeDataset, this);
    },

    _changeSelect: function() {
      var $select = this.$('select');
      $select.html('');
      this.collection.each(function(m) {
        $select.append('<option data-cid="' + m.cid + '">' + m.get('name') + '</option>')
      });
    },

    _setActiveDataset: function() {
      var value = this.$('select').val();
      var cid = this.$('select').find(":selected").data('cid');
      
      this.collection.each(function(m) {
        if (m.get('name') === value && m.cid == cid) {
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
    },

    _createDataset: function(e) {
      if (e) this.killEvent(e);
      var n = this.collection.size();
      this.collection.add(new DatasetModel({ name: 'Dataset ' + n }, { map: this.options.map }));
    }


  })