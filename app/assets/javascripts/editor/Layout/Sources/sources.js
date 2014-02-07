
  /**
   *  Source model and collection :)
   *
   */
  
  var SourceModel = Backbone.Model.extend({

    defaults: {
      query:    'user',
      type:     'user',
      alias:    'User occs',
      position: 0,
      visible:  true,
      removed:  false,
      total:    1
    },

    initialize: function(obj, opts) {
      // Create a mapPane per source
      this.pane = new SourcePane({ map: opts.map });
    },

    getPane: function() {
      return this.pane.el;
    },

    destroy: function(options) {
      this.pane.clean();
      Backbone.Model.prototype.destroy.call(this, options);
    }

  });



  
  var SourcesCollection = Backbone.Collection.extend({

    Model: SourceModel,

    initialize: function(arr, opts) {
      this.options = opts;
    },

    comparator: function(m) {
      return m.get('position')
    },

    sumUp: function(query, type, alias) {
      // Search model
      var m = this.find(function(m) {
        return m.get('query') == query && m.get('type') == type
      });

      // If it doesn't exist, let's create it!
      if (!m) {
        m = new SourceModel({ type: type, query: query, alias: alias || query }, { map: this.options.map });
        this.add(m);
      } else {
        // If it does exist, add new one to the total
        var t = m.get('total');
        m.set('total', t+1);
      }
    },

    deduct: function(query, type, alias) {
      // Search model
      var m = this.find(function(m) {
        return m.get('query') == query && m.get('type') == type
      });

      // If you can't find it, please console!
      if (!m) {
        // console.log('Ouch, source with query ' + query + ' and type ' + type + ' doesn\'t exist' );
        return false;
      } else {
        // Deduct one from total, setting model
        var t = m.get('total') - 1;
        m.set('total', t);
      }

      // If total is 0, remove the model + remove item + añsdlfjñlajsdflñajsd
      if (t == 0) {
        m.destroy();
      }  
    }

  });