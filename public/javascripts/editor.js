var map;
var bounds;
var tooltip;
var overlay;
var global_id=1;
var flickr_markers = [];
var flickr_data;

	$(document).ready(function() {
	  var myLatlng = new google.maps.LatLng(30,0);
	  var myOptions = {
	    zoom: 2,
	    center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: false,
			scrollwheel: false
	  }
	  map = new google.maps.Map(document.getElementById("map"), myOptions);
		bounds = new google.maps.LatLngBounds();

	});


	function toggleMarker(element) {
		if ($(element).val()==0) {
			for(var i=0; i<flickr_markers.length;i++) {
					if ($(element).attr('checked')) {
						$('input[value="'+flickr_markers[i].data.global_id+'"]').attr('checked',true);
						flickr_markers[i].setMap(map);
					} else {
						$('input[value="'+flickr_markers[i].data.global_id+'"]').attr('checked',false);
						flickr_markers[i].setMap(null);
					}
			}
		} else {
			for(var i=0; i<flickr_markers.length;i++) {
				if ($(element).val()==flickr_markers[i].data.global_id) {
					if ($(element).attr('checked')) {
						flickr_markers[i].setMap(map);
						return;
					} else {
						flickr_markers[i].setMap(null);
						return;
					}
				}
			}
		}
	}
	
	
	function deleteMarker(iden) {
		//Remove tooltip
		overlay.hide();
		//Get Marker
		var marker;
		for(var i=0; i<flickr_markers.length;i++) {
			if (iden==parseInt(flickr_markers[i].data.global_id)) {
				//Delete marker and unbind circle
				flickr_markers[i].unbindAll();
				flickr_markers[i].setMap(null);
				delete flickr_markers[i];
				//Delete marker from array of flickr markers
				flickr_markers.splice(i,1);
				//Delete checkbox
				$('input[value="'+iden+'"]').parent().fadeIn('slow',function(ev){
					$(this).remove();
				});
				return;
			}
		}
	}
	
	
	
	function searchFlickr() {
					$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=83d63b531d7eb41fbaa916b1bc65ca9a&tags="+$('input#specie').attr('value').replace(' ','+')+"&extras=geo,+tags&format=json&has_geo=1&per_page=40&jsoncallback=?",
				function(data){
					$("#results").text(data.photos.total + " results");
					flickr_data = data;
			}
		);
	}
	
	
	function resetProperties() {
		if (flickr_markers.length>0) {
			for(var i=0; i<flickr_markers.length;i++) {
					$('input[value="'+flickr_markers[i].data.global_id+'"]').parent().remove();
					flickr_markers[i].unbindAll();
					flickr_markers[i].setMap(null);
					delete flickr_markers[i];
			}
		}
		flickr_markers = [];
		global_id = 1;
	}
	
	
	
	function addSourceToMap() {
			resetProperties();
			var image = new google.maps.MarkerImage('images/editor/marker.png',new google.maps.Size(12, 12),new google.maps.Point(0,0),new google.maps.Point(6, 6));

				bounds = new google.maps.LatLngBounds();
				
		    $.each(flickr_data.photos.photo, function(i,item){
					bounds.extend(new google.maps.LatLng(item.latitude,item.longitude));
					$('ul').append('<li><input type="checkbox" checked="true" value="'+global_id+'"/><label>'+item.title+'</label></li>');
					var object = new Object();
					object.global_id = global_id;
					object.item = item;
					var marker = new google.maps.Marker({
					        position: new google.maps.LatLng(item.latitude,item.longitude), 
									draggable: true,
					        map: map,
					        title: item.title,
									icon: image,
									data:object
					    });
					
					google.maps.event.addListener(marker,"click",function(ev){
						if (overlay!=null) {
							overlay.changePosition(new google.maps.LatLng(this.position.b,this.position.c),this.data.global_id,this.data.item);
							overlay.show();
						} else {
							overlay = new MarkerTooltip(new google.maps.LatLng(this.position.b,this.position.c), this.data.global_id, this.data.item,map);
						}
					});
					
					google.maps.event.addListener(marker,"dragstart",function(){
						if (overlay!=null) {
							overlay.hide();
						}
					});
					

			    var circle = new google.maps.Circle({
          	map: map,
          	radius: item.accuracy*2000,
 						strokeColor: "blue",
						strokeOpacity: 0.5,
						strokeWeight: 1,
						fillOpacity: 0.3,
						fillColor:"blue"
        	});

					circle.bindTo('map', marker);
        	circle.bindTo('center', marker, 'position');
					global_id++;
					flickr_markers.push(marker);					
 		    });
				map.fitBounds(bounds);

				//MAP EVENTS
				google.maps.event.addListener(map,"bounds_changed",function(){
					if (overlay!=null) {
						overlay.hide();
					}
				});

				$('ul li input[type="checkbox"]').change(function(ev){toggleMarker(this)});
				
	}
	
	
	
	


