
  /**
   *  New Source upload Multiple species CSV source view
   *
   */


  var NewUploadMultiSpeciesCSVSourceItem = NewUploadSourceItem.extend({

    options: {
      template: 'new_upload_multi_species_source_item'
    },

    _onComplete: function(e, data) {

      var r = data.result;
      // Create source using import data :)

      var total_occurrences = {};
      total_occurrences.points = new Array();
      var sources = r.data.sources || {};
      _.each(sources,function(element){
        _.each(element.points,function(point){
          if (point.catalogue_id && (point.catalogue_id.search('user') != -1 || !point.geocat_kind)) {
            global_id++;
            point.catalogue_id = 'user_'+global_id;
            point.geocat_kind = 'user';
          }
          total_occurrences.points.push(point);
        });
      });


      if (r.success) {

        // SUCCESS

        if (!_.isEmpty(r.warnings)) {
          csv_error.setInfo(r, total_occurrences);
          this.trigger('changeApp', 6, this);
        }

        var count = _.filter(total_occurrences.points, function(occ) { return !occ.geocat_removed }).length || 0;
        var count_spp = Object.keys(_.groupBy(total_occurrences.points, 'geocat_query')).length;
        var count_group = Object.keys(_.groupBy(total_occurrences.points, 'group')).length;

        var msg = '';
        if(count_spp > 1) {
          msg = count_spp + ' species<br />';
        }
        if(count_group > 1) {
          msg = msg + count_group + " groups <br />";
        }
        if(msg !== '') {
          msg = msg + "in ";
        }
        msg = msg + count + ((count == 1) ? " ocurrence" : " occurrences");

        this.$('.success p').html(msg);

        if(count_spp > 1) {
          this.$('.success .import-species').show();
        } else {
          this.$('.success .import-species').hide();
        }

        if(count_group > 1) {
          this.$('.success .import-group').show();
        } else {
          this.$('.success .import-group').hide();
        }

        this.model.set({
          value: total_occurrences,
          state: 'success'
        });

      } else {

        // ERROR!

        if (r.format=="geocat" || r.format==null) {
          this.$('.error p').text('File Corrupted');
          this.model.set('state', 'error');
        } else {
          this.trigger('close', this);
          csv_error.setInfo(r);
          // Change application?
          this.trigger('changeApp', 6, this);
        }
      }
    }

  });
