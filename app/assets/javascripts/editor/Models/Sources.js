
  // Create a new pane for this source
  var SourcePane = View.extend({

    tagName: 'div',

    initialize: function(opts) {
      this.options = opts;
      this.render();
    },

    render: function() {
      var overlay = this.getOverlayPane();
      var style = $(overlay).attr('style');
      this.$el.attr('style', style);
      this.$el.insertBefore(overlay);
      this.removeFloatPane();
      return this;
    },

    getOverlayPane: function() {
      var ov = this.ov = new google.maps.OverlayView(); 
      ov.onAdd = function(){}; 
      ov.draw = function(){}; 
      ov.onRemove = function(){}; 
      ov.setMap(this.options.map);
      return ov.getPanes().overlayMouseTarget;
    },

    removeFloatPane: function() {
      this.ov.setMap(null);
      delete this.ov;
    }

  });



  // Sort custom map panes
  var MapSources = Backbone.Model.extend({

    defaults: {
      sources:  {},
      map:      {}
    },

    _START_INDEX: 105,

    initialize: function() {
      var sources = this.get('sources');
      sources.bind('change', this._changeSource, this);
      sources.bind('remove add reset', this._managePanes, this);
    },

    _changeSource: function(m) {
      if (m.changed && m.changed.position !== undefined) {
        this._managePanes();
      }
    },

    _managePanes: function() {
      // Order sources
      var i = this.get('sources').size();
      var self = this;

      this.get('sources').each(function(s) {
        var pane = s.getPane();
        var pos = s.get('position');
        if (pane) {
          pane.style.zIndex = i + self._START_INDEX - pos;
          i--;
        }
      });

      // Float pane on the top
      var float_pane = this.getFloatPane();
      float_pane.style.zIndex = this._START_INDEX + this.get('sources').size() + 1;
    },

    getFloatPane: function() {
      var ov = this.ov = new google.maps.OverlayView(); 
      ov.onAdd = function(){}; 
      ov.draw = function(){}; 
      ov.onRemove = function(){};
      ov.setMap(this.get('map'));
      return ov.getPanes().floatPane;
    },

    removeFloatPane: function() {
      if (this.ov) {
        this.ov.setMap(null);
        delete this.ov;  
      }
    }

  });



  
  var SourceModel = Backbone.Model.extend({

    defaults: {
      query:    'user',
      position: 0,
      type:     'user',
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

    sumUp: function(query, type) {
      // Search model
      var m = this.find(function(m) {
        return m.get('query') == query && m.get('type') == type
      });

      // If it doesn't exist, let's create it!
      if (!m) {
        m = new SourceModel({ type: type, query: query }, { map: this.options.map });
        this.add(m);
      } else {
        // If it does exist, add new one to the total
        var t = m.get('total');
        m.set('total', t+1);
      }
    },

    deduct: function(query, type) {
      // Search model
      var m = this.find(function(m) {
        return m.get('query') == query && m.get('type') == type
      });

      // If you can't find it, please console!
      if (!m) {
        console.log('Ouch, source with query ' + query + ' and type ' + type + ' doesn\'t exist' );
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



  
  var SourceItem = View.extend({

    tagName:    'li',
    className:  'source',

    events: {
      'click .visible_specie':  '_toggleVisibility',
      'click .delete_specie':   '_deleteSpecie',
      'click .merge_specie':    'killEvent'
    },

    initialize: function() {
      _.bindAll(this, '_toggleVisibility', '_deleteSpecie');
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.clean, this);
      this.template = JST['editor/views/source_item'];
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      
      // Set cid as data
      this.$el.attr('data-cid', this.cid);

      return this;
    },

    _deleteSpecie: function(e) {
      if (e) e.preventDefault();
      this.trigger('delete', this.model, this);
    },

    _toggleVisibility: function(e) {
      if (e) e.preventDefault();

      var visible = this.model.get('visible');
      this.model.set('visible', !visible);

      this.$('.visible_specie')[ visible ? 'removeClass' : 'addClass' ]('on');
      hideAll(this.model.get('query'), this.model.get('type'), this.model.get('visible')); // Arg! :(
    }

  });
  

  var DeleteSourceWarning = View.extend({

    className:  'delete_source',
    tagName:    'div',

    events: {
      'click .yes':     '_removeSource',
      'click .cancel':  'hide'
    },

    initialize: function(opts) {
      this.view = opts.view;
      _.bindAll(this, '_removeSource');
      this.template = JST['editor/views/delete_source_warning'];
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    _removeSource: function(e) {
      if (e) e.preventDefault();
      this.model.destroy();
      this.hide();
    },

    show: function(e) {
      if (e) e.preventDefault();

      var pos = this.view.$el.position();

      this.$el
        .css({
          top:        pos.top - 4 + 'px',
          marginLeft: '+=10px',
          opacity:    0,
          display:    'block'
        })
        .animate({
          marginLeft: '-=10px',
          opacity:    1
        }, 150);
    },

    hide: function(e) {
      if (e) e.preventDefault();

      var self = this;

      this.$el
        .animate({
          marginLeft: '+=10px',
          opacity:    0
        }, 150, function() {
          self.clean()
        });
    }

  })

  
  var SourcesView = View.extend({

    events: {
      'click .add_source a': '_onAddSource'
    },

    initialize: function() {
      _.bindAll(this, '_orderSources');

      this.collection.bind('reset',   this.render,        this);
      this.collection.bind('add',     this._addSource,    this);
      this.collection.bind('remove',  this._removeSource, this);

      this.collection.bind('change',  this._countSources, this);
    },
    
    render: function() {
      this._destroySorteable();
      this.clearSubViews();
      _.each(this.collection.last(this.collection.length).reverse(), this._addSource, this);
      this._makeSortable();
      return this;
    },

    _addSource: function(m, pos) {
      var l = new SourceItem({ model:m });
      $(l.render().el).insertBefore(this.$('ul .add_source'));
      l.bind('delete', this._showDeleteWarning, this);
      this.addView(l);

      this._countSources();
      this._checkReport();
    },

    _removeSource: function(m) {
      this._countSources();
      this._checkReport();
    },

    _destroySorteable: function() {
      this.$('ul').sortable('destroy');
    },

    _makeSortable: function() {
      // Draggable!
      var self = this;
      this.$('ul').sortable({
        revert:     false,
        items:      'li',
        cursor:     'pointer',
        cancel:     '.add_source',
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
      this.$el.find('li').not('.add_source').each(function(i,el){
        var cid = $(el).data('cid');
        self._subviews[cid].model.set('position', i, { silent: true });
      });

      // Triggering event for reordering layers
      this.collection.trigger('change', { changed: { position: "" } });
    },

    _countSources: function() {
      var count = this.collection.size();
      var msg = '';

      if (count == 0) {
        msg = 'NO SPECIES IN YOUR ASSESSMENT'
      } else if (count == 1) {
        msg = '1 DATA SOURCE';
      } else {
        msg = count + ' DATA SOURCES';
      }

      this.$('h3').text(msg);
    },

    _onAddSource: function(e) {
      if (e) e.preventDefault();
      $('#add_source_button').click()
    },

    _showDeleteWarning: function(m, view) {
      // Remove previous warning
      this._hideDeleteWarning();

      // Show the new one
      this.delete = new DeleteSourceWarning({
        model:  m,
        view:   view
      });
      this.$el.append(this.delete.render().el);
      this.delete.show();
    },

    _hideDeleteWarning: function() {
      if (this.delete) this.delete.hide();
    },

    // If there are more than 1 source,
    // you can print the report
    _checkReport: function() {
      var $report = $('a#report_button');
      $report.unbind('click');

      if (this.collection.size() > 0) {
        $report
          .removeClass('disabled')
          .click(function(e){
            if (e) e.preventDefault();
            downloadGeoCAT('print');
          });
      } else {
        $report.addClass('disabled')
      }
    }

  });