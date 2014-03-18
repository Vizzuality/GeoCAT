  
  /**
   *  New Source upload GeoCAT / CSV source view
   *
   */


  var NewUploadGeoCATCSVSourceItem = NewUploadSourceItem.extend({

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

        this.$('.success p').text(
          ((count>=1000)?'> ':'') + count + ((count == 1) ? " occ" : " occs") + ' found'
        );

        this.$('.success .import').text(count>=1000 ? 'import first 1000' : 'import');

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