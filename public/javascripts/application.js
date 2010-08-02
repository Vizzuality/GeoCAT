
	$(document).ready(function() {


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
		
		
		
		$('#inputSearch').focus().autocomplete('http://data.gbif.org/species/nameSearch?rank=species&view=json&query=',{
					dataType: 'json',
					parse: function(data){
											console.log(data);
                                            var rows = new Array();
                                            rows = data["Result"]

                                            return rows;
					}, 
					formatItem: function(row, i, n) {
						
						alert('ESPECIE: '+ row);
						// var menu_string = '<img src="'+ row.image + '" style="float:left;margin:7px 7px 5px 2px;border:1px solid #ccc;"><div style="margin-top:7px;float:left;width:270px;font-size:13px;">' + row.english_name + '<br><span style="color:#aaa;font-size:10px; line-height:5px;">' + row.designation + '</span></div><div style="float:right;margin-top:7px; width:10px;">';
						// 
						// menu_string = menu_string + '</div>';
						// return menu_string;
		      		},					
					width: 335,
					height: 100,
					minChars: 4,
					max: 5,
					selectFirst: false,
					multiple: false,
					scroll: false
				}).result(function(event,row){
					
					location.href = row;
				});
		
		
		//input effect - hack
		$('form.upload input').hover(function(ev){
			$('form.upload a').css('background-position','0 -32px');	
		},
		function(ev){
			$('form.upload a').css('background-position','0 0');
		});
		
		$('#rla_name').change(function(){		
			// console.log(this);
			validateFile(this);			
		})
		
		
		function validateFile(upload_field){
			
			// console.log(upload_field);

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