
		var report_name;  							/*** Report name ***/
		var state = 'select';						// State of the map & application
    var reduction_analysis = false; // Is reduction analysis running?

		var points;								      // Points operations for each specie
		var convex_hull;								// Convex Hull model Object for calculating the polygon
		var actions;										// UnredoOperations model Object for actions made by the user.
		var merge_object; 							// MergeOperations model Object for recover points from server like GBIF or Flickr
    var layers;                     // LayersCustomization variable

    var modals = {}                 // Modal dialogs available


    $(function() {

      var App = Backbone.View.extend({

        el: document.body,

        events: {
          'click a.layer': '_openLayers'
        },

        initialize: function() {
          _.bindAll(this, '_startApp');

          mainApp();
          createMap();
          startSources();

          google.maps.event.addListenerOnce(map, 'idle', this._startApp);
        },

        _startApp: function() {
          this._initModels();
          this._initBinds();
          this._initViews();  
        },

        _initBinds: function() {
          _.bindAll(this, '_openLayers');
        },

        _initModels: function() {
          // Create custom layers collection
          layers = new Layers();

          // Model to control custom layers
          this.map_layers = new MapLayers({
            layers: layers,
            map:    map
          });

          // Add custom layers saved previously
          if (!_.isEmpty(upload_information) && upload_information.data) {
            layers.reset(upload_information.data.layers);
          }

          // Get default custom layers
          layers.getDefaultLayers();
        },

        _initViews: function() {
          
          // Create custom layer dialog
          this.layers_view = new LayersView({ collection: layers });
          this.$el.append(this.layers_view.render().el);

          // Adding DWC points?
          if (upload_information && ( upload_information.species || ( upload_information.errors && !_.isEmpty(upload_information.errors)))) {
            var species_selector = new SpecieSelector(upload_information);
          }

          // IE?
          if ($.browser.msie) {
            var ie = new IEbar();
            this.$el.append(ie.render().el);
          }

          // Create welcome window
          modals.welcome = new WelcomeDialog();
          this.$('div.center-map').append(modals.welcome.render().el);

          //if the application comes through an upload file
          if (upload_information.data && upload_information.data.sources!=null) {
            report_name = upload_information.data.reportName;
            this.$('div.header h1 p').text(report_name);
            this.$('div.header h1 sup').text('saved');
            document.title = "GeoCAT - " + report_name;
            changeApplicationTo(2);
            uploadGeoCAT(upload_information);
          } else if (_.isEmpty(upload_information)) {
            modals.welcome.show();
            // Trick to hide welcome window if user clicks off this container
            $('body').click(function(event) {
              if (!$(event.target).closest('#welcome').length) {
                modals.welcome.hide();
                // $('body').unbind('click');
              };
            });
          }
        },

        _openLayers: function(e) {
          if (e) e.preventDefault();
          var isVisible = this.layers_view.isVisible();
          this.layers_view[ isVisible ? 'hide' : 'show'](e);
        }

      });

      // Application!
      window.app = new App();

    });