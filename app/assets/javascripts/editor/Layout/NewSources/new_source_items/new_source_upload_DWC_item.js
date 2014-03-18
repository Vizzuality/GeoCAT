  
  /**
   *  New Source upload DWC type view
   *
   */


  var NewUploadDWCSourceItem = NewUploadSourceItem.extend({

    _onComplete: function(e, data) {
      this.trigger("dwc", data.result);
    }

  });