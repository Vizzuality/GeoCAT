
  /**
   *  Layer model.
   *
   *  - It needs at least a url (xyz or kml type).
   *  - We could guess the type thanks to the url.
   *
   */

  var ModuleType = Backbone.Model.extend({

    defaults: {
      module: 'xyz',
      name:   'XYZ',
      slug:   '',
      value:  '',
      state:  'idle'
    }

  });


  /**
   *  New module collection.
   *
   */

  var ModuleTypes = Backbone.Collection.extend({

    model: ModuleType

  });