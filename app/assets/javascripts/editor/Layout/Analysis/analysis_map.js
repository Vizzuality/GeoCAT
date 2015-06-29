
  /**
   *
   */

  var AnalysisMap = Backbone.Model.extend({

    _MIN_POINTS_ANALYSIS: 3,

    defaults: {
      active_points:  [],   // App active points
      EOO:            0,
      AOO:            0,
      AOO_type:       "",
      EOO_type:       ""
    },

    initialize: function(opts) {
      this.map = opts.map;
      this.analysis = opts.analysis;
      this.cells = [];
      this._createHullPolygon();
      this._initBinds();
    },

    _initBinds: function() {
      _.bindAll(this, '_getActivePoints', 'start');
      // Oh god!
      $(document).bind('occs_updated',      this.start);
      this.bind('change:active_points',     this._setOverlays, this);
      this.analysis.bind('change:cellsize', this.start, this);
    },

    // Start analysis
    // - It needs to bounds the active points?
    start: function(bounds) {
      this._getActivePoints(bounds === true);
    },

    // Stop/pause analysis (When a point is being moved, etc)
    stop: function() {
      this._disableHullPolygon();
      this._disableCellPolygons();
    },

    // Analysis over!
    finish: function() {
      this._removeHullPolygon();
      this._removeCellPolygons();
      this._resetActivePoints();
    },

    reduction: function() {
      this._drawReductionPolygons();
    },

    applyReduction: function() {
      this._destroyReductionPolygons();
    },

    discardReduction: function() {
      this._destroyReductionPolygons();
    },



    _drawReductionPolygons: function() {
      var self = this;
      // Hull
      this.old_hull = new PolyLineFill(this.hull.getPath().getArray(), this.map);
      // Cells
      this.old_cells = [];
      _.each(this.cells, function(c) {
        self.old_cells.push(
          new PolyLineFill(c.getPath().getArray(), self.map, null, "#FE8483", "#FE8483")
        );
      });
    },

    _destroyReductionPolygons: function() {
      // Hull
      this.old_hull.setMap(null);
      delete this.old_hull;
      // Cells
      _.each(this.old_cells, function(c) {
        c.setMap(null);
      });
      delete this.old_cells;
    },



    _setOverlays: function() {
      this._removeHullPolygon();
      this._removeCellPolygons();

      if (this.get('active_points').length >= this._MIN_POINTS_ANALYSIS) {
        var unwrappedHullPoints = this._getHullPoints();
        this._setHullPolygon(unwrappedHullPoints);
      }

      this._getAnalysisData(this.hull.getPath().getArray());
      this._drawCellPolygons();
    },

    _getHullPoints: function() {
      var hullPoints, unwrappedHullPoints = [];
      hullPoints = getConvexHullPoints(this._markersToPoints(this.get("active_points")));

      $.each(hullPoints,function(index,element){
        unwrappedHullPoints.push(new google.maps.LatLng(element.lat(),element.lng(),false));
      });

      return unwrappedHullPoints;
    },

    _getAnalysisData: function(path) {
      var area = google.maps.geometry.spherical.computeArea(path)/1000000;
      var d = getAnalysisData(
        area,
        path,
        this.get('active_points'),
        this.analysis.get('cellsize') * 1000, // km!
        this.analysis.get('celltype')
      );

      this.cells = d.Cells;

      this.set({
        EOO:      d.EOOArea.toFixed(3),
        AOO:      d.AOOArea.toFixed(3),
        AOO_type: d.AOORat,
        EOO_type: d.EOORat
      });

      if (d.cellsize !== (this.analysis.get('cellsize') * 1000)) {
        var cellsize = Math.ceil(d.cellsize / 1000 );
        this.analysis.set('cellsize', cellsize);
      }

    },


    _createHullPolygon: function() {
      this.hull = new google.maps.Polygon({
        paths: [],
        strokeColor: "#333333",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#000000",
        fillOpacity: 0.25,
        clickable: false
      });
    },

    _setHullPolygon: function(unwrappedHullPoints) {
      this.hull.setPath(unwrappedHullPoints);
      this.hull.setOptions({
        fillOpacity:0.25,
        strokeOpacity:1
      });
      this.hull.setMap(this.map);
    },

    _disableHullPolygon: function() {
      this.hull.setOptions({
        fillOpacity:0.1,
        strokeOpacity:0.2
      });
    },

    _removeHullPolygon: function() {
      this.hull.setPath([]);
      this.hull.setMap(null);
    },

    _markersToPoints: function(path) {
      var result = [];
      for (var i=0; i<path.length; i++) {
        result.push(path[i].getPosition());
      }
      return result;
    },

    _drawCellPolygons: function() {
      var self = this;
      _.each(this.cells,function(c){
        c.setMap(self.map);
      });
    },

    _disableCellPolygons: function() {
      _.each(this.cells,function(c){
        c.setOptions({
          fillOpacity:0.1,
          strokeOpacity:0.2
        });
      });
    },

    _removeCellPolygons: function() {
      _.each(this.cells,function(c){
        c.setMap(null);
      });

      this.cells = [];
    },

    _getActivePoints: function(bounds) {
      var self = this;
      var b = new google.maps.LatLngBounds();

      this._resetActivePoints(true);

      var activeGroupCid = groups_view.getActiveGroupCid();
      // Get active points from occurrences ( global :( )
      _.each(occurrences, function(o) {
        if (o.data.dcid === activeGroupCid && o.data.geocat_active &&
            !o.data.geocat_removed) {
          self.get('active_points').push(o);
          b.extend(o.getPosition());
        }
      });

      // Need to bounds to map
      if (bounds && this.get('active_points').length > 1)
        map.fitBounds(b);

      this.trigger('change:active_points', this);
    },

    // Accepts parameter to check if it
    _resetActivePoints: function(silent) {
      this.set('active_points', [], { silent: silent });
    },

    addPoint: function(o) {
      var active_points = this.get('active_points');
      active_points.push(o);
      this.set('active_points', active_points);
      this.trigger('change:active_points', this);
    },

    deductPoint: function(marker_id) {
      var active_points = this.get('active_points');
      for (var i=0, l=active_points.length; i<l; i++) {
        if (active_points[i].data.catalogue_id == marker_id) {
          this.set('active_points', active_points.splice(i,1));
          break;
        }
      }
      this.trigger('change:active_points', this);
    },

    getActivePoints: function() {
      return this.get('active_points').length;
    }

  });
