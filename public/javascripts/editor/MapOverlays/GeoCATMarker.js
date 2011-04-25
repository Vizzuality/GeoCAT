
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


			/* Main marker */			
			
      function GeoCATMarker(latlng, kind, draggable, clickable, item, marker_map) {
        this.latlng_ = latlng;
        this.data = item;
        this.map_ = marker_map;
        this.offsetVertical_ = -11;
        this.offsetHorizontal_ = -11;
        this.height_ = 22;
        this.width_ = 22;
        this.image = '/images/editor/'+ kind +'_marker.png';
        this.draggable = draggable;
        this.clickable = clickable;
        this.setMap(marker_map);
      }
      
      GeoCATMarker.prototype = new google.maps.OverlayView();
      
      
      /* Draw the overlay */
      GeoCATMarker.prototype.draw = function() {
        var me = this;
      
        var canvas = this.canvas_;
        if (!canvas) {
          canvas = this.canvas_ = document.createElement('canvas');
          canvas.style.position = "absolute";
          canvas.style.width = '22px';
          canvas.style.height = '22px';
          canvas.style.zIndex = global_zIndex;
          canvas.setAttribute('width',22);
          canvas.setAttribute('height',22);
          
          if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.fillStyle = "rgba(255,255,255,0.75)";
            context.beginPath();
            context.arc(11,11,11,0,Math.PI*2,false);
            context.fill();
            if (this.data.geocat_kind == "flickr") {
              context.fillStyle = "#FF3399"; //pink
            } else if (this.data.geocat_kind == "gbif") {
              context.fillStyle = "#99CC00"; //green
            } else {
              context.fillStyle = "#066FB6"; //blue
            }
            context.beginPath();
            context.arc(11,11,8,0,Math.PI*2,false);
            context.closePath();
            context.fill();
          } else {
            canvas.style.background = 'url('+this.image+') no-repeat 0 0';
          }

          var panes = this.getPanes();
          panes.floatPane.appendChild(canvas);
          
          
          // Draggable action
          $(canvas).draggable({
            start:function(event,ui){
              is_dragging = true;
              if (convex_hull.isVisible()) {
                mamufasPolygon();
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
              actions.Do('move', [{catalogue_id: me.data.catalogue_id, latlng: me.data.init_latlng}] , [{catalogue_id: me.data.catalogue_id, latlng: me.latlng_}]);
              event.stopPropagation(); // Stop propagation event avoiding open info panel
            }
          });
          $(canvas).draggable((this.draggable)?'enable':'disable');
          
          
          //Marker click event
          $(this.canvas_).click(function(ev){
            if (me.clickable) {
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
                  if (me.data.catalogue_id != click_infowindow.marker_id || !click_infowindow.isVisible()) {
                    click_infowindow.changePosition(me.getPosition(),me.data.catalogue_id,me.data);
                  }
                } else {
                  click_infowindow = new MarkerTooltip(me.getPosition(), me.data.catalogue_id, me.data,me.map_);
                }
                if (edit_metadata!=undefined) edit_metadata.hide();
              }
            }
          });


          //Marker mouseover event
          $(this.canvas_).hover(function(ev){
            if (state == 'select') {
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
              over_marker = false;
              setTimeout(function(ev){
                if (over_tooltip!=null && !over_mini_tooltip && !over_marker) {
                  over_tooltip.hide();
                }
              },50);
            }
          }); 
        }
        
        var pixPosition = me.getProjection().fromLatLngToDivPixel(me.latlng_);
        if (pixPosition) {
          canvas.style.width = me.width_ + 'px';
          canvas.style.left = (pixPosition.x + me.offsetHorizontal_) + 'px';
          canvas.style.height = me.height_ + 'px';
          canvas.style.top = (pixPosition.y + me.offsetVertical_) + 'px';
        }
      
      };
      
      
      /* Remove occurrence from the map */
      GeoCATMarker.prototype.remove = function() {
        if (this.canvas_) {
          this.canvas_.parentNode.removeChild(this.canvas_);
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
        this.canvas_.style.cursor = type;
      };
      
      
      /* Set active property of the occurrence */
      GeoCATMarker.prototype.setActive = function(active) {
        this.data.geocat_active = active;
        this.canvas_.style.opacity = (active)?1:0.6;
      };
      
      
      /* Set zIndex property of the occurrence */
      GeoCATMarker.prototype.setZIndex = function(num) {
        this.canvas_.style.zIndex = num;
      };