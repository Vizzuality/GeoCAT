
  /**
   *  Reduction analysis view
   *
   */
  

  var ReductionAnalysisView = View.extend({

    className:  'reduction_analysis',
    tagName:    'div',

    events: {
      'click #apply-reduction':  '_applyReduction',
      'click #reset-reduction':  '_discardReduction'
    },

    initialize: function(opts) {
      this.template = this.getTemplate('reduction_analysis');
      this.analysis_map = opts.analysis_map;
      this.add_related_model(this.analysis_map);
      this.model = new Backbone.Model({ active: false });
    },

    render: function() {
      var obj = {
        AOO: parseFloat(this.AOO),
        EOO: parseFloat(this.EOO)
      };
      obj.reduction = this.analysis_map.toJSON();
      obj.reduction.EOO = parseFloat(obj.reduction.EOO);
      obj.reduction.AOO = parseFloat(obj.reduction.AOO);
      this.$el.html(this.template(obj));


      // Set EOO bars
      var isEOOReducted = obj.EOO >= obj.reduction.EOO;

      this.$('.stats.eoo .right')
        .removeClass('less more')
        .addClass(isEOOReducted ? 'less' : 'more')

      var EOO_per;
      if (isEOOReducted) {
        this.$('.stats.eoo .left .bar').css('height', '100%');
        EOO_per = Math.abs(Math.ceil((100 * (obj.EOO - obj.reduction.EOO)) / obj.EOO));
        this.$('.stats.eoo .right .bar').css('height', (100 - EOO_per) + '%');
      } else {
        this.$('.stats.eoo .right .bar').css('height', '100%');
        EOO_per = Math.abs(Math.ceil((100 * (obj.reduction.EOO - obj.EOO)) / obj.reduction.EOO));
        this.$('.stats.eoo .left .bar').css('height', (100 - EOO_per) + '%');
      }

      this.$('.stats.eoo .per')
        .removeClass('less more')
        .addClass(isEOOReducted ? 'less' : 'more')
        .text( (isEOOReducted ? '-' : '+') + EOO_per + '%')


      // Set AOO bars
      var isAOOReduction = obj.AOO >= obj.reduction.AOO;

      this.$('.stats.aoo .right')
        .removeClass('less more')
        .addClass(isAOOReduction ? 'less' : 'more')

      var AOO_per;
      if (isAOOReduction) {
        this.$('.stats.aoo .left .bar').css('height', '100%');
        AOO_per = Math.abs(Math.ceil((100 * (obj.AOO - obj.reduction.AOO)) / obj.AOO));
        this.$('.stats.aoo .right .bar').css('height', (100 - AOO_per) + '%');
      } else {
        this.$('.stats.aoo .right .bar').css('height', '100%');
        AOO_per = Math.abs(Math.ceil((100 * (obj.reduction.AOO - obj.AOO)) / obj.reduction.AOO));
        this.$('.stats.aoo .left .bar').css('height', (100 - AOO_per) + '%');
      }

      this.$('.stats.aoo .per')
        .removeClass('less more')
        .addClass(isAOOReduction ? 'less' : 'more')
        .text( (isAOOReduction ? '-' : '+') + AOO_per + '%')

      return this;
    },

    _initBinds: function() {
      this.analysis_map.bind('change:AOO change:EOO',  this.render, this);
    },

    _destroyBinds: function() {
      this.analysis_map.unbind('change:AOO change:EOO',  this.render, this);
    },

    _applyReduction: function(e) {
      if (e) e.preventDefault();
      this._destroyBinds();
      this.trigger('apply', this);
      this.hide();
    },

    _discardReduction: function(e) {
      if (e) e.preventDefault();
      this._destroyBinds();
      this.trigger('discard', this);
      this.hide();
    },

    open: function(EOO, AOO) {
      this.EOO = EOO;
      this.AOO = AOO;

      this._initBinds();
      this.render();
      this.show();
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function() {
      this.$el.fadeOut();
    }

  })