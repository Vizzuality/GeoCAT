
  /**
   *  Sources view (it includes sources list)
   *
   */
  
  var SourcesView = View.extend({

    events: {
      'click .add_source a': '_onAddSource'
    },

    initialize: function() {
      this._initBinds();
    },
    
    render: function() {
      this._destroySorteable();
      this.clearSubViews();
      _.each(this.collection.last(this.collection.length).reverse(), this._addSource, this);
      this._makeSortable();
      return this;
    },

    _initBinds: function() {
      _.bindAll(this, '_orderSources', '_disableSources', '_enableSources');

      this.collection.bind('reset',   this.render,        this);
      this.collection.bind('add',     this._addSource,    this);
      this.collection.bind('remove',  this._removeSource, this);
      this.collection.bind('change',  this._countSources, this);

      var self = this;
      $(document).bind('start_reduce', function() { self._disableSources() });
      $(document).bind('finish_reduce', function() { self._enableSources() });
    },

    _addSource: function(m, pos) {
      var l = new SourceItem({ model:m });
      this.$('ul').prepend(l.render().el);
      l.bind('delete', this._showDeleteWarning, this);
      this.addView(l);

      this._countSources();
    },

    _removeSource: function(m) {
      this._countSources();
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

    _enableSources: function() {
      this.$el.find('div.sources_mamufas').remove();
    },

    _disableSources: function() {
      this.$el.append('<div class="sources_mamufas"></div>');
      
    }

  });