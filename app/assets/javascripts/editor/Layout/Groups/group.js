
  /**
   *  Group model
   *
   */

  var GroupModel = Backbone.Model.extend({

    defaults: {
      name:     'Group',
      active:   false,
      removed:  false,
      hidden:   false
    },
    /*
    * defaults.name, formerly was 'Group'
    */


    initialize: function(obj, opts) {
      this.map = opts.map;
      this.sources = new SourcesCollection(null, { map: opts.map });
    },

    getMap: function() {
      return this.map;
    },

    getSources: function() {
      return this.sources;
    }

  });



  /**
   *  Group collection
   *
   */


  var GroupsCollection = Backbone.Collection.extend({

    model: GroupModel,

    getActive: function() {
      return this.find(function(m) {
        return m.get('active') === true
      });
    },

    sum: function(data, type, query) {
      // GroupS!
      var group;

      // Get group or active one
      if (!data.dcid) {
        group = this.getActive();
        data.dcid = group.cid;
      } else {
        group = this.find(function(m) {
          return m.cid === data.dcid
        });
        if (!group) {
          console.log("Group not found!");
          return false;
        }
      }

      // If group was removed, let's make it visible
      group.set('removed', false);

      // SOURCES!
      var sources = group.getSources();
      sources.sum(data, type, query);

      return data;
    },

    deduct: function(data, type, query) {
      // groupS!
      var group;

      // Get group or active one
      if (!data.dcid) {
        group = this.getActive();
      } else {
        group = this.find(function(m) {
          return m.cid === data.dcid
        });
        if (!group) {
          console.log("Group not found!");
          return false;
        }
      }

      // SOURCES!
      var sources = group.getSources();
      sources.deduct(data, type, query);

      return data;
    }

  });
