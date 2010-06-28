
	$(document).ready(function() {
		
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
			
			var correct_ext = /\.rla|\.cvs/;
			
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