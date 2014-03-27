
  /**
   *  WMS services model and collection
   *
   */


  var WMSLayer = Backbone.Model.extend({

    defaults: {}

  });


  var WMSLayers = Backbone.Collection.extend({

    _URL: '/api/wms.json',

    model: WMSLayer,

    setURL: function(url) {
      this.wms_url = url;

      return this;
    }, 

    url: function() {
      var url = this.wms_url;

      // If the user didn't provided the necessary params, let's add them
      var hasCapabilities = url.toLowerCase().indexOf("request=getcapabilities") != -1;
      var hasService = url.toLowerCase().indexOf("service=wms") != -1;

      if (!hasCapabilities && !hasService) {
        url = url.replace(/\?.*/,''); // strip params
        url += "?request=GetCapabilities&service=WMS";
      }

      return this._URL + '?url=' + encodeURIComponent(url);
    },

    parse: function(r) {
      return r.layers
    }

  });