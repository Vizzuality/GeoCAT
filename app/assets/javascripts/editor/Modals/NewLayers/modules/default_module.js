

  var NewLayerModule = View.extend({

    options: {
      template: 'xyz'
    },

    initialize: function(opts) {
      this.template = this.getTemplate('new_layer_dialog/modules/' + this.options.template);
      this.model = new Backbone.Model({
        value: '',
        state: ''
      })
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    submit: function(e) {
      if (e && e.preventDefault) e.preventDefault();
      console.log("submit function is not defined :(");
    }

  })