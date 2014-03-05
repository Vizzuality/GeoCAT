
  /**
   *  Analysis stuff
   *
   */

  var AnalysisModel = Backbone.Model.extend({

    defaults: {
      active:   false,
      state:    "idle"
    }

  });


  var AnalysisView = View.extend({

    _MIN_POINTS_ANALYSIS: 3,

    events: {
      'click #toggle_analysis': '_toggleAnalysis',
      'click .change':          '_toggleCellsize',
      'click #report':          '_downloadReport',
      'click #reduce':          '_startReduce'
    },

    initialize: function(opts) {
      _.bindAll(this, '_toggleAnalysis', '_toggleCellsize', '_startReduce');

      this.model = new Backbone.Model({
        active: false,
        state:  "idle"
      });
      this.analysis_map = opts.analysis_map;
      this.analysis_data = opts.analysis_data;
      
      this._initViews();
      this._initBinds();

      this.add_related_model(this.analysis_map);
      this.add_related_model(this.analysis_data);
    },
    
    render: function() {

      // Set EOO
      this.$('li:eq(0)')
        .attr('class','')
        .addClass(this.analysis_map.get('EOO_type'))
        .find('p').html(
          (this.analysis_map.get('EOO')).toString().addCommas() + "km<sup>2</sup>"
        )

      // Set AOO
      this.$('li:eq(1)')
        .attr('class','')
        .addClass(this.analysis_map.get('AOO_type'))
        .find('p').html(
          (this.analysis_map.get('AOO')).toString().addCommas() + "km<sup>2</sup>"
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
      this.reduce = new ReduceAnalysisView({
        analysis_map: this.analysis_map
      });
      this.reduce.bind('apply',   this._applyReduce,    this);
      this.reduce.bind('discard', this._discardReduce,  this);
      $('body').append(this.reduce.el);
      this.addView(this.reduce);
    },

    _initBinds: function() {
      this.model.bind('change',                       this.render, this);
      this.analysis_data.bind('change',               this.render, this);
      this.analysis_map.bind('change:active_points',  this.render, this);
    },

    _destroyBinds: function() {
      this.model.unbind('change',                       this.render, this);
      this.analysis_data.unbind('change',               this.render, this);
      this.analysis_map.unbind('change:active_points',  this.render, this);
    },

    _toggleCellsize: function(e) {
      this.killEvent(e);
      this.cellsize.toggle();
    },

    _toggleAnalysis: function() {
      // Reduce analysis running? no again please!
      if (reduce_analysis) return false;

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

      // Reduce analysis running?
      if (reduce_analysis) return false;

      if (this.analysis_map.get('active_points').length > 0) {
        downloadGeoCAT('print');  
      }
    },

    _startReduce: function(e) {
      if (e) e.preventDefault();

      // Reduce analysis running? no again please!
      if (reduce_analysis) return false;

      // If there are more than X active points, go ahead!
      if (this.analysis_map.get('active_points').length < this._MIN_POINTS_ANALYSIS) return false;

      // App with reduce analysis on! :(
      reduce_analysis = true;

      // Unbind EOO & AOO changes
      this._destroyBinds();

      // Show reduce
      this.reduce.open(this.analysis_map.get('EOO'), this.analysis_map.get('AOO'));

      // Undo-redo operations in mode reduce!

      // Analysis map in mode reduce!
      this.analysis_map.reduce();

      // Show message near undo-redo operations about this analysis

      // Block analysis (mamufas?), sources (mamufas?) and several buttons
      this._showReduceMamufas();

      $(document).trigger('start_reduce');
    },

    _discardReduce: function() {
      reduce_analysis = false;
      this.analysis_map.discardReduce();
      this._hideReduceMamufas();
      this._initBinds();

      $(document).trigger('finish_reduce');
    },

    _applyReduce: function() {
      reduce_analysis = false;
      this.analysis_map.applyReduce();
      this._hideReduceMamufas();
      this._initBinds();
      this.render();

      $(document).trigger('finish_reduce');
    },


    _showReduceMamufas: function() {
      this.$el.append('<div class="reduce_mamufas"></div>');
    },

    _hideReduceMamufas: function() {
      this.$el.find('div.reduce_mamufas').remove();
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