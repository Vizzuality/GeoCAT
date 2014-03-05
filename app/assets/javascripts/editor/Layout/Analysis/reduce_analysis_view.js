

  var ReduceAnalysisView = View.extend({

    className:  'reduce_analysis',
    tagName:    'div',

    events: {
      'click #apply-reduce':  '_applyReduce',
      'click #reset-reduce':  '_discardReduce'
    },

    initialize: function(opts) {
      this.template = this.getTemplate('reduce_analysis');
      this.analysis_map = opts.analysis_map;
      this.add_related_model(this.analysis_map);
      this.model = new Backbone.Model({ active: false });
    },

    render: function() {
      var obj = {
        AOO: parseFloat(this.AOO),
        EOO: parseFloat(this.EOO)
      };
      obj.reduce = this.analysis_map.toJSON();
      obj.reduce.EOO = parseFloat(obj.reduce.EOO);
      obj.reduce.AOO = parseFloat(obj.reduce.AOO);
      this.$el.html(this.template(obj));


      // Set EOO bars
      var isEOOReduced = obj.EOO >= obj.reduce.EOO;

      this.$('.stats.eoo .right')
        .removeClass('less more')
        .addClass(isEOOReduced ? 'less' : 'more')

      var EOO_per;
      if (isEOOReduced) {
        this.$('.stats.eoo .left .bar').css('height', '100%');
        EOO_per = Math.abs(Math.ceil((100 * (obj.EOO - obj.reduce.EOO)) / obj.EOO));
        this.$('.stats.eoo .right .bar').css('height', (100 - EOO_per) + '%');
      } else {
        this.$('.stats.eoo .right .bar').css('height', '100%');
        EOO_per = Math.abs(Math.ceil((100 * (obj.reduce.EOO - obj.EOO)) / obj.reduce.EOO));
        this.$('.stats.eoo .left .bar').css('height', (100 - EOO_per) + '%');
      }

      this.$('.stats.eoo .per')
        .removeClass('less more')
        .addClass(isEOOReduced ? 'less' : 'more')
        .text( (isEOOReduced ? '-' : '+') + EOO_per + '%')


      // Set AOO bars
      var isAOOReduced = obj.AOO >= obj.reduce.AOO;

      this.$('.stats.aoo .right')
        .removeClass('less more')
        .addClass(isAOOReduced ? 'less' : 'more')

      var AOO_per;
      if (isAOOReduced) {
        this.$('.stats.aoo .left .bar').css('height', '100%');
        AOO_per = Math.abs(Math.ceil((100 * (obj.AOO - obj.reduce.AOO)) / obj.AOO));
        this.$('.stats.aoo .right .bar').css('height', (100 - AOO_per) + '%');
      } else {
        this.$('.stats.aoo .right .bar').css('height', '100%');
        AOO_per = Math.abs(Math.ceil((100 * (obj.reduce.AOO - obj.AOO)) / obj.reduce.AOO));
        this.$('.stats.aoo .left .bar').css('height', (100 - AOO_per) + '%');
      }

      this.$('.stats.aoo .per')
        .removeClass('less more')
        .addClass(isAOOReduced ? 'less' : 'more')
        .text( (isAOOReduced ? '-' : '+') + AOO_per + '%')

      return this;
    },

    _initBinds: function() {
      this.analysis_map.bind('change:AOO change:EOO',  this.render, this);
    },

    _destroyBinds: function() {
      this.analysis_map.unbind('change:AOO change:EOO',  this.render, this);
    },

    _applyReduce: function(e) {
      if (e) e.preventDefault();
      this._destroyBinds();
      this.trigger('apply', this);
      this.hide();
    },

    _discardReduce: function(e) {
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