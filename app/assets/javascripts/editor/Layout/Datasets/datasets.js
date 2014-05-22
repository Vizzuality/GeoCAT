
  /**
   *  Dataset model
   *
   */
  
  var DatasetModel = Backbone.Model.extend({

    defaults: {
      name:     'Dataset',
      active:   false,
      removed:  false,
      hidden:   false
    },

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
   *  Dataset collection
   *
   */


  var DatasetsCollection = Backbone.Collection.extend({

    model: DatasetModel,

    getActive: function() {
      return this.find(function(m) {
        return m.get('active') === true
      });
    },

    sum: function(data, type, query) {
      // DATASETS!
      var dataset;

      // Get dataset or active one
      if (!data.dcid) {
        dataset = this.getActive();
        data.dcid = dataset.cid;
      } else {
        dataset = this.find(function(m) {
          return m.cid === data.dcid
        });
        if (!dataset) {
          console.log("Dataset not found!");
          return false;
        }
      }

      // If dataset was removed, let's make it visible
      dataset.set('removed', false);

      // SOURCES!
      var sources = dataset.getSources();
      sources.sum(data, type, query);

      return data;
    },

    deduct: function(data, type, query) {
      // DATASETS!
      var dataset;

      // Get dataset or active one
      if (!data.dcid) {
        dataset = this.getActive();
      } else {
        dataset = this.find(function(m) {
          return m.cid === data.dcid
        });
        if (!dataset) {
          console.log("Dataset not found!");
          return false;
        }
      }

      // SOURCES!
      var sources = dataset.getSources();
      sources.deduct(data, type, query);

      return data;
    }

  });