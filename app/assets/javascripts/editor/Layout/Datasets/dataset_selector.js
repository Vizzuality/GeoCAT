
  /**
   *  Datasets selector view
   *
   *  - Change between datasets
   *  - Manage them
   *  - Edit names
   *  - Create new ones
   *
   */


  DatasetsSelector = View.extend({

    events: {
      'change': '_onSelected'
    },

    initialize: function() {
      _.bindAll(this, 'search', 'format', '_onCreateNew', '_onSelect', '_onEdit');
      this._initBinds()
    },

    render: function() {
      if (this.$el.data('select2')) {
        this.$el.select2('destroy');
      }

      this.$el.html('');

      this.collection.each(function(m) {
        this.$el.append('<option data-cid="' + m.cid + '" ' + ( m.get('active') ? 'selected' : '') + ' >' + m.get('name') + '</option>')
      }, this);

      // Check if there is any dataset selected
      var actives = this.collection.filter(function(m) { return m.get('active') }).length;
      if (this.collection.size() > 0 && actives === 0) {
        this.collection.at(0).set('active', true);
      }

      var select2 = this.$el.select2({
        dropdownCssClass:         'datasets_dropdown',
        minimumResultsForSearch:  1,
        formatResult:             this.format,
        formatNoMatches:          this.search,
        escapeMarkup:             function(m) { return m }
      })
      .parent().find(".select2-with-searchbox").on("click", this._onCreateNew)
      .data('select2');
      
      select2.onSelect = (this._onSelect)(select2.onSelect);

      return this;
    },

    _initBinds: function() {
      this.collection.bind('add remove', this.render, this);
    },

    search: function(val) {
      return '<a class="create_new" href="#/create-' + val + '" data-name="' + val + '">Create dataset ' + val + '</a>';
    },

    format: function(state) {
      if (!state.id) return state.text;
      return  "<i class='fa fa-dot-circle-o visible disabled'></i>\
              <form><input class='text' type='text' value='" + state.text + "' readonly /></form>\
              <i class='fa fa-pencil edit'></i>\
              <i class='fa fa-times delete disabled'></i>";
    },

    // Oh god!
    _onSelect: function(fn) {
      var self = this;

      return function(data, e) {
        var target;
        
        if (e != null) {
          target = $(e.target);
        }
        
        // By class
        if (target) {
          var c = target.attr('class');

          // Delete?
          if (c.indexOf('delete') !== -1) {
            self._onDelete(data,e)
          } else if (c.indexOf('edit') !== -1) {
            self._onEdit(data,e);
          } else if (c.indexOf('visible') !== -1) {
            self._onVisible(data,e);
          } else {

            if (!data.editing) {
              return fn.apply(this, arguments);
            } else {
              e.stopPropagation();
            }
          }
          
        } else {
          return fn.apply(this, arguments);
        }        
      }
    },

    _onDelete: function(data, e) {},

    _onVisible: function(data, e) {},

    _onEdit: function(data, e) {
      var $el = $(e.target);
      data.editing = !data.editing;
      var $form = $el.parent().find('form');
      var $input = $form.find('input');
      var self = this;
              
      if (data.editing) {
        $el.addClass('selected');
        
        $input
          .removeAttr('readonly')
          .focus();

        $form.bind('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var $el = $(e.target).parent().find('.edit');
          self._onEdit(data, { target: $el[0] });
        })

      } else {
        $form.unbind('submit');

        // Remove selection state
        $el.removeClass('selected');

        // Change option
        var $opt = $(data.element);
        var cid = $opt.data('cid');
        var value = $input.val();
        $opt.text(value);

        // Change current selected?
        if ($opt.attr('selected')) {
          self.$el.data('select2').container.find('.select2-chosen').text(value);
        }

        // Change model property
        var mdl = self.collection.find(function(m){
          return m.cid === cid
        });
        
        if (mdl) {
          mdl.set('name', value)  
        } else {
          console.log("[DATASET] Dataset not found, renaming incomplete");
        }

        // Set value
        data.text = value;
        $input.attr('readonly', '')
      }
    },

    _onSelected: function(e) {
      var $opt = this.$('option:selected');
      var value = $opt.html();
      var cid = $opt.data('cid');
      this.trigger('onSelect', value, cid, this);
    },

    _onCreateNew: function(e) {
      var $e = $(e.target);

      if ($e.hasClass('create_new')) {
        this.killEvent(e);
        var name = $(e.target).data('name');
        var m = new DatasetModel({ name: name, active: true },{ map: this.options.map });
        this.collection.add(m);
        this.trigger('onSelect', name, m.cid, this);
      }
    },

    clean: function() {
      View.prototype.clean.call(this);
    }

  })
