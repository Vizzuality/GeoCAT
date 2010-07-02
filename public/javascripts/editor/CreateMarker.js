
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



	function CreateMarker(latlng, kind, draggable, clickable, data, map) {
	
		//Choose marker icon image.
		var image = new google.maps.MarkerImage('images/editor/'+ kind +'_marker.png',
																						new google.maps.Size(25, 25),
																						new google.maps.Point(0,0),
																						new google.maps.Point(12, 12));
	
		var object = new Object();
		object.global_id = global_id;
		object.item = data;
		object.item.active = true;
		object.kind = kind;
		var marker = new google.maps.Marker({
		        position: latlng, 
						draggable: draggable,
						clickable: clickable,
		        map: map,
						icon: image,
						data: object
		    });
	
	
		//Marker click event
		google.maps.event.addListener(marker,"click",function(ev){
			if (state == 'remove') {
				removeMarker(this);
			} else {
				if (overlay!=null) {
					overlay.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.global_id,this.data.item);
					overlay.show();
				} else {
					overlay = new MarkerTooltip(new google.maps.LatLng(this.position.b,this.position.c), this.data.global_id, this.data.item,map);
				}
			}
		});
	
	
		//Marker drag start event
		google.maps.event.addListener(marker,"dragstart",function(){						
			if (overlay!=null) {
				overlay.hide();
			}
		});


		//Marker drag end event
		google.maps.event.addListener(marker,"dragend",function(ev){
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
		  radius: data.accuracy*2000,
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