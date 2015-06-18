
  /**
   *  Delete source warning dialog! (view)
   *
   */


  var DeleteSourceWarning = View.extend({

    className:  'delete_source',
    tagName:    'div',

    events: {
      'click .yes':     '_removeSource',
      'click .cancel':  'hide'
    },

    initialize: function(opts) {
      this.view = opts.view;
      _.bindAll(this, '_removeSource');
      this.template = JST['editor/views/delete_source_warning'];
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    _removeSource: function(e) {
      if (e) e.preventDefault();
      this.model.trigger('delete', this.model, this);
      this.hide();
    },

    show: function(e) {
      if (e) e.preventDefault();

      var pos = this.view.$el.position();

      this.$el
        .css({
          top:        pos.top - 22 + 'px',
          left:       '+=10px',
          opacity:    0,
          display:    'block'
        })
        .animate({
          left:       '-=10px',
          opacity:    1
        }, 150);
    },

    hide: function(e) {
      if (e) e.preventDefault();

      var self = this;

      this.$el
        .animate({
          marginLeft: '+=10px',
          opacity:    0
        }, 150, function() {
          self.clean()
        });
    }

  })