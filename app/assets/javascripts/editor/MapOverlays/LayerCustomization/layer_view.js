
  /**
   *  Layer item view.
   *  
   *  - It needs a Layer model.
   *
   */

  var LayerView = View.extend({

    tagName: 'li',

    events: {
      'dblclick input':       '_startEdit',
      'click input':          'killEvent',
      'focusout input':       '_finishEdit',
      'click .add':           '_onAddClick',
      'slidechange .slider':  '_onSlideChange',
      'submit form':          '_onSubmit',
      'click .remove':        '_onRemove'
    },

    initialize: function() {
      _.bindAll(this, '_onSlideChange', '_finishEdit', '_startEdit', '_onAddClick');
      this.template = this.getTemplate('layer_item');
      this.model.bind('change:added', this._toggleSlider, this);
      this.model.bind('change:added', this._toggleSelected, this);
    },

    render: function() {
      this.clearSubViews();
      this.$el.html(this.template(this.model.toJSON()));

      // Set cid as data
      this.$el.attr('data-cid', this.cid);
      
      // Set slider
      this.$slider = this.$('div.slider');
      this.$slider.slider({
        range:  'min',
        min:    0,
        max:    1,
        step:   0.1,
        value:  this.model.get('opacity')
      });

      // Check if slider should appear
      this._toggleSlider();
      // Check if add is seleect
      this._toggleSelected();

      return this;
    },

    _onRemove: function(e) {
      if (e) e.preventDefault();
      this.model.destroy();
      this.remove();
    },

    _toggleSelected: function() {
      var isAdded = this.model.get('added');
      this.$('a.add')
        [ !isAdded ? 'removeClass' : 'addClass' ]('selected')
        .text( !isAdded ? 'add' : 'added' )
    },

    _toggleSlider: function() {
      var isAdded = this.model.get('added') && this.model.get('type') === "xyz";
      this.$('div.foot')[ !isAdded ? 'hide' : 'show' ]()
    },

    _onAddClick: function(e) {
      if (e) e.preventDefault();
      this.model.set('added', !this.model.get('added'));
    },

    _startEdit: function(e) {
      if (e) e.preventDefault();

      var $input = this.$('input');
      this.old_value = $input.val();
      this.$('input').removeAttr('readonly');
    },

    _finishEdit: function(e) {
      if (e) e.preventDefault();

      this.$('input').attr('readonly', 'readonly')
      var value = this.$('input').val();
      
      if (!value) {
        value = this.old_value;
      }
      this.model.set({ name: value },{ silent: true });
    },

    _onSlideChange: function(e, ui) {
      this.model.set('opacity', ui.value);
    },

    _onSubmit: function(e) {
      if (e) e.stopPropagation();
      this._finishEdit(e);
    },

    clean: function() {
      this.$slider.slider('destroy');
      view.prototype.clean.call(this);
    }

  });