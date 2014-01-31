
  /**
   *  Welcome dialog class
   *
   */


  var WelcomeDialog = View.extend({

    id:         'welcome',
    className:  'dialog',
    tagName:    'div',

    events: {
      'click .upload_data': '_addSource',
      'click .import_data': '_addSource',
      'click .add_points':  '_addPoints',
      'click .close':       'hide'
    },

    initialize: function() {
      this.template = JST['editor/views/welcome_dialog'];
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    _addSource: function(e) {
      if (e) e.preventDefault();
      $('#add_source_button').trigger('click');
    },

    _addPoints: function(e) {
      if (e) e.preventDefault();
      $('div.center-tool div.left a.add').trigger('click');
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function(e) {
      if (e) e.preventDefault();

      var self = this;
      this.$el.fadeOut(function() {
        self.clean();
      });
    }

  });