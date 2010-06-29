var specie;  /* specie name */

var map;
var bounds;
var flickr_founded = [];
var gbif_founded = [];
var flickr_data = [];
var gbif_data = [];
var your_data = [];

var tooltip;
var overlay;
var global_id=1;
var _markers = [];


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
		
		
		//hover effect in browse input file
		$('li span div').hover(function(ev){
			$(this).find('a.browse').css('background-position','0 -21px');
		},function(ev){
			$(this).find('a.browse').css('background-position','0 0');
		});
		
		
		//change file input value
		$('li span div form input').change(function(ev){
			$(this).parent().parent().parent().find('a.import_data').addClass('enabled');
			$(this).parent().parent().addClass('selected');
			if ($(this).val().length>15) {
				$(this).parent().parent().find('p').text($(this).val().substr(0,12)+'...');
			} else {
				$(this).parent().parent().find('p').text($(this).val());
			}
		});	
		

		//open add sources container
		$("#add_source_button").click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
			if (!$('#add_source_container').is(':visible')) {
				openSources();
			} else {
				closeSources();
			}
		});
		
		//add source effects
		$("#add_source_container ul li a.checkbox").click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
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
			ev.stopPropagation();
			ev.preventDefault();
			if ($(this).hasClass('enabled')) {
					showMamufasMap();
					$("#add_source_container").fadeOut();
					$("#add_source_button").removeClass('open');
					switch($(this).parent().parent().find('a.checkbox').attr('id')) {
						case 'add_flickr': 	flickr_data = flickr_founded;
																setTimeout('addSourceToMap(flickr_data)',1000);
															 	break;
						case 'add_gbif':  	gbif_data = gbif_founded;
																setTimeout('addSourceToMap(gbif_data)',1000);
																break;
						default: 						null;
					}
					hideMamufasMap();
			}
		});
		
		
		
		//if the application comes through an upload file
		if ($('#upload_data').text()!='') {
			var upload_string = $('#upload_data').text();
			var upload_information = JSON.parse(upload_string);
			//show new mamufas that it covers all the stage?
			uploadRLA(upload_information);
			console.log(upload_information);
		}

	});
	
	
	
	function closeSources() {
		$("#add_source_container").fadeOut();
		$('#add_source_button').removeClass('open');
	}
	
	
	
	function openSources() {
		resetSourcesProperties();
		$("#add_source_container").fadeIn();
		$('#add_source_button').addClass('open');
	}
	
	
	
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
				function(result){
					switch(kind) {
						case 'add_flickr': 	flickr_founded.push(result[0]);
															 	break;
						case 'add_gbif':  	gbif_founded.push(result[0]);
																break;
						default: 						null;
					}
					$(element).find('span p').text(result[0].data.length + ((result[0].data.length == 1) ? " point" : " points") + ' founded');
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
		$('#mamufas_map').fadeIn();
		$('#loader_map').fadeIn();
	}	
	
	/* Hide mamufas map */
	function hideMamufasMap() {
		$('#loader_map').fadeOut(function(ev){
			$('div#import_success').fadeIn(function(ev){
				$(this).delay(2000).fadeOut('fast',function(ev){
					$('#mamufas_map').fadeOut();
				});
			});		
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
			$(this).find('div').removeClass('selected');
			$(this).find('div p').text('Select a file');
			$(this).find('div form input').attr('value','');
		});
		
		if (flickr_data[0]!=undefined && flickr_data[0].data.length!=0) {
			$('#add_flickr').parent().addClass('added');
		}
		
		if (gbif_data[0]!=undefined  &&  gbif_data[0].data.length!=0) {
			$('#add_gbif').parent().addClass('added');
		}
		
	}
	

		function addSourceToMap(information) {
				var image = new google.maps.MarkerImage(
					(information[0].name=='gbif')?'images/editor/Gbif_marker.png' :'images/editor/Flickr_marker.png',
					new google.maps.Size(25, 25),
					new google.maps.Point(0,0),
					new google.maps.Point(12, 12));

		    $.each(information[0].data, function(i,item){
   					bounds.extend(new google.maps.LatLng(item.latitude,item.longitude));
   					var object = new Object();
   					object.global_id = global_id;
   					object.item = item;
						object.item.active = true;
						object.kind = information[0].name;
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

   					google.maps.event.addListener(marker,"dragend",function(ev){
   						this.data.longitude = ev.latLng.c;
							this.data.latitude = ev.latLng.b;
   					});



   					var circle = new google.maps.Circle({
   					  map: map,
   					  radius: item.accuracy*2000,
   					  strokeColor: (information[0].name=='gbif')?'white':'pink',
   						strokeOpacity: 0.5,
   						strokeWeight: 1,
   						fillOpacity: 0.5,
   						fillColor: (information[0].name=='gbif')? 'white':'pink'
   					           	});
   					   
   					circle.bindTo('map', marker);
   					circle.bindTo('center', marker, 'position');
   					global_id++;
   					_markers.push(marker);				
    		});

				//Add this source in SOURCES COLUMN, count points, width bar...
				switch (information[0].name) {
					case 'gbif': 		$('div.sources ul').append('<li><a href="#" class="green" id="GBIF_points"><span> GBIF Points ('+information[0].data.length+')</span></a></li>');
													break;
					case 'flickr': 	$('div.sources ul').append('<li><a href="#" class="pink" id="Flickr_points"><span> Flickr Points ('+ information[0].data.length +')</span></a></li>');
													break;
					default: 				$('div.sources ul').append('<li><a href="#" class="blue" id="our_points"><span> Your Points ('+ information[0].data.length +')</span></a></li>');
				}
				calculateMapPoints();
				resizeBarPoints();
							
				 				map.fitBounds(bounds);
				 
				 				//MAP EVENTS
				 				google.maps.event.addListener(map,"bounds_changed",function(){
				 					if (overlay!=null) {
				 						overlay.hide();
				 					}
				 				});
				
				
					
		}
		
		
		function calculateMapPoints() {
			$('div.sources span p.count_points').text(((flickr_data[0]!=undefined)?flickr_data[0].data.length:null) + ((gbif_data[0]!=undefined)?gbif_data[0].data.length:null) + ((your_data[0]!=undefined)?your_data[0].data.length:null) + ' POINTS');
		}
		
		
		function resizeBarPoints() {
			var total_points = ((flickr_data[0]!=undefined)?flickr_data[0].data.length:null) + ((gbif_data[0]!=undefined)?gbif_data[0].data.length:null) + ((your_data[0]!=undefined)?your_data[0].data.length:null);
				
			if (flickr_data[0]!=undefined && flickr_data[0].data.length!=0) {
				$('div#editor div#tools div.center div.right div.sources a.pink span').css('background-position',((202*flickr_data[0].data.length)/total_points) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.pink span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*flickr_data[0].data.length)/total_points) - 217+ 'px 0');
				});

			}

			if (gbif_data[0]!=undefined  &&  gbif_data[0].data.length!=0) {
				$('div#editor div#tools div.center div.right div.sources a.green span').css('background-position',((202*gbif_data[0].data.length)/total_points) - 217+ 'px 0');
				$('div#editor div#tools div.center div.right div.sources a.green span').hover(function(ev){
					$(this).css('background-position','right 0');
				}, function(ev){
					$(this).css('background-position',((202*gbif_data[0].data.length)/total_points) - 217+ 'px 0');
				});
			}

		}
		
		
		
		function dowloadRLA() {
			var map_inf = new Object();
			map_inf.zoom = map.getZoom();
			map_inf.center = map.getCenter();
			
			var rla = new RLA(specie,flickr_data,gbif_data, null, _markers,map_inf,null);
			rla.download();
			
		}
		
		
		function uploadRLA(upload_data) {
			
			var rla = new RLA(null,null,null,null,null,null,upload_data);
			var app_data = rla.upload();
			
			console.log(app_data);
			
		}
		
	
	
	
	


