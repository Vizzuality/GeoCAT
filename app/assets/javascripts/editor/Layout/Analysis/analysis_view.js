
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
      // 'click #report':          '_downloadReport',
      'click #reduction':       '_startReduction'
    },

    initialize: function(opts) {
      _.bindAll(this, '_toggleAnalysis', '_toggleCellsize', '_startReduction');

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
          (this.analysis_map.get('EOO')).toString().addCommas() + " km<sup>2</sup>"
        )

      // Set AOO
      this.$('li:eq(1)')
        .attr('class','')
        .addClass(this.analysis_map.get('AOO_type'))
        .find('p').html(
          (this.analysis_map.get('AOO')).toString().addCommas() + " km<sup>2</sup>"
        )

      // Change test
      this.$('p.change').html(
        "AOO based on " + this.analysis_data.get('celltype') + "<br/>" +
        "cell width (" + this.analysis_data.get('cellsize') + " km), " +
        "<a href='#/change'>change</a>"
      )

      // Buttons enabled?
      // this.$('#report')[this.analysis_map.getActivePoints() > 0 ? 'removeClass' : 'addClass' ]('disabled');
      this.$('#reduction')[this.analysis_map.getActivePoints() > 2 ? 'removeClass' : 'addClass' ]('disabled');

      return this;
    },

    _initViews: function() {
      // Cellsize view
      this.cellsize = new CellsizeView({
        el:       this.$('div.cellsize'),
        analysis: this.analysis_data
      });
      this.addView(this.cellsize);

      // Reduction view
      this.reduction = new ReductionAnalysisView({
        analysis_map: this.analysis_map
      });
      this.reduction.bind('apply',   this._applyReduction,    this);
      this.reduction.bind('discard', this._discardReduction,  this);
      $('body').append(this.reduction.el);
      this.addView(this.reduction);
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
      // Reduction analysis running? no again please!
      if (reduction_analysis) return false;

      var active = !this.model.get('active');

      this.model.set('active', active);

      // Animation
      $('div.sources')
        .stop()
        .animate({
          top: active ? '229px' : '85px'
        }, 'fast');


      // analysis and h3 disable state
      this.$el[ active ? 'removeClass' : 'addClass' ]('disabled');
      this.$('h3')[ active ? 'removeClass' : 'addClass' ]('disabled');

      // Analysis help :(
      $('#analysis_help').css(
        'background',
        active ? 'url(/assets/editor/analysis_help2.png) no-repeat -2px 0' : 'url(/assets/editor/analysis_help.png) no-repeat 0 0'
      );

      // Start or finish convex hull
      this.analysis_map[ active ? 'start' : 'finish' ](true);

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
      // this.$('#report')[this.analysis_map.getActivePoints() > 0 ? 'removeClass' : 'addClass' ]('disabled');
      this.$('#reduction')[this.analysis_map.getActivePoints() > 2 ? 'removeClass' : 'addClass' ]('disabled');
    },

    _downloadReport: function(e) {
      if (e) e.preventDefault();

      // Reduction analysis running?
      if (reduction_analysis) return false;

      if (this.analysis_map.get('active_points').length > 0) {
        downloadGeoCAT('print');
      }
    },

    _startReduction: function(e) {
      if (e) e.preventDefault();

      // Reduction analysis running? no again please!
      if (reduction_analysis) return false;

      // If there are more than X active points, go ahead!
      if (this.analysis_map.get('active_points').length < this._MIN_POINTS_ANALYSIS) return false;

      // App with reduction analysis on! :(
      reduction_analysis = true;

      // Unbind EOO & AOO changes
      this._destroyBinds();

      // Show reduction
      this.reduction.open(this.analysis_map.get('EOO'), this.analysis_map.get('AOO'));

      // Undo-redo operations in mode reduction!
      actions.startReduction();

      // Analysis map in mode reduction!
      this.analysis_map.reduction();

      // Show message near undo-redo operations about this analysis

      // Block analysis (mamufas?), sources (mamufas?) and several buttons
      this._showReductionMamufas();

      $(document).trigger('start_reduction');
    },

    _discardReduction: function() {
      reduction_analysis = false;
      this.analysis_map.discardReduction();
      actions.discardReduction();
      this._hideReductionMamufas();
      this._initBinds();

      $(document).trigger('finish_reduction');
    },

    _applyReduction: function() {
      reduction_analysis = false;
      this.analysis_map.applyReduction();
      actions.applyReduction();
      this._hideReductionMamufas();
      this._initBinds();
      this.render();

      $(document).trigger('finish_reduction');
    },


    _showReductionMamufas: function() {
      this.$el.append('<div class="reduction_mamufas"></div>');
    },

    _hideReductionMamufas: function() {
      this.$el.find('div.reduction_mamufas').remove();
    },


    // PUBLIC FUNCTIONS

    isVisible: function() {
      return this.model.get('active');
    }

  });