  
  /**
   *  New Source upload item view
   *
   */


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

    _onProgress: function(){
      this.model.set('state', 'loading');
    },

    _onStart: function(){
      this.model.set('state', 'loading');
    },

    _onComplete: function(e, data) {
      console.log("completed!", data.result);
    },

    _onError: function(e, data) {
      var error = data.files && data.files[0] && data.files[0].error;

      if (error) {
        var msg = '';
        switch (error) {
          case 'acceptFileTypes':
            msg = 'File type not accepted';
            break;
          default:
            msg = 'There was an error :('
        }

        this.$('.error p').text(msg);
      }

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