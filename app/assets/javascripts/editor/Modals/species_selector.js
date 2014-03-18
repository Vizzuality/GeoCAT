  
  /**
   *  Modal window to select an specie
   *  from a DWC file type (for example).
   */
  

  function SpecieSelector(data) {
    this.data = data;
    this.initialize();
    this.specie = null;
  }

  _.extend(SpecieSelector.prototype, {

    initialize: function() {
      _.bindAll(this, '_uploadData', 'hide');

      this.render();
      this.initComponents();
      this.initBinds();
      this.show();
    },

    render: function() {
      this.$el = $(JST[
        _.isEmpty(this.data.errors) ?
        'editor/views/species_selector/species_dialog' :
        'editor/views/species_selector/species_error'
      ]());
      $('.center-map').append(this.$el);

      if (this.data.errors && !_.isEmpty(this.data.errors))
        this.renderErrors() 
    },

    initComponents: function() {
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
    },

    destroyComponents: function() {
      this.$el.find('select').select2("destroy");
    },

    initBinds: function() {
      this.$el.find('.import').on('click', this._uploadData);
      this.$el.find('.close').on('click', this.hide);
      this.$el.find('.cancel').on('click', this.hide);
    },

    destroyBinds: function() {
      this.$el.find('.import').off('click', this._uploadData);
      this.$el.find('.close').off('click', this.hide);
      this.$el.find('.cancel').off('click', this.hide);
    },

    renderErrors: function() {
      var $ul = this.$el.find('ul');
      var item_error = _.template('<li class="warning"><%= msg %></li>');

      _.each(this.data.errors.sources, function(msg) {
        var li = item_error({ msg: msg });
        $ul.append(li);
      })
    },

    _getData: function(specie_name) {
      var specie_data = _.find(this.data.species, function(specie){ return specie.scientificName == specie_name });
      
      if (!specie_data) return false;

      var alias = specie_data.scientificName;
      var query = alias + '_' + new Date().getTime();
      var type = 'dwc';

      _.each(specie_data.data, function(obj,i) {
        global_id++;

        obj.geocat_active = true;
        obj.geocat_query = query;
        obj.geocat_removed = false;
        obj.geocat_kind = type;
        obj.geocat_alias = alias;
        obj.catalogue_id = 'user_' + global_id;
      });

      return specie_data;
    },

    _uploadData: function(ev) {
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

    show: function() {
      this.$el.fadeIn();
    },

    hide: function(e) {
      if (e) e.preventDefault();
      var self = this;
      this.$el.fadeOut(function() {
        self.clean();
      });
    },

    clean: function() {
      // Destroy custom components
      this.destroyComponents();

      // Destroy bindings
      this.destroyBinds();

      // Remove html
      this.$el.remove();
    }

  });