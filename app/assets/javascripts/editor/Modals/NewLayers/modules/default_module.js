
  /**
   *  Default module pane in
   *  new layer dialog
   *
   */


  var NewLayerModule = View.extend({

    options: {
      template: 'xyz'
    },

    initialize: function(opts) {
      this.template = this.getTemplate('new_layer_dialog/modules/' + this.options.template);
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    reset: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      console.log("reset function is not defined :(");
    },

    submit: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      console.log("submit function is not defined :(");
    }

  })