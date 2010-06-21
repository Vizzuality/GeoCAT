var specie;  /* specie name */

var map;
var bounds;
var flickr_founded = [];
var gbif_founded = [];
var flickr_data = [];
var gbif_data = [];


 var tooltip;
 var overlay;
 var global_id=1;
 var flickr_markers = [];

	$(document).ready(function() {
		
		//Get scientific_name
		specie = $('a#scientific_name').text();
		
		//initialize map
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
		
		
		//open add sources container
		$("#add_source_button").click(function(ev){
			if (!$('#add_source_container').is(':visible')) {
				resetSourcesProperties();
				$("#add_source_container").fadeIn();
				$(this).addClass('open');
			}
		});
		
		//add source effects
		$("#add_source_container ul li a.checkbox").click(function(ev){
			if (!$(this).parent().hasClass('selected') && !$(this).parent().hasClass('added')) {
				removeSelectedSources();
				$(this).parent().addClass('selected');
				if (!$(this).parent().find('span p').hasClass('loaded')) {
					callSourceService($(this).attr('id'),$(this).parent());
				}
			}
		});
		
		//import data
		$("a.import_data").click(function(ev){
			if ($(this).hasClass('enabled')) {
				showMamufasMap();
				$(this).text('close');
				switch($(this).parent().parent().find('a.checkbox').attr('id')) {
					case 'add_flickr': 	flickr_data = flickr_founded;
															addSourceToMap(flickr_data);
														 	break;
					case 'add_gbif':  	gbif_data = gbif_founded;
															addSourceToMap(gbif_data);
															break;
					default: 						null;
				}
			}
		});
		

		//searchFlickr();
	});
	
	
	
	/* Remove selected class in -> add source window */
	function removeSelectedSources() {
		$("#add_source_container ul li").each(function(i,item){
			$(this).removeClass('selected');
		});
	}
	
	
	/* Get data from api service thanks to the name (flickr,gbif,...etc) */
	function callSourceService(kind,element) {
		var url;
		switch(kind) {
			case 'add_flickr': 	url = "/search/flickr/";
												 	break;
			case 'add_gbif':  	url= "/search/gbif/";
													break;
			default: 						url ="/";
		}
		
		$.getJSON(url + specie.replace(' ','+'),
				function(data){
					console.log(data);
					switch(kind) {
						case 'add_flickr': 	flickr_founded = data;
															 	break;
						case 'add_gbif':  	gbif_founded = data;
																break;
						default: 						null;
					}
					$(element).find('span p').text(data[0].data.length + ((data[0].data.length == 1) ? " point" : " points") + ' founded');
					onLoadedSource(element);
				}
		);
		
	}
	
	
	/* Change state loading source to loaded source */
	function onLoadedSource(element) {
		$(element).find('span p').addClass('loaded');
		$(element).find('span a').addClass('enabled');
	}
	
	
	/* Show mamufas map */
	function showMamufasMap() {
		$('#mamufas_map').show('fast',function(ev){
			$('#mamufas_map span').show('fast');
		});
	}
	
	
	/* Hide mamufas map */
	function hideMamufasMap() {
		$('#mamufas_map span').hide('fast',function(ev){
			$('#mamufas_map').hide('fast');
		});	
	}
	
	
	function resetSourcesProperties() {
		flickr_founded = [];
		gbif_founded = [];
		
		$("#add_source_container ul li").each(function(i,item){
			$(this).removeClass('selected');
			$(this).removeClass('added');
			$(this).find('span p').removeClass('loaded');
			$(this).find('span a').removeClass('enabled');
			$(this).find('span a').text('import');
		});
		
		if (flickr_data.length!=0) {
			$('#add_flickr').parent().addClass('added');
		}
		
		if (gbif_data.length!=0) {
			$('add_gbif').parent().addClass('added');
		}
		
	}
	
	

	// function toggleMarker(element) {
	// 		if ($(element).val()==0) {
	// 			for(var i=0; i<flickr_markers.length;i++) {
	// 					if ($(element).attr('checked')) {
	// 						$('input[value="'+flickr_markers[i].data.global_id+'"]').attr('checked',true);
	// 						flickr_markers[i].setMap(map);
	// 					} else {
	// 						$('input[value="'+flickr_markers[i].data.global_id+'"]').attr('checked',false);
	// 						flickr_markers[i].setMap(null);
	// 					}
	// 			}
	// 		} else {
	// 			for(var i=0; i<flickr_markers.length;i++) {
	// 				if ($(element).val()==flickr_markers[i].data.global_id) {
	// 					if ($(element).attr('checked')) {
	// 						flickr_markers[i].setMap(map);
	// 						return;
	// 					} else {
	// 						flickr_markers[i].setMap(null);
	// 						return;
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	
	// 	
	// 	function deleteMarker(iden) {
	// 		//Remove tooltip
	// 		overlay.hide();
	// 		//Get Marker
	// 		var marker;
	// 		for(var i=0; i<flickr_markers.length;i++) {
	// 			if (iden==parseInt(flickr_markers[i].data.global_id)) {
	// 				//Delete marker and unbind circle
	// 				flickr_markers[i].unbindAll();
	// 				flickr_markers[i].setMap(null);
	// 				delete flickr_markers[i];
	// 				//Delete marker from array of flickr markers
	// 				flickr_markers.splice(i,1);
	// 				//Delete checkbox
	// 				$('input[value="'+iden+'"]').parent().fadeIn('slow',function(ev){
	// 					$(this).remove();
	// 				});
	// 				return;
	// 			}
	// 		}
	// 	}
	// 	
	// 	
	// 	
	// 	function searchFlickr() {
	// 				$.getJSON("/search/flickr/"+ specie.replace(' ','+'),
	// 				function(data){
	// 					console.log(data);
	// 					flickr_data = data;
	// 					addSourceToMap();
	// 			}
	// 		);
	// 	}
	// 	
	// 	
	// 	function resetProperties() {
	// 		if (flickr_markers.length>0) {
	// 			for(var i=0; i<flickr_markers.length;i++) {
	// 					$('input[value="'+flickr_markers[i].data.global_id+'"]').parent().remove();
	// 					flickr_markers[i].unbindAll();
	// 					flickr_markers[i].setMap(null);
	// 					delete flickr_markers[i];
	// 			}
	// 		}
	// 		flickr_markers = [];
	// 		global_id = 1;
	// 	}
	// 	
	// 	
	// 	
		function addSourceToMap(information) {
				var image = new google.maps.MarkerImage('images/editor/Flickr_marker.png',new google.maps.Size(25, 25),new google.maps.Point(0,0),new google.maps.Point(12, 12));
					console.log(information);
					
			    $.each(information[0].data, function(i,item){
						bounds.extend(new google.maps.LatLng(item.latitude,item.longitude));
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
	 						strokeColor: "pink",
							strokeOpacity: 0.5,
							strokeWeight: 1,
							fillOpacity: 0.5,
							fillColor:"pink"
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
					
					hideMamufasMap();
	
					
		}
	
	
	
	


