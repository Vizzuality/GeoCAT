
	$(document).ready(function() {
		$('form.upload input').hover(function(ev){
			$('form.upload a').css('background-position','0 -32px');		
		},
		function(ev){
			$('form.upload a').css('background-position','0 0');
		});
	});