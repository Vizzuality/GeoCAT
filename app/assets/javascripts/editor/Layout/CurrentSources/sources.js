
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

    model: SourceModel,

    initialize: function(arr, opts) {
      this.options = opts;
    },

    comparator: function(m) {
      return m.get('position')
    },


    sum: function(data, type, query) {
      var mdl;

      // If occ has source id (scid)
      if (data.scid) {
        // Get source
        mdl = this.find(function(m) {
          return m.cid === data.scid
        });
      } else {
        // Search source
        mdl = this.find(function(m) {
          return m.get('query') == query && m.get('type') == type
        });
      }

      // If it doesn't exist, let's create it!
      if (!mdl) {
        mdl = new SourceModel({ type: type, query: query, alias: query }, { map: this.options.map });
        this.add(mdl);
      } else {
        // If it does exist, add new one to the total
        var t = mdl.get('total');
        mdl.set('total', t+1);
      }

      if (!data.scid) data.scid = mdl.cid;
      return data;
    },


    deduct: function(data, type, query) {
      var mdl;

      // If occ has source id (scid)
      if (data.scid) {
        // Get source
        mdl = this.find(function(m) {
          return m.cid === data.scid
        });
      } else {
        // Search source
        mdl = this.find(function(m) {
          return m.get('query') == query && m.get('type') == type
        });
      }

      if (!mdl) {
        console.log('Ouch, source with query ' + query + ' and type ' + type + ' doesn\'t exist' );
        return false;
      } else {
        // Deduct one from total, setting model
        var t = mdl.get('total') - 1;
        mdl.set('total', t);
      }

      // If total is 0, remove the model + remove item + añsdlfjñlajsdflñajsd
      // if (t == 0) {
      //   mdl.destroy();
      // }

      return data;
    }

  });