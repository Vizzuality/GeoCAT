
	/*==========================================================================================================================*/
	/*  																																																												*/
	/*				CreateMarker => Create a new marker with circle. (Events included)																								*/
	/*						*Params ->	latlng: position in the map.																																			*/
	/*												kind: type of the marker.																																					*/
	/*												draggable: if it will be draggable at the start.																									*/
	/*												clickable: if it will be clickable at the start.																									*/
	/*												data: marker information like name, id, lon&lat, ...																							*/
	/*												map: where the marker goes...																																			*/
	/*  																																																												*/
	/*==========================================================================================================================*/



	function CreateMarker(latlng, kind, draggable, clickable, item, map) {
	
		//Choose marker icon image.
		var image = new google.maps.MarkerImage('images/editor/'+ kind +'_marker.png',
																						new google.maps.Size(25, 25),
																						new google.maps.Point(0,0),
																						new google.maps.Point(12, 12));
	
	
		var marker = new google.maps.Marker({
		        position: latlng, 
						draggable: draggable,
						clickable: clickable,
		        map: map,
						icon: image,
						data: item
		    });
	
	
		//Marker click event
		google.maps.event.addListener(marker,"click",function(ev){
			if (state == 'remove') {
				
				if (delete_infowindow!=null) {					
					if (this.position.b!=delete_infowindow.latlng_.lat() || this.position.c!=delete_infowindow.latlng_.lng() || this.data.item.accuracy!=delete_infowindow.inf.accuracy || this.data.item.collector!=delete_infowindow.inf.collector || !delete_infowindow.isVisible()) {
						delete_infowindow.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.global_id,this.data.item);
					}
				} else {
					delete_infowindow = new DeleteInfowindow(new google.maps.LatLng(this.position.b,this.position.c), this.data.global_id, this.data.item,map);
				}				
				
			} else {
				if (over_tooltip!=null) {
					over_tooltip.hide();
				}
				
				if (click_infowindow!=null) {					
					if (this.position.b!=click_infowindow.latlng_.lat() || this.position.c!=click_infowindow.latlng_.lng() || this.data.item.accuracy!=click_infowindow.inf.accuracy || this.data.item.collector!=click_infowindow.inf.collector || !click_infowindow.isVisible()) {
						click_infowindow.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.global_id,this.data.item);
					}
				} else {
					click_infowindow = new MarkerTooltip(new google.maps.LatLng(this.position.b,this.position.c), this.data.global_id, this.data.item,map);
				}
			}
		});
		

		//Marker mouseover event
		google.maps.event.addListener(marker,"mouseover",function(ev){
			if (state == 'select') {
				over_marker = true;
							
				if (click_infowindow != null) {
					if (!is_dragging && !click_infowindow.isVisible()) {
						if (over_tooltip!=null) {
							over_tooltip.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.catalogue_id);
							over_tooltip.show();
						} else {
							over_tooltip = new MarkerOverTooltip(new google.maps.LatLng(this.position.b,this.position.c), this.data.catalogue_id, map);
						}
					}
				} else {
					if (!is_dragging) {
						if (over_tooltip!=null) {
							over_tooltip.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.catalogue_id);
							over_tooltip.show();
						} else {
							over_tooltip = new MarkerOverTooltip(new google.maps.LatLng(this.position.b,this.position.c), this.data.catalogue_id, map);
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
		google.maps.event.addListener(marker,"dragstart",function(){						
			if (click_infowindow!=null) {
				click_infowindow.hide();
			}
			if (over_tooltip!=null) {
				is_dragging = true;
				over_tooltip.hide();
			}
		});
		

		//Marker drag event
		google.maps.event.addListener(marker,"drag",function(ev){						
			this.data.longitude = ev.latLng.c;
			this.data.latitude = ev.latLng.b;
			if (isConvexHull()) {
				calculateConvexHull();
			}
		});


		//Marker drag end event
		google.maps.event.addListener(marker,"dragend",function(ev){
			is_dragging = false;
			this.data.longitude = ev.latLng.c;
			this.data.latitude = ev.latLng.b;
		});


		//Create circle of accuracy
		var color;
		switch (kind) {
			case 'gbif': 		color = '#FFFFFF';
											break;
			case 'flickr': 	color = '#FF3399';
											break;
			default: 				color = '#066FB6';
		}
		
		var circle = new google.maps.Circle({
		  map: map,
		  radius: item.accuracy*2000,
		  strokeColor: color,
			strokeOpacity: 0.3,
			strokeWeight: 1,
			fillOpacity: 0.3,
			fillColor: color
		});
	   
		circle.bindTo('map', marker);
		circle.bindTo('center', marker, 'position');
	
		return marker;
	}