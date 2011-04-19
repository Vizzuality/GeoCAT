
			/*==========================================================================================================================*/
			/*  																																																												*/
			/*				CreateMarker => Create a new marker with circle. (Events included)																								*/
			/*						*Params ->	latlng: position in the map.																																			*/
			/*												kind: type of the marker.																																					*/
			/*												draggable: if it will be draggable at the start.																									*/
			/*												clickable: if it will be clickable at the start.																									*/
			/*												item: marker data/information like name, id, lon&lat, ...																					*/
			/*												map: where the marker goes...																																			*/
			/*  																																																												*/
			/*==========================================================================================================================*/


			/* Main marker */
	
      function CreateMarker(latlng, kind, draggable, clickable, item, marker_map) {
       
       //Choose marker icon image.
       var image = new google.maps.MarkerImage('/images/editor/'+ kind +'_marker.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
       var marker = new google.maps.Marker({position: latlng, draggable: draggable, raiseOnDrag:false, clickable: clickable, map: marker_map, icon: image, data: item});
       
       
       //Marker click event
       google.maps.event.addListener(marker,"click",function(ev){
         if (state == 'remove') {
           if (delete_infowindow!=null) {          
             if (this.data.catalogue_id != delete_infowindow.marker_id || !delete_infowindow.isVisible()) {
               delete_infowindow.changePosition(this.getPosition(),this.data.catalogue_id,this.data);
             }
           } else {
             delete_infowindow = new DeleteInfowindow(this.getPosition(), this.data.catalogue_id, this.data, marker_map);
           }       
         } else {
           if (over_tooltip!=null) {
             over_tooltip.hide();
           }
           if (click_infowindow!=null) {         
             if (this.data.catalogue_id != click_infowindow.marker_id || !click_infowindow.isVisible()) {
               click_infowindow.changePosition(this.getPosition(),this.data.catalogue_id,this.data);
             }
           } else {
             click_infowindow = new MarkerTooltip(this.getPosition(), this.data.catalogue_id, this.data,marker_map);
           }
           if (edit_metadata!=undefined)
                    edit_metadata.hide();
         }
       });
         
      
       //Marker mouseover event
       google.maps.event.addListener(marker,"mouseover",function(ev){
         global_zIndex++;
         this.setZIndex(global_zIndex);
         if (state == 'select') {
           over_marker = true; 
           if (click_infowindow != null) {
             if (!is_dragging && !click_infowindow.isVisible()) {
               if (over_tooltip!=null) {
                 over_tooltip.changePosition(this.getPosition(),this.data.catalogue_id);
                 over_tooltip.show();
               } else {
                 over_tooltip = new MarkerOverTooltip(this.getPosition(), this.data.catalogue_id, marker_map);
               }
             }
           } else {
             if (!is_dragging) {
               if (over_tooltip!=null) {
                 over_tooltip.changePosition(this.getPosition(),this.data.catalogue_id);
                 over_tooltip.show();
               } else {
                 over_tooltip = new MarkerOverTooltip(this.getPosition(), this.data.catalogue_id, marker_map);
               }
             }
           }
      
         }
       }); 
         
      
       //Marker mouseover event
       google.maps.event.addListener(marker,"mouseout",function(ev){
         if (state == 'select') {
           over_marker = false;
           setTimeout(function(ev){
             if (over_tooltip!=null && !over_mini_tooltip && !over_marker) {
               over_tooltip.hide();
             }
           },50);
         }
       });
       
         
       //Marker drag start event
       google.maps.event.addListener(marker,"dragstart",function(ev){
         marker.data.init_latlng = ev.latLng;
         if (convex_hull.isVisible()) {
           mamufasPolygon();
         }
          
         if (click_infowindow!=null) {
           click_infowindow.hide();
         }
         if (over_tooltip!=null) {
           is_dragging = true;
           over_tooltip.hide();
         }
         if (edit_metadata!=null) {
           is_dragging = true;
           edit_metadata.hide();
         }
       });
         
      
       //Marker drag event
       google.maps.event.addListener(marker,"drag",function(ev){           
         this.data.longitude = ev.latLng.lng();
         this.data.latitude = ev.latLng.lat();
       });
      
      
       //Marker drag end event
       google.maps.event.addListener(marker,"dragend",function(ev){
         is_dragging = false;
         this.data.longitude = ev.latLng.lng();
         this.data.latitude = ev.latLng.lat();
         this.data.changed = true;
         if (convex_hull.isVisible()) {
           $(document).trigger('occs_updated');
         }
         actions.Do('move', [{catalogue_id: marker.data.catalogue_id, latlng: marker.data.init_latlng}] , [{catalogue_id: marker.data.catalogue_id, latlng: ev.latLng}]);
       });
      

        // Create circle of accuracy
        // var color;
        // switch (kind) {
        //  case 'gbif':    color = '#FFFFFF';
        //                  break;
        //  case 'flickr':  color = '#FF3399';
        //                  break;
        //  default:        color = '#066FB6';
        // }
        // var circle = new google.maps.Circle({
        //  map: marker_map,
        //  radius: parseInt(item.coordinateUncertaintyInMeters),
        //  strokeColor: color,
        //  strokeOpacity: 0.3,
        //  strokeWeight: 1,
        //  fillOpacity: 0.3,
        //  fillColor: color,
        //  clickable: false
        // });
        // 
        // marker.set('distance', parseInt(marker.data.coordinateUncertaintyInMeters));
        // marker.set('opacity', 0.3);
        //  
        // circle.bindTo('map', marker);
        // circle.bindTo('center', marker, 'position');
        // circle.bindTo('radius', marker, 'distance');
        // circle.bindTo('fillOpacity', marker, 'opacity');
  
        return marker;
      }
			
			
			
			
			
			
      // function CreateMarker(latlng, kind, draggable, clickable, item, marker_map) {
      //   this.latlng_ = latlng;
      //   this.data = item;
      //   this.map_ = marker_map;
      //   this.offsetVertical_ = -12;
      //   this.offsetHorizontal_ = -13;
      //   this.height_ = 25;
      //   this.width_ = 25;
      //   this.image = '/images/editor/'+ kind +'_marker.png';
      //   this.draggable = draggable;
      //   this.clickable = clickable;
      //   this.setMap(map);
      // }
      // 
      // CreateMarker.prototype = new google.maps.OverlayView();
      // 
      // CreateMarker.prototype.draw = function() {
      //   var me = this;
      // 
      //   var div = this.div_;
      //   if (!div) {
      //     div = this.div_ = document.createElement('canvas');
      //     div.style.border = "none";
      //     div.style.position = "absolute";
      //     div.style.width = '25px';
      //     div.style.height = '25px';
      //     div.style.background = 'url('+this.image+') no-repeat 0 0';
      //     div.style.zIndex = global_zIndex;
      //     
      //     var panes = this.getPanes();
      //     panes.floatPane.appendChild(div);
      //     $(div).draggable({
      //       drag:function(event,ui){
      //         me.latlng_ = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
      //         me.data.longitude = me.latlng_.lng();
      //         me.data.latitude = me.latlng_.lat();
      //         if (convex_hull.isVisible()) {
      //           convex_hull.calculateConvexHull(true);
      //         }
      //       },
      //       stop:function(event,ui){
      //          is_dragging = false;
      //          me.latlng_ = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
      //          me.data.longitude = me.latlng_.lng();
      //          me.data.latitude = me.latlng_.lat();
      //          me.data.changed = true;
      //          if (convex_hull.isVisible()) {
      //            convex_hull.calculateConvexHull(false);
      //          }
      //          actions.Do('move', [{catalogue_id: me.data.catalogue_id, latlng: me.data.init_latlng}] , [{catalogue_id: me.data.catalogue_id, latlng: me.latlng_}]);
      //       },
      //       start:function(event,ui){
      //         is_dragging = true;
      //         me.data.init_latlng = me.getProjection().fromDivPixelToLatLng(new google.maps.Point(ui.position.left-me.offsetHorizontal_,ui.position.top-me.offsetVertical_));
      //         if (click_infowindow!=null) {
      //           click_infowindow.hide();
      //         }
      //         if (over_tooltip!=null) {
      //           is_dragging = true;
      //           over_tooltip.hide();
      //         }
      //         if (edit_metadata!=null) {
      //           is_dragging = true;
      //           edit_metadata.hide();
      //         }
      //       }
      //     });
      //     $(div).draggable((this.draggable)?'enable':'disable');
      //   }
      // 
      //   var pixPosition = me.getProjection().fromLatLngToDivPixel(me.latlng_);
      //   if (pixPosition) {
      //     div.style.width = me.width_ + 'px';
      //     div.style.left = (pixPosition.x + me.offsetHorizontal_) + 'px';
      //     div.style.height = me.height_ + 'px';
      //     div.style.top = (pixPosition.y + me.offsetVertical_) + 'px';
      //   }
      // 
      // };
      // 
      // CreateMarker.prototype.remove = function() {
      //   if (this.div_) {
      //     this.div_.parentNode.removeChild(this.div_);
      //     this.div_ = null;
      //   }
      // };
      // 
      // CreateMarker.prototype.hide = function() {
      //   if (this.div_) {
      //     $(this.div_).find('div').fadeOut();
      //   }
      // };
      // 
      // CreateMarker.prototype.getPosition = function() {
      //  return this.latlng_;
      // };
      // 
      // CreateMarker.prototype.setPosition = function(latlng) {
      //   this.latlng_ = latlng;
      //   var div = this.div_;
      //   var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
      //   if (pixPosition) {
      //     div.style.width = this.width_ + 'px';
      //     div.style.left = (pixPosition.x + this.offsetHorizontal_) + 'px';
      //     div.style.height = this.height_ + 'px';
      //     div.style.top = (pixPosition.y + this.offsetVertical_) + 'px';
      //   }
      // };
      // 
      // CreateMarker.prototype.setDraggable = function(bool) {
      //   if (!bool) {
      //     $(this.div_).draggable("disable");
      //   } else {
      //     $(this.div_).draggable("enable");
      //   }
      // };
      // 
      // CreateMarker.prototype.setClickable = function() {
      //   
      // };