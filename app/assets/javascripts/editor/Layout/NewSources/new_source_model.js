
  /**
   *  New source model and collection :)
   *
   *  - New sources would need:
   *
   *    · name (name of the source type)
   *    · value (value of the query or the file set)
   *    · exts (extension of the files, if needed)
   *    · type (type of source, search or upload)
   *    · url (where to search the query or post a file)
   *    · text (message to apply)
   *    · state (how process is going, idel, loading, error or success)
   *    · selected (current view is selected or not)
   *
   */
  
  var NewSourceModel = Backbone.Model.extend({

    defaults: {
      name:     '',
      value:    '',
      type:     'search',
      exts:     [],
      url:      '',
      text:     'Add points from search',
      state:    'idle',
      selected: false
    }

  });


  var NewSourceCollection = Backbone.Collection.extend({

    model: NewSourceModel

  });