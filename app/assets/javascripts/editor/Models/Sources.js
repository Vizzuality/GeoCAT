
  
  var MapSource = Backbone.Model.extend({

  });

  var MapSources = Backbone.Collection.extend({

    Model: MapSources

  });



  
  var SourceModel = Backbone.Model.extend({

    defaults: {
      query:    'user',
      position: 0,
      type:     'user',
      visible:  true,
      removed:  false,
      total:    0
    },

    initialize: function() {
      // We should store a global z-index per each layer,
      // not a global variable, would be fucking nice!

      // Create a mapPane per source
    }

  });



  
  var SourcesCollection = Backbone.Collection.extend({

    Model: SourceModel,

    comparator: function(m) {
      return -m.get('position')
    },

    sumUp: function(query, type) {

    },

    deduct: function(query, type) {

    },

    add: function(models, options) {
      Backbone.Collection.prototype.add.call(this, models, options);
    }

  });



  
  var SourceItem = View.extend({

    tagName:    'li',
    className:  'source',

    events: {

    },

    initialize: function() {
      this.modal.bind('change', this.render, this);
      this.template = JST['editor/views/source_item'];
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      
      // Set cid as data
      this.$el.attr('data-cid', this.cid);

      return this;
    }

  });
  


  
  var SourcesList = View.extend({

    initialize: function() {
      _.bindAll(this, '_orderSources');

      this.collection.bind('reset',   this.render,        this);
      this.collection.bind('add',     this._addSource,    this);
      this.collection.bind('remove',  this._removeSource, this);

      this.collection.bind('change',  this._countSources, this);
    },
    
    render: function() {
      this.clearSubViews();
      this.$el.html('');
      _.each(this.collection.last(this.collection.length).reverse(), this._addSource, this);
      this._makeSortable();

      return this;
    },

    _addSource: function(m, pos) {
      var l = new SourceItem({ model:m });
      this.$('ul').append(l.render().el);
      this.addView(l);
    },

    _removeSource: function(m) {},

    _makeSortable: function() {
      // Draggable!
      var self = this;
      this.$el.sortable({
        revert:     false,
        items:      'li',
        cursor:     'pointer',
        beforeStop: function(event,ui){
          $(ui.item).removeClass('moving');
        },
        update:     this._orderSources,
        start: function(event,ui){
          $(ui.item).addClass('moving');
        }
      });
    },

    _orderSources: function() {
      var self = this;
      // Loop layers and change position attribute
      this.$el.find('li').each(function(i,el){
        var cid = $(el).data('cid');
        self._subviews[cid].model.set('position', i, { silent: true });
      });

      // Triggering event for reordering layers
      this.collection.trigger('change', { changed: {} });
    }

  });

