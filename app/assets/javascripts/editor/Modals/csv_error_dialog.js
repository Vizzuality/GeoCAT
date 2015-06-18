
  /**
   *  CSV error dialog class (after an upload)
   *
   */


  var CSVErrorDialog = View.extend({

    id:         'csv_error',
    tagName:    'div',

    events: {
      'click .continue':  '_addSources',
      'click .cancel':    'hide',
      'click .close':     'hide'
    },

    initialize: function() {
      _.bindAll(this, '_addSources');
      this.template = JST['editor/views/csv_error_dialog'];
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    _addSources: function(e) {
      if (e) e.preventDefault();

      if (this.occs) {
        addSourceToMap(this.occs, true, false);
        this.hide();
      }
    },

    setInfo: function(data, occs) {
      this.data = data;
      this.occs = occs;

      var errors_size = 0;
      var self = this;

      this.$('ul li').remove();

      if (!_.isEmpty(this.data.errors)) {
        $.each(this.data.errors.sources,function(pos,el){
          for (var i=0; i<el.length;i++) {
            errors_size++;
            self.$('ul').append('<li class="error">' + el[i].capitalize() + '</li>');
          }
        });
      }

      if (!_.isEmpty(this.data.warnings)) {
        $.each(this.data.warnings,function(pos,el){
          for (var i=0; i<el.length;i++) {
            self.$('ul').append('<li class="warning">' + el[i].capitalize() + '</li>');
          }
        });
      }

      if (errors_size>0) {
        this.$('h3').text('There are errors in your uploaded csv file');
        this.$('a.continue').hide();
      } else {
        this.$('h3').text('There are warnings in your uploaded csv file');
        this.$('a.continue').show();
      }

      this.show();
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function(e) {
      if (e) e.preventDefault();
      this.$el.fadeOut();
    }

  });