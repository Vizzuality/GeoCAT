
  /**
   *  Tabpane ready for several options
   *  in a dialog :)
   */


  var Tabs = View.extend({

    events: {
      'click': '_click'
    },

    initialize: function(opts) {
      _.bindAll(this, 'activate');
      this.preventDefault = false;
      
      if (opts.slash)
        this.options = { slash: opts.slash };
    },

    activate: function(name) {
      this.$('a').removeClass('selected');
      this.$('a[href$="#'+ ((this.options.slash) ? '/' : '') + name + '"]').addClass('selected');
    },

    desactivate: function(name) {
      this.$('a[href$="#' + ((this.options.slash) ? '/' : '') + name + '"]').removeClass('selected');
    },

    disable: function(name) {
      this.$('a[href$="#' + ((this.options.slash) ? '/' : '') + name + '"]').addClass('disabled');
    },

    enable: function(name) {
      this.$('a[href$="#' + ((this.options.slash) ? '/' : '') + name + '"]').removeClass('disabled');
    },

    getTab: function(name) {
      return this.$('a[href$="#' + ((this.options.slash) ? '/' : '') + name + '"]');
    },

    disableAll: function() {
      this.$('a').addClass('disabled');
    },

    removeDisabled: function() {
      this.$('.disabled').parent().remove();
    },

    _click: function(e) {
      if (e && this.preventDefault) e.preventDefault();

      var
      t    = $(e.target).closest('a'),
      href = t.attr('href');

      if (!t.hasClass('disabled') && href) {
        var name = href.replace('#/', '#').split('#')[1];
        this.trigger('click', name);
      }
    },

    linkToPanel: function(panel) {
      this.preventDefault = true;
      panel.bind('tabEnabled', this.activate, this);
      this.bind('click', panel.active, panel);
    }

  });




  var TabPane = View.extend({

    initialize: function() {
      this.tabs = {};
      this.activeTab  = null;
      this.activePane = null;
    },

    render: function() {
      return this;
    },

    addTab: function(name, view, options) {
      options = options || { active: true };
      if(this.tabs[name] !== undefined) {
        console.log(name + " already added");
      } else {
        this.tabs[name] = view.cid;
        this.addView(view);
        if(options.after !== undefined) {
          var e = this.$el.children()[options.after];
          view.$el.insertAfter(e);
        } else if(options.prepend) {
          this.$el.prepend(view.el);
        } else {
          this.$el.append(view.el);
        }
        this.trigger('tabAdded', name, view);
        if(options.active) {
          this.active(name);
        } else {
          view.hide();
        }
      }
    },

    getPreviousPane: function() {
      var tabs  = _.toArray(this.tabs);
      var panes = _.toArray(this._subviews);

      var i = _.indexOf(tabs, this.activePane.cid) - 1;
      if (i < 0) i = panes.length - 1;

      return panes[i];
    },

    getNextPane: function() {
      var tabs  = _.toArray(this.tabs);
      var panes = _.toArray(this._subviews);

      var i = 1 + _.indexOf(tabs, this.activePane.cid);
      if (i > panes.length - 1) i = 0;

      return panes[i];
    },

    getPane: function(name) {
      var vid = this.tabs[name];
      return this._subviews[vid];
    },

    getActivePane: function() {
      return this.activePane;
    },

    size: function() {
      return _.size(this.tabs);
    },

    removeTab: function(name) {
      if (this.tabs[name] !== undefined) {
        var vid = this.tabs[name];
        this._subviews[vid].clean();
        delete this.tabs[name];

        if (this.activeTab == name) {
          this.activeTab = null;
        }

        if (_.size(this.tabs)) {
          this.active(_.keys(this.tabs)[0]);
        }
      }
    },

    removeTabs: function() {
      for(var name in this.tabs) {
        var vid = this.tabs[name];
        this._subviews[vid].clean();
        delete this.tabs[name];
      }
      this.activeTab = null;
    },

    active: function(name) {
      var
      self = this,
      vid  = this.tabs[name];

      if (vid !== undefined) {

        if (this.activeTab !== name) {

          var v = this._subviews[vid];

          if (this.activeTab) {
            var vid_old  = this._subviews[this.tabs[this.activeTab]];

            vid_old.hide();
            self.trigger('tabDisabled', this.activeTab , vid_old);
            self.trigger('tabDisabled:' + this.activeTab,  vid_old);
            if(vid_old.deactivated) {
              vid_old.deactivated();
            }
          }

          v.show();
          if(v.activated) {
            v.activated();
          }

          this.activeTab = name;
          this.activePane = v;

          self.trigger('tabEnabled', name, v);
          self.trigger('tabEnabled:' + name,  v);
        }

        return this.activePane;
      }
    },

    each: function(fn) {
      var self = this;
      _.each(this.tabs, function(cid, tab) {
        fn(tab, self.getPane(tab));
      });
    },

    clean: function() {
      this.removeTabs();
      View.prototype.clean.call(this);
    }



  });