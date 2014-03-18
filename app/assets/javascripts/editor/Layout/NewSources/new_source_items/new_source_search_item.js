  
  /**
   *  New Source search item view
   *
   */

  var NewSearchSourceItem = View.extend({

    _STATES: ['idle', 'loading', 'error', 'success'],

    tagName:    'li',
    className:  'search_source',

    options: {
      template: 'new_search_source_item'
    },

    events: {
      'click a.source': '_triggerSelect',
      'click a.cancel': '_cancel',
      'click a.retry':  '_retry',
      'submit form':    '_submit',
      'click a.import': '_import',
    },

    initialize: function() {
      this.template = JST['editor/views/new_sources/' + this.options.template];
      this._bindEvents();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    _bindEvents: function(e) {
      _.bindAll(this, '_submit', '_onRequestError', '_onRequestSuccess',
        '_cancel', '_retry');
      
      this.model.bind('change:selected',  this._selectedSource, this);
      this.model.bind('change:state',     this._changeState, this);
    },

    _triggerSelect: function(e) {
      if (e) e.preventDefault();

      this.trigger('selected', this.model);
    },

    _selectedSource: function() {
      var selected = this.model.get('selected');
      this.$el[ selected ? 'addClass' : 'removeClass' ]('selected');

      if (selected) {
        this.$('input.specie').focus();
      }
    },

    _submit: function(e) {
      this.killEvent(e);

      var value = this.$('input.specie').val();

      if (this._isValid(value)) {
        this.model.set('state', 'loading');
        this._sendRequest(value);
      }
    },

    _sendRequest: function(val) {
      this._abortRequest();

      this.xhr = $.getJSON(
        _.template(this.model.get('url'))({ value: val.replace(/ /g,'+') }),
        this._onRequestSuccess
      ).error(
        this._onRequestError
      );
    },

    _abortRequest: function() {
      if (this.xhr) this.xhr.abort();
    },

    _retry: function(e) {
      this.killEvent(e);
      this.model.set('state', 'idle');
    },

    _cancel: function(e) {
      this.killEvent(e);
      this._abortRequest();
      this.model.set('state', 'idle');
    },

    _import: function(e) {
      this.killEvent(e);
      this.trigger("import", this.model.get('value'));
    },

    _onRequestError: function(e) {
      this.$('.error p').text('Sorry, ' + this.model.get('name') + ' service is down');
      this.model.set('state', 'error');
      console.log(e);
    },

    _onRequestSuccess: function(r) {
      count = r[0] && r[0].points && r[0].points.length || 0;

      this.$('.success p').text(
        ((count>=1000)?'> ':'') + count + ((count == 1) ? " occ" : " occs") + ' found'
      );

      this.$('.success .import').text(count>=1000 ? 'import first 1000' : 'import');

      this.model.set({
        state: 'success',
        value: r[0]
      });
    },

    _isValid: function(str) {
      return str !== ""
    },

    _changeState: function() {
      var state = this.model.get('state');
      var self = this;

      _.each(this._STATES, function(s) {
        self.$('.' + s)[state === s ? 'show' : 'hide' ]();
      })
    },

    clean: function() {
      this._abortRequest();
      View.prototype.clean.call(this);
    }

  });