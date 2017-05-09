
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*				GeoCATMarker => Create a new marker with circle. (Events included)																								*/
			/*						*Params ->	latlng: position in the map.																																			*/
			/*												kind: type of the marker.																																					*/
			/*												draggable: if it will be draggable at the start.																									*/
			/*												clickable: if it will be clickable at the start.																									*/
			/*												item: marker data/information like name, id, lon&lat, ...																					*/
			/*												map: where the marker goes...																																			*/
			/*  																																																												*/
			/*==========================================================================================================================*/

      var markersColours = [
        "#600000",
        "#01dd92",
        "#f500cd",
        "#b49d00",
        "#5981ff",
        "#ba6c00",
        "#00367e",
        "#ffb854",
        "#00d1f4",
        "#d20039",
        "#2b542f",
        "#ffa172",
        "#210500",
        "#a4bfab",
        "#7d871c"
      ];

			/* Main marker */

      function GeoCATMarker(latlng, kind, draggable, clickable, item, marker_map, symbol) {
        this.latlng_ = latlng;
        this.data = item;
        this.map_ = marker_map;
        this.offsetVertical_ = -11;
        this.offsetHorizontal_ = -11;
        this.height_ = 22;
        this.width_ = 22;
        this.image = '/assets/editor/'+ kind +'_marker.png';
        this.draggable = draggable;
        this.clickable = clickable;
        this.setMap(marker_map);

        if (kind == "flickr") {
          this.symbol = "F";
        } else if (kind == "gbif") {
          this.symbol = "G";
        } else if (kind == "inaturalist") {
          this.symbol = "iN";
        } else if (kind == "picasa") {
          this.symbol = "P";
        } else {
          this.symbol = ""; //for User
        }

        var order = symbol;
        if (order > markersColours.length) {
          order = symbol % (markersColours.length - 1);
        }
        this.colorOrder = order;
      }

      GeoCATMarker.prototype = new google.maps.OverlayView();


      /* Draw the overlay */
      GeoCATMarker.prototype.draw = function() {
        var self = this;

        var canvas = this.canvas_;
        if (!canvas) {
          canvas = this.canvas_ = document.createElement('canvas');
          canvas.style.position = "absolute";
          canvas.style.width = '22px';
          canvas.style.height = '22px';
          canvas.style.zIndex = global_zIndex;
          canvas.setAttribute('width',22);
          canvas.setAttribute('height',22);

          this.redraw();
          this._bindEvents();

          // Get pane from source
          if (!this.data.dcid) {
            console.log('There is no group id associated to this occ');
            return false;
          }
          if (!this.data.scid) {
            console.log('There is no source id associated to this occ');
            return false
          }
          var pane = groups.get(this.data.dcid).getSources().get(this.data.scid).getPane();

          pane.appendChild(canvas);
        }

        var pixPosition = self.getProjection().fromLatLngToDivPixel(self.latlng_);
        if (pixPosition) {
          canvas.style.width = self.width_ + 'px';
          canvas.style.left = (pixPosition.x + self.offsetHorizontal_) + 'px';
          canvas.style.height = self.height_ + 'px';
          canvas.style.top = (pixPosition.y + self.offsetVertical_) + 'px';
        }
      };

      GeoCATMarker.prototype.setMap = function(map) {
        oms[ map ? 'addMarker' : 'removeMarker' ](this);
        google.maps.OverlayView.prototype.setMap.call(this, map);
      }

      GeoCATMarker.prototype.redraw = function() {
        var canvas = this.canvas_;

        if (!canvas) return;

        if (canvas.getContext) {
          var context = canvas.getContext('2d');

          var color = markersColours[this.colorOrder];

          var shape = this.symbol || '';

          context.fillStyle = "rgba(255,255,255,0.75)";
          context.beginPath();
          context.arc(11,11,11,0,Math.PI*2,false);
          context.fill();
          context.fillStyle = color;
          context.beginPath();
          context.arc(11,11,8,0,Math.PI*2,false);
          context.closePath();
          context.fill();
          context.fillStyle = "#eee"
          context.font = "12px serif";
          var symbolPos = shape === 'iN' ? 6 : 8;
          context.fillText(shape,symbolPos,15);

          if (this.data.geocat_changed && this.data.geocat_kind !== "user") {
            context.beginPath();
            context.arc(18,4,3,0,Math.PI*2,false);
            context.fillStyle = "#FFF";
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
            context.fill();
          }
        } else {
          canvas.style.background = 'url('+this.image+') no-repeat 0 0';
        }
      }

      GeoCATMarker.prototype._bindEvents = function() {
        var canvas = this.canvas_;
        var me = this;

        if (!canvas) return;

        // Draggable action
        $(canvas).draggable({
          start:function(event,ui){
            is_dragging = true;
            if (convex_hull.isVisible()) {
              // mamufasPolygon();
              analysis_map.stop();
            }
            map.setOptions({draggable:false});
            me.data.init_latlng = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
            if (click_infowindow!=null) {
              click_infowindow.hide();
            }
            if (over_tooltip!=null) {
              over_tooltip.hide();
            }
            if (edit_metadata!=null) {
              edit_metadata.hide();
            }
          },
          drag:function(event,ui){
            me.latlng_ = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
            me.data.longitude = me.latlng_.lng();
            me.data.latitude = me.latlng_.lat();
          },
          stop:function(event,ui){
            is_dragging = false;
            map.setOptions({draggable:true});
            me.latlng_ = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
            me.data.longitude = me.latlng_.lng();
            me.data.latitude = me.latlng_.lat();
            me.data.geocat_changed = true;
            if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
            me.redraw();
            actions.Do('move', [{catalogue_id: me.data.catalogue_id, latlng: me.data.init_latlng}] , [{catalogue_id: me.data.catalogue_id, latlng: me.latlng_}]);
            event.stopPropagation(); // Stop propagation event avoiding open info panel
          }
        });
        $(canvas).draggable((this.draggable)?'enable':'disable');


        //Marker click event
        $(canvas).click(function(e){

          // Check zoom level
          // if (me.map_.getZoom() < 6) {
          //   me._click(e);
          //   return this;
          // }

          // Check state
          if (state == 'select') {
            google.maps.event.trigger(me, 'click', e);
          } else {
            me._click(e);
          }

        });


        //Marker mouseover event
        $(canvas).hover(function(ev){
          if (state == 'select') {
            map.setOptions({draggable:false});
            global_zIndex++;
            me.setZIndex(global_zIndex);
            over_marker = true;
            if (click_infowindow != null) {
              if (!is_dragging && !click_infowindow.isVisible()) {
                if (over_tooltip!=null) {
                  over_tooltip.changePosition(me.getPosition(),me.data.catalogue_id);
                  over_tooltip.show();
                } else {
                  over_tooltip = new MarkerOverTooltip(me.getPosition(), me.data.catalogue_id, me.map_);
                }
              }
            } else {
              if (!is_dragging) {
                if (over_tooltip!=null) {
                  over_tooltip.changePosition(me.getPosition(),me.data.catalogue_id);
                  over_tooltip.show();
                } else {
                  over_tooltip = new MarkerOverTooltip(me.getPosition(), me.data.catalogue_id, me.map_);
                }
              }
            }

          }
        }, function(ev){
          if (state == 'select') {
            map.setOptions({draggable:true});
            over_marker = false;
            setTimeout(function(ev){
              if (over_tooltip!=null && !over_mini_tooltip && !over_marker) {
                over_tooltip.hide();
              }
            },50);
          }
        });
      }


      GeoCATMarker.prototype._unBindEvents = function() {
        var canvas = this.canvas_;
        var me = this;

        if (!canvas) return;

        $(canvas)
          .off('click', null)
          .draggable('destroy')
          .off('hover');
      }

      GeoCATMarker.prototype._click = function(e) {
        var me = this;
        if (state=="select" || state=="remove") {
          if (state == 'remove') {
            if (delete_infowindow!=null) {
              if (me.data.catalogue_id != delete_infowindow.marker_id || !delete_infowindow.isVisible()) {
                delete_infowindow.changePosition(me.getPosition(),me.data.catalogue_id,me.data);
              }
            } else {
              delete_infowindow = new DeleteInfowindow(me.getPosition(), me.data.catalogue_id, me.data, me.map_);
            }
          } else {
            if (over_tooltip!=null) {
              over_tooltip.hide();
            }
            if (click_infowindow!=null) {
              if (me.data.catalogue_id != click_infowindow.getMarkerId() || !click_infowindow.isVisible()) {
                click_infowindow.changePosition(me.getPosition(),me.data.catalogue_id,me.data);
              }
            } else {
              click_infowindow = new OccurrenceInfowindow(me.getPosition(), me.data.catalogue_id, me.data,me.map_);
            }
            if (edit_metadata!=undefined) edit_metadata.hide();
          }
        }
      };


      /* Remove occurrence from the map */
      GeoCATMarker.prototype.remove = function() {
        if (this.canvas_) {
          this.canvas_.parentNode.removeChild(this.canvas_);
          this._unBindEvents();
          this.canvas_ = null;
        }
      };


      /* Hide occurrence from the map */
      GeoCATMarker.prototype.hide = function() {
        if (this.canvas_) {
          $(this.canvas_).find('div').fadeOut();
        }
      };


      /* Get position of the occurrence */
      GeoCATMarker.prototype.getPosition = function() {
       return this.latlng_;
      };

      GeoCATMarker.prototype.getVisible = function() {
       return !this.data.geocat_removed;
      };


      /* Set position of the occurrence */
      GeoCATMarker.prototype.setPosition = function(latlng) {
        this.latlng_ = latlng;
        var canvas = this.canvas_;
        var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (pixPosition) {
          canvas.style.width = this.width_ + 'px';
          canvas.style.left = (pixPosition.x + this.offsetHorizontal_) + 'px';
          canvas.style.height = this.height_ + 'px';
          canvas.style.top = (pixPosition.y + this.offsetVertical_) + 'px';
        }
      };


      /* Set draggable property of the occurrence */
      GeoCATMarker.prototype.setDraggable = function(draggable) {
        if (!draggable) {
          $(this.canvas_).draggable("disable");
        } else {
          $(this.canvas_).draggable("enable");
        }
        this.draggable = draggable;
      };


      /* Set clickable property of the occurrence */
      GeoCATMarker.prototype.setClickable = function(clickable) {
        this.clickable = clickable;
      };


      /* Set cursor property of the occurrence */
      GeoCATMarker.prototype.setCursor = function(type) {
        try {this.canvas_.style.cursor = type;} catch(e) {}
      };


      /* Set active property of the occurrence */
      GeoCATMarker.prototype.setActive = function(active) {
        this.data.geocat_active = active;
        if (! !!sessionStorage.getItem('toggleing_global'))
        {
          this.canvas_.style.opacity = (active) ? 1 : 0.3;
        } else {
          this.canvas_.style.opacity = (active) ? 1 : 0.3;
        }
      };


      /* Set zIndex property of the occurrence */
      GeoCATMarker.prototype.setZIndex = function(num) {
        this.canvas_.style.zIndex = num;
      };
