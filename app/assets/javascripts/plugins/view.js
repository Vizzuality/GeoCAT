
  var View = Backbone.View.extend({

    options: {},

    constructor: function(options) {
      this._models = [];
      this._subviews = {};
      this.options = _.defaults(options, this.options);
      Backbone.View.call(this, options);
      this._created_at = new Date();
    },

    add_related_model: function(m) {
      if(!m) throw "added non valid model"
      this._models.push(m);
    },

    addView: function(v) {
      this._subviews[v.cid] = v;
      v._parent = this;
    },

    removeView: function(v) {
      delete this._subviews[v.cid];
    },

    clearSubViews: function() {
      _(this._subviews).each(function(v) {
        v.clean();
      });
      this._subviews = {};
    },

    killEvent: function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
    },

    /**
     * this methid clean removes the view
     * and clean and events associated. call it when
     * the view is not going to be used anymore
     */
    clean: function() {
      var self = this;
      this.trigger('clean');
      this.clearSubViews();
      // remove from parent
      if(this._parent) {
        this._parent.removeView(this);
        this._parent = null;
      }
      this.remove();
      this.unbind();
      // remove this model binding
      if (this.model && this.model.unbind) this.model.unbind(null, null, this); 
      // remove model binding
      _(this._models).each(function(m) {
        m.unbind(null, null, self);
      });
      this._models = [];
      return this;
    },

    /**
     * utility methods
     */

    getTemplate: function(tmpl) {
      return JST['editor/views/' + tmpl];
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    }

  });