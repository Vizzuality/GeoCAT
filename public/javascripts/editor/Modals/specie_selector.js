  
  /**
   *  Modal window to select an specie
   *  from a DWC file type (for example).
   */
  

  function SpecieSelector(data) {
    this.data = data;
    this.initialize();
    this.specie = null;
  }

  SpecieSelector.prototype.initialize = function() {

    _.bindAll(this, '_uploadData', 'hide');

    this.render();
    this.initComponents();
    this.initBinds();
    this.show();
  }

  SpecieSelector.prototype.render = function() {
    this.$el = $( _.isEmpty(this.data.errors) ? this.template : this.template_error );
    $('.center-map').append(this.$el);
  }

  SpecieSelector.prototype.initComponents = function() {
    var self = this;

    // Placeholder
    this.$el.find('select').append($('<option>'));
    // Species
    _.each(this.data.species, function(obj,i) {
      self.$el.find('select').append($('<option>').text(obj.scientificName));
    });

    this.$el.find('select').select2({
      minimumResultsForSearch: 10
    });

    this.$el.find('select').on('change', function(ev) {
      self.specie = ev.val;
    })
  }

  SpecieSelector.prototype.destroyComponents = function() {
    this.$el.find('select').select2("destroy");
  }

  SpecieSelector.prototype.initBinds = function() {
    this.$el.find('.import').on('click', this._uploadData);
    this.$el.find('.close').on('click', this.hide);
  }

  SpecieSelector.prototype.destroyBinds = function() {
    this.$el.find('.import').off('click', this._uploadData);
    this.$el.find('.close').off('click', this.hide);
  }

  SpecieSelector.prototype._getData = function(specie_name) {
    var specie_data = _.find(this.data.species, function(specie){ return specie.scientificName == specie_name });
    _.each(specie_data.data, function(obj,i) {
      global_id++;

      obj.geocat_active = true;
      obj.geocat_query = "";
      obj.geocat_removed = false;
      obj.geocat_kind = "user";
      obj.catalogue_id = 'user_' + global_id;
    });
    return specie_data;
  }

  SpecieSelector.prototype._uploadData = function(ev) {
    ev.preventDefault();
    var specie_data = this._getData(this.specie);

    if (specie_data) {
      changeApplicationTo(2);
      this.hide();

      uploadGeoCAT({
        data: {
          sources: [
            {
              type: 'user',
              points: specie_data.data,
              query: this.specie
            }
          ]
        }
      });
    }
  },

  SpecieSelector.prototype.show = function() {
    this.$el.fadeIn();
  }

  SpecieSelector.prototype.hide = function(e) {
    if (e) e.preventDefault();
    var self = this;
    this.$el.fadeOut(function() {
      self.clean();
    });
  }

  SpecieSelector.prototype.clean = function() {
    // Destroy custom components
    this.destroyComponents();

    // Destroy bindings
    this.destroyBinds();

    // Remove html
    this.$el.remove();
  }





  SpecieSelector.prototype.template = " \
    <div class='specie_selector'>\
      <a href='#/close' class='close'>X</a>\
      <h2>DWC species</h2>\
      <div class='block'>\
        <select data-placeholder='Select a specie'></select>\
        <a href='#/import' class='button import'>IMPORT</a>\
      </div>\
    </div>\
  ";

  SpecieSelector.prototype.template_error = "\
    <div class='specie_selector'>\
      <h2>There were errors in the {{ type }} provided</h2>\
      <ul></ul>\
      <a href='#/close' class='button close'>CLOSE</a>\
    </div>\
  "