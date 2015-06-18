
  /**
   *  Layer model.
   *
   *  - It needs at least a url (xyz or kml type).
   *  - We could guess the type thanks to the url.
   *
   */

  var Layer = Backbone.Model.extend({

    defaults: {
      url:          '',
      type:         'xyz',  // xyz or kml
      tms:          false,
      opacity:      1,
      source_name:  '',
      source_url:   '',
      name:         '',
      position:     0,
      added:        false,
      layer:        {},     // GMaps layer object
      common:       false   // If layer is from common sources
    }

  });


  /**
   *  Layers collection.
   *
   *  - Made of several layer models.
   *
   */

  var Layers = Backbone.Collection.extend({

    model: Layer,

    comparator: function(m) {
      return -m.get('position')
    },

    getDefaultLayers: function() {
      var self = this;

      $.getJSON("/data/layers.json",function(result){

        var layers = result.layers;
        var arr = [];

        _.each(layers, function(l) {
          var already_added = self.find(function(m) { return m.get('url') === l.url });
          if (!already_added) {
            l.default = true;
            arr.push(l);
          }
        });

        self.add(arr);
      });
    }

  });