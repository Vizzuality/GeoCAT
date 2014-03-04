
  /**
   *  Analysis stuff
   *
   */

  
  // Set saved analysis
  // Show warning near to the undo-redo telling "This operations only belongs to this analysis"


  var AnalysisModel = Backbone.Model.extend({

    defaults: {
      active:   false,
      state:    "idle"
    }

  });


  var AnalysisView = View.extend({

    events: {
      'click #toggle_analysis': '_toggleAnalysis',
      'click .change':          '_toggleCellsize',
      'click #report':          '_downloadReport',
      'click #reduce':          '_toggleReduce'
    },

    initialize: function(opts) {
      this.model = new Backbone.Model({
        active: false,
        state:  "idle"
      });
      this.analysis_map = opts.analysis_map;
      this.analysis_data = opts.analysis_data;
      
      this._initViews();
      this._initBinds();
    },
    
    render: function() {

      // Set EOO
      this.$('li:eq(0)')
        .attr('class','')
        .addClass(this.analysis_map.get('EOO_type'))
        .find('p').html(
          this._addCommas(this.analysis_map.get('EOO')) + "km<sup>2</sup>"
        )

      // Set AOO
      this.$('li:eq(1)')
        .attr('class','')
        .addClass(this.analysis_map.get('AOO_type'))
        .find('p').html(
          this._addCommas(this.analysis_map.get('AOO')) + "km<sup>2</sup>"
        )

      // Change test
      this.$('p.change').html(
        "AOO based on " + this.analysis_data.get('celltype') + "<br/>" +
        "cell width (" + this.analysis_data.get('cellsize') + " km), " +
        "<a href='#/change'>change</a>"
      )

      // Buttons enabled?
      this.$('#report')[this.analysis_map.getActivePoints() > 0 ? 'removeClass' : 'addClass' ]('disabled');
      this.$('#reduce')[this.analysis_map.getActivePoints() > 2 ? 'removeClass' : 'addClass' ]('disabled');
      
      return this;
    },

    _initViews: function() {
      // Cellsize view
      this.cellsize = new CellsizeView({
        el:       this.$('div.cellsize'),
        analysis: this.analysis_data
      });
      this.addView(this.cellsize);

      // Reduce view
      // this.reduce = new ReduceView();
      // this.addView(this.reduce);
    },

    _initBinds: function() {
      _.bindAll(this, '_toggleAnalysis', '_toggleCellsize');

      this.model.bind('change',                       this.render, this);
      this.analysis_data.bind('change',               this.render, this);
      this.analysis_map.bind('change:active_points',  this.render, this);

      this.add_related_model(this.analysis_map);
      this.add_related_model(this.analysis_data);
    },

    _toggleCellsize: function(e) {
      this.killEvent(e);
      this.cellsize.toggle();
    },

    _toggleAnalysis: function() {
      var active = !this.model.get('active');
      
      this.model.set('active', active);

      // Animation
      $('div.sources')
        .stop()
        .animate({
          top: active ? '229px' : '85px'
        }, 'fast');

      // Close sources globally :( ?
      closeSources();

      // analysis and h3 disable state
      this.$el[ active ? 'removeClass' : 'addClass' ]('disabled');
      this.$('h3')[ active ? 'removeClass' : 'addClass' ]('disabled');

      // Analysis help :(
      $('#analysis_help').css(
        'background',
        active ? 'url(/assets/editor/analysis_help2.png) no-repeat -2px 0' : 'url(/assets/editor/analysis_help.png) no-repeat 0 0'
      );

      // Start or finish convex hull
      this.analysis_map[ active ? 'start' : 'finish' ]()

      // Analysis data animation
      this.$('div.analysis_data')
        .stop()
        .animate({
            height: active ? '144px' : '0'
          },
          'fast',
          function(ev){
            $(this).css('overflow','auto');
          }
        );

      // Toggle button animation
      this.$('#toggle_analysis span')
        .stop(true)
        .animate({
          backgroundPosition: active ? '-3px -25px' : '-26px -25px',
          backgroundColor:    active ? '#A6DD3A' : '#999999'
        }, 100);

      // Analysis buttons
      this.$('#report')[this.analysis_map.getActivePoints() > 0 ? 'removeClass' : 'addClass' ]('disabled');
      this.$('#reduce')[this.analysis_map.getActivePoints() > 2 ? 'removeClass' : 'addClass' ]('disabled');
    },

    _downloadReport: function(e) {
      if (e) e.preventDefault();

      if (this.analysis_map.get('active_points').length > 0) {
        downloadGeoCAT('print');  
      }
    },

    _toggleReduce: function(e) {
      if (e) e.preventDefault();

    },
    
    _addCommas: function(nStr) {
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    },


    // PUBLIC FUNCTIONS
    
    isVisible: function() {
      return this.model.get('active');
    }


  });



    // If there are more than 1 source,
    // you can print the report

    // _checkReport: function() {
    //   var $report = $('a#report');
    //   $report.unbind('click');

    //   if (this.collection.size() > 0) {
    //     $report
    //       .removeClass('disabled')
    //       .click(function(e){
    //         if (e) e.preventDefault();
    //         downloadGeoCAT('print');
    //       });
    //   } else {
    //     $report.addClass('disabled')
    //   }
    // }