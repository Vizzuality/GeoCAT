  
  /**
   *  Source item view
   *
   */

  var SourceItem = View.extend({

    tagName:    'li',
    className:  'source',

    events: {
      'dblclick input':         '_startEdit',
      'focusout input':         '_finishEdit',
      'submit form':            '_onSubmit',
      'click input':            'killEvent',
      'click .visible_specie':  '_toggleVisibility',
      'click .delete_specie':   '_deleteSpecie',
      'click .merge_specie':    'killEvent',
      'click':                  '_finishEdit'
    },

    initialize: function() {
      _.bindAll(this, '_toggleVisibility', '_deleteSpecie', '_finishEdit', '_startEdit', '_onSubmit');
      this.model.bind('change', this.render, this);
      this.model.bind('delete', this._removeSource, this);
      this.model.bind('destroy', this.clean, this);
      this.template = JST['editor/views/source_item'];
    },

    render: function() {
      var d = this.model.toJSON();
      
      if (d.type === "inaturalist") {
        d.type = "iNaturalist"
      }

      this.$el.html(this.template(d));
      
      // Set cid as data
      this.$el.attr('data-cid', this.cid);

      return this;
    },

    _startEdit: function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      var $input = this.$('input');
      this.old_value = $input.val();
      $input.removeAttr('readonly');
      setTimeout(function(){
        $input.focus();
      },0);
    },

    _finishEdit: function(e) {
      if (e) e.preventDefault();

      this.$('input').attr('readonly', 'readonly')
      var value = this.$('input').val();
      
      if (!value) {
        value = this.old_value;
      }
      this.model.set({ alias: value });
    },

    _onSubmit: function(e) {
      if (e) e.stopPropagation();
      this._finishEdit(e);
    },

    _removeSource: function(m) {
      deleteAll(m.get('query'), m.get('type'));
      this.model.destroy();
    },

    _deleteSpecie: function(e) {
      if (e) e.preventDefault();
      this.trigger('delete', this.model, this);
    },

    _toggleVisibility: function(e) {
      if (e) e.preventDefault();

      var visible = this.model.get('visible');
      this.model.set('visible', !visible);

      this.$('.visible_specie')[ visible ? 'removeClass' : 'addClass' ]('on');
      hideAll(this.model.get('query'), this.model.get('type'), this.model.get('visible')); // Arg! :(
    }

  });