
	$(document).ready(function() {


        //register the Upload button action
    $("#upload_input").change(function(event){
       $("#upload_form").submit(); 
    });

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
		if (google.loader.ClientLocation) {
      var zoom = 9;
      var latlng = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
    } else {
    	var zoom = 9;
      var latlng = new google.maps.LatLng(51.5001524, -0.1262362);       
    }
		
		map.setCenter(latlng);
		map.setZoom(zoom);
		
		$('#inputSearch').focus().autocomplete('http://data.gbif.org/species/nameSearch?maxResults=5&returnType=nameId&view=json',{
					dataType: 'jsonp',
					parse: function(data){
                      var animals = new Array();
                      gbif_data = data;

                      for(var i=0; i<gbif_data.length; i++) {
                        animals[i] = { data: gbif_data[i], value: gbif_data[i].scientificName, result: gbif_data[i].scientificName };
                      }

                      return animals;
					}, 
					formatItem: function(row, i, n, value, term) {
								
						var menu_string = '<p style="float:left;width:100%;font:bold 15px Arial;">' + value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>") + '</p>';
						return menu_string;
		      },					
					width: 404,
					height: 100,
					minChars: 4,
					max: 5,
					selectFirst: false,
					loadingClass: 'loader',
					multiple: false,
					scroll: false
				}).result(function(event,row){
					location.href = '/editor/' + row.id + '/' + escape(row.scientificName);
				});

		
		
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
			// var correct_ext = /\.rla|\.csv/;
			
	        var filename = upload_field.value;

	        /* Validation of filetype */
	        if (filename.search(correct_ext) == -1)
	        {
	            alert("ERROR - Formato no válido");
	            upload_field.form.reset();
	            return false;

	        }
			/* IF, EXT IS CORRECT => SUBMIT */
	        upload_field.form.submit();
	        // return true;
		}

	});