  
  /**
   *  New Source item view
   *
   */


  // Search type

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


















  // Upload type

  var NewUploadSourceItem = NewSearchSourceItem.extend({

    className:  'upload_source',

    options: {
      template: 'new_upload_source_item'
    },

    render: function() {
      NewSearchSourceItem.prototype.render.call(this);
      this._createUploader();
      return this;
    },

    _bindEvents: function(e) {
      _.bindAll(this, '_submit', '_onRequestError', '_onRequestSuccess',
        '_cancel', '_retry', '_onAdd', '_onStart', '_onProgress',
        '_onError', '_onComplete');
      
      this.model.bind('change:selected',  this._selectedSource, this);
      this.model.bind('change:state',     this._changeState, this);
    },

    _createUploader: function() {
      // Uploader
      this.$('.uploader form').fileupload({
        dropZone:               this.$('.non-dropzone'),
        url:                    this.model.get('url'),
        paramName:              'qqfile',
        progressInterval:       100,
        bitrateInterval:        500,
        autoUpload:             true,
        limitMultiFileUploads:  1,
        limitConcurrentUploads: 1,
        acceptFileTypes:        this.model.get('exts'),
        add:                    this._onAdd,
        progress:               this._onProgress,
        start:                  this._onStart,
        done:                   this._onComplete,
        fail:                   this._onError
      })
    },

    _onAdd: function(e, data) {
      if (data.originalFiles.length == 1) {
        this.xhr = data.submit();
      }
    },

    _onProgress: function(id, fileName, loaded, total){
      this.model.set('state', 'loading');
    },

    _onStart: function(id, fileName){
      this.model.set('state', 'loading');
    },

    _onComplete: function(id, fileName, responseJSON) {
      console.log("completed!");
    },

    _onError: function() {
      this.model.set('state', 'error');
    },

    _destroyUploader: function() {
      this.$('.uploader').fileupload('destroy');
    },

    clean: function() {
      this._abortRequest();
      this._destroyUploader();
      NewSearchSourceItem.prototype.clean.call(this);
    }

  });



  // Upload DWC type

  var NewUploadDWCSourceItem = NewUploadSourceItem.extend({

    _onComplete: function(id, fileName, responseJSON) {
      this.trigger("dwc", responseJSON);
    }

  });