
	var latlng;
	var map;
	var markers = [];
	var elevator;
	var polygon;
	var specie_type;

  window.onload = initApplication;

	function initApplication() {

    //register the Upload button action
    $("#upload_input").change(function(event){
       $("#upload_form").submit();
    });

		$('.flash').delay(5000).animate({height:0},300,function(ev){$('.flash').css('border','none');});


		// HOME
	  var myLatlng = new google.maps.LatLng(20,-3);
	  var myOptions = {
	    zoom: 8,
	    center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.TERRAIN,
			disableDefaultUI: true,
			scrollwheel: false
	  }

	  map = new google.maps.Map(document.getElementById("map"), myOptions);
		google.maps.event.addListener(map,"tilesloaded",function(event){generateObservations()});
		elevator = new google.maps.ElevationService();

  	var zoom = 9;
    latlng = new google.maps.LatLng(51.5001524, -0.1262362);

		map.setCenter(latlng);
		map.setZoom(zoom);


		//input effect - hack
		$('form.upload input').hover(function(ev){
			$('form.upload a').css('background-position','0 -32px');
		},
		function(ev){
			$('form.upload a').css('background-position','0 0');
		});

		$('#rla_name').change(function(){
			validateFile(this);
		})


		function validateFile(upload_field){
			var correct_ext = /\.rla/;
			var filename = upload_field.value;

      /* Validation of filetype */
      if (filename.search(correct_ext) == -1) {
          upload_field.form.reset();
          return false;
      }
			/* IF, EXT IS CORRECT => SUBMIT */
	    upload_field.form.submit();
		}

	}




	function generateObservations() {

		if (markers.length<10) {
			var bounds = map.getBounds();
		  var southWest = bounds.getSouthWest();
		  var northEast = bounds.getNorthEast();
		  var lngSpan = northEast.lng() - southWest.lng();
		  var latSpan = northEast.lat() - southWest.lat();
			var point = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(),southWest.lng() + lngSpan * Math.random());


			var positionalRequest = {'locations': [point]}

	    elevator.getElevationForLocations(positionalRequest, function(results, status) {
	      if (status == google.maps.ElevationStatus.OK) {
	        if (results[0]) {
						// Marine species or terrain species --> 0 marine 1 terrain
						if (markers.length==0) {
							if (results[0].elevation>0) {specie_type = 1} else {specie_type = 0}
							var marker = new HomeMarker(point, map);
							markers.push(marker);
							setTimeout('generateObservations()',300);
						} else {
							if (specie_type==1 && results[0].elevation>0) {
  							var marker = new HomeMarker(point, map);
								markers.push(marker);
								setTimeout('generateObservations()',300);
							} else if (specie_type==0 && results[0].elevation<0) {
  							var marker = new HomeMarker(point, map);
								markers.push(marker);
								  setTimeout('generateObservations()',300);
							} else {
								setTimeout('generateObservations()',0);
							}
						}
	        } else {
	          setTimeout('generateObservations()',0);
	        }
	      } else {
					var marker = new HomeMarker(point, map);
					markers.push(marker);
					setTimeout('generateObservations()',300);
	      }
	    });
		} else {
			var hullPoints = [];
			markers.sort(sortPointY);
			markers.sort(sortPointX);
			chainHull_2D(markers, markers.length, hullPoints);

			if (polygon != undefined) {
				polygon.setPath(this.markersToPoints(hullPoints));
			} else {
			  polygon = new google.maps.Polygon({
					paths: markersToPoints(hullPoints),
		      strokeColor: "#333333",
		      strokeOpacity: 0.01,
		      strokeWeight: 2,
		      fillColor: "#000000",
		      fillOpacity: 0.01
				});
				polygon.setMap(map);
			}

			var opacity_count = 1;
			var interval = setInterval(function(){
			  if (opacity_count>70) {
			    clearInterval(interval);
			  } else {
			    polygon.setOptions({fillOpacity: (0.002*opacity_count)});
  			  polygon.setOptions({strokeOpacity: (0.01*opacity_count)});
  			  opacity_count++;
			  }
			},50);


			setTimeout(function(){
				for (var i=0; i<markers.length; i++) {
					markers[i].setMap(null);
				}
				polygon.setPath([]);
				polygon.setOptions({fillOpacity: (0.01)});
			  polygon.setOptions({strokeOpacity: (0.01)});
				markers = [];
				generateObservations();
			},10000);
		}
	}




	function markersToPoints(path) {
		var result = [];
		for (var i=0; i<path.length; i++) {
				result.push(path[i].latlng_);
		}
		return result;
	}

	function sortPointX(a,b) {return a.latlng_.lng() - b.latlng_.lng();}
	function sortPointY(a,b) {return a.latlng_.lat() - b.latlng_.lat();}



	function goEditor() {
		var specie_name = $('#inputSearch').attr('value');
		if (specie_name.length>0) {
			window.location.href = "/editor/"+$('#inputSearch').attr('value');
		}
	}

