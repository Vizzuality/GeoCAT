
  /**
   *  Internet Explorer bar
   *
   */

  var IEbar = View.extend({

    className: 'ie_bar',

    events: {
      'click .close': 'hide'
    },

    initialize: function() {
      _.bindAll(this, 'hide');

      this.template = this.getTemplate('ie_bar');
    },

    render: function() {
      this.$el.html(this.template());
      this.toggleEditor();
      return this;
    },

    toggleEditor: function() {
      $('div#editor').toggleClass('ie');
    },

    hide: function(e) {
      if (e) e.preventDefault();

      this.$el.hide();
      this.toggleEditor();
      this.clean();
    }

  });