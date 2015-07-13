
  /**
   *  Groups list view
   *
   */

  var GroupsView = View.extend({

    initialize: function() {
      this._initViews();
      this._initBinds();
      sessionStorage.clear();
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
      if (! !!m['attributes']['symbol']) {      
        var symbolsArray = ['♥','☓','⚊','⚬','☐'];
        var currentSymbol = null;
        if (!sessionStorage.getItem('groupsSymbols')) {
          var session_group = JSON.stringify(
            {
              g_ : {
                'name': m.attributes.name,
                'symbol': symbolsArray[0]
              }
            });
          sessionStorage.setItem('groupsSymbols', session_group);
          currentSymbol = symbolsArray[0];
        } else {
          var session_group = JSON.parse(sessionStorage.getItem('groupsSymbols'));
          var total_arrays = Object.keys(session_group).length;
          session_group[m.attributes.name] = {
              'name': m.attributes.name,
              'symbol': symbolsArray[total_arrays]
            }
          sessionStorage.setItem('groupsSymbols', JSON.stringify(session_group));
          currentSymbol = symbolsArray[total_arrays];
        }
        m['attributes']['symbol'] = currentSymbol;
      }
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
          sessionStorage.setItem('currentSymbol', m.attributes.symbol);
          // Change sources_collection global variable :S
          sources_collection = m.getSources();
          analysis_view.reRunAnalysis();
        } else {
          m.set('active', false);
        }
      });
    },

    _onSelectGroup: function(e) {
      if (e) this.killEvent(e);
      console.log("other group selected, change panes!");
    },

    getActiveGroupCid: function() {
      return this.collection.findWhere({active: true}).cid;
    }

  })
