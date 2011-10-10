

    function GapsOverlay(latlng, info, map) {
      this.latlng_ = latlng;
    	this.inf = new Object();
      this.offsetVertical_ = -28;
      this.offsetHorizontal_ = 4;
      this.height_ = 533;
      this.width_ = 381;
      this.map_ = map;
      this.setMap(map);
    }

    GapsOverlay.prototype = new google.maps.OverlayView();

    GapsOverlay.prototype.draw = function() {
      var me = this;
    	var num = 0;

      var div = this.div_;
      if (!div) {
        div = this.div_ = document.createElement('div');
        $(div).addClass('metadata');
        div.style.position = "absolute";
        div.style.display = "none";
    		div.style.background = 'url(/images/editor/gaps_bkg.png) no-repeat 0 0';
    		div.style.zIndex = global_zIndex;
    		
    		$(div).append(
    		  '<a class="close"></a>'+
    		  '<h3>EDITING METADATA</h3>'+
    		  '<form action="">'+
    		  '<span class="error_latlng"><p>You need a valid lat/lng</p></span>'+
    		  '<div class="three_gaps"><span><label>LATITUDE</label><input onfocus="this.value = this.value;" type="text" id="metadata_latitude" value=""/></span><span class="last"><label>LONGITUDE</label><input onfocus="this.value = this.value;" type="text" id="metadata_longitude" /></span></div>'+
    		  '<div class="three_gaps"><span><label>COLLECTION CODE</label><input onfocus="this.value = this.value;" type="text" id="metadata_collection" /></span><span><label>INSTITUTION CODE</label><input onfocus="this.value = this.value;" type="text" id="metadata_institution" /></span><span class="last"><label>CATALOG NUMBER</label><input onfocus="this.value = this.value;" type="text" id="metadata_catalog" /></span></div>'+
    		  '<div class="two_gaps"><span><label>BASIS OF RECORD</label><input onfocus="this.value = this.value;" id="metadata_basis" /></span></div>'+
    		  '<div class="two_gaps"><span><label>COLLECTOR</label><input onfocus="this.value = this.value;" type="text" id="metadata_collector" /></span><span class="short last"><label>DATE COLLECTED</label><input onfocus="this.value = this.value;" type="text" id="metadata_date" /></span></div>'+
    		  '<div class="three_gaps"><span><label>COUNTRY</label><input onfocus="this.value = this.value;" type="text" id="metadata_country" /></span><span><label>STATE/PROVINCE</label><input onfocus="this.value = this.value;" type="text" id="metadata_state" /></span><span class="last"><label>COUNTY</label><input onfocus="this.value = this.value;" type="text" id="metadata_county" /></span></div>' +
    		  '<div class="three_gaps"><span><label>ALTITUDE</label><input onfocus="this.value = this.value;" type="text" id="metadata_altitude" /></span><span><label>LOCALITY</label><input onfocus="this.value = this.value;" type="text" id="metadata_locality" /></span><span class="last"><label>GBIF PRECISION</label><input onfocus="this.value = this.value;" type="text" id="metadata_precission" /></span></div>' +
    		  '<div class="two_gaps"><span><label>IDENTIFIER</label><input onfocus="this.value = this.value;" type="text" id="metadata_identifier" /></span></div>'+
    		  '<div class="one_gap"><span><label>NOTES</label><input onfocus="this.value = this.value;" type="text" id="metadata_gbif" /></span></div>'+
    		  '<div class="one_gap"><span><label>URL</label><a class="goGBIF" href="#" target="_blank">Visit URL</a><input type="text" onfocus="this.value = this.value;" id="metadata_url" /></span></div>'+
    		  '<div class="slider_top"><label>MAP PRECISION</label><p>3KM</p></div>'+
    		  '<div class="slider"></div>'+
    		  '<span class="bottom"><a class="cancel">Cancel</a><a class="save">SAVE CHANGES</a></span>'+
    		  '</form>'
    		);
    		
    		
    		

        var panes = this.getPanes();
        panes.floatPane.appendChild(div);
        
        
        $(div).find('a.close').hover(function(){
          $(this).css('background-position','0 -21px');
        },function(){
          $(this).css('background-position','0 0');
        });
        
        $(div).find('a.save').click(function(){
          me.save();
        });
        
        
        $(div).find('a.goGBIF').click(function(ev){
          ev.stopPropagation();
          ev.preventDefault();
          me.goGBIF();
        });
  
        
        $(div).find('a.close, a.cancel').click(function(){
          me.hide();
        });
        

				$("div.metadata div.slider").slider({
					range: "min",
					value: 11,
					min: 1,
					max: 50,
					slide: function(event, ui) {
					  occurrences[me.marker_id].set('distance',ui.value*1000);
  					occurrences[me.marker_id].data.coordinateUncertaintyInMeters = ui.value*1000;
  					$(div).find('div.slider_top p').html(ui.value + 'KM');
					}
				});

        
        
        google.maps.event.addDomListener(div,'mousedown',function(ev){ 
  		    try{
  					ev.stopPropagation();
  				}catch(e){
  					event.cancelBubble=true;
  				}; 
  		  });
  		  
  		  google.maps.event.addDomListener(div,'dblclick',function(ev){ 
  		    try{
  					ev.stopPropagation();
  				}catch(e){
  					event.cancelBubble=true;
  				}; 
  		  });
      }
      


      // Position the overlay 
      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
      if (pixPosition) {
    	  div.style.width = this.width_ + "px";
    	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
    	  div.style.height = this.height_ + "px";
    	  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
      }
    };


    GapsOverlay.prototype.remove = function() {
      if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      }
    };



    GapsOverlay.prototype.getPosition = function() {
     return this.latlng_;
    };



    GapsOverlay.prototype.transformCoordinates = function(point) {
      return this.getProjection().fromContainerPixelToLatLng(point);
    };



    GapsOverlay.prototype.changePosition = function(latlng,marker_id,opt) {

    	this.marker_id = marker_id;
    	this.latlng_ = latlng;
    	var div = this.div_;
    	div.style.zIndex = global_zIndex + 1;
    	this.inf = opt;

      //Value
      if (this.inf.coordinateUncertaintyInMeters<1000 || this.inf.coordinateUncertaintyInMeters==null) {
        var km_value = 1000;
      } else {
        var km_value = this.inf.coordinateUncertaintyInMeters/1000;
      }
      
      $("div.metadata div.slider").slider('value',km_value);
      $(div).find('div.slider_top p').html(km_value + 'KM');
			
    	
    	$('#metadata_latitude').attr('value',this.latlng_.lat());
    	$('#metadata_longitude').attr('value',this.latlng_.lng()); 
    	(this.inf.collectionCode!=undefined)?$('#metadata_collection').attr('value',unescape(this.inf.collectionCode)):$('#metadata_collection').attr('value',''); 
			(this.inf.institutionCode!=undefined)?$('#metadata_institution').attr('value',unescape(this.inf.institutionCode)):$('#metadata_institution').attr('value','');
			(this.inf.catalogNumber!=undefined)?$('#metadata_catalog').attr('value',unescape(this.inf.catalogNumber)):$('#metadata_catalog').attr('value','');
			(this.inf.basisOfRecord!=undefined)?$('#metadata_basis').attr('value',unescape(this.inf.basisOfRecord)):$('#metadata_basis').attr('value','');
			(this.inf.collector!=undefined)?$('#metadata_collector').attr('value',unescape(this.inf.collector)):$('#metadata_collector').attr('value','');
			(this.inf.eventDate!=undefined)?$('#metadata_date').attr('value',unescape(this.inf.eventDate)):$('#metadata_date').attr('value','');
			(this.inf.country!=undefined)?$('#metadata_country').attr('value',unescape(this.inf.country)):$('#metadata_country').attr('value','');
			(this.inf.stateProvince!=undefined)?$('#metadata_state').attr('value',unescape(this.inf.stateProvince)):$('#metadata_state').attr('value','');
			(this.inf.county!=undefined)?$('#metadata_county').attr('value',unescape(this.inf.county)):$('#metadata_county').attr('value','');
			(this.inf.verbatimElevation!=undefined)?$('#metadata_altitude').attr('value',unescape(this.inf.verbatimElevation)):$('#metadata_altitude').attr('value','');
			(this.inf.locality!=undefined)?$('#metadata_locality').attr('value',unescape(this.inf.locality)):$('#metadata_locality').attr('value','');
			(this.inf.coordinateUncertaintyInMeters!=undefined)?$('#metadata_precission').attr('value',unescape(this.inf.coordinateUncertaintyInMeters)):$('#metadata_precission').attr('value','');
			(this.inf.identifiedBy!=undefined)?$('#metadata_identifier').attr('value',unescape(this.inf.identifiedBy)):$('#metadata_identifier').attr('value','');
			(this.inf.occurrenceRemarks!=undefined)?$('#metadata_gbif').attr('value',unescape(this.inf.occurrenceRemarks)):$('#metadata_gbif').attr('value','');
			(this.inf.occurrenceDetails!=undefined)?$('#metadata_url').attr('value',unescape(this.inf.occurrenceDetails)):$('#metadata_url').attr('value','');

    	
      this.moveMaptoOpen();

      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
      if (pixPosition) {
    	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
    	  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
      }
    	this.show();
    }
    
    
    
    GapsOverlay.prototype.save = function() {
      
      if ((!isNaN($('#metadata_latitude').attr('value'))) && (!isNaN($('#metadata_longitude').attr('value'))) && ($('#metadata_longitude').attr('value')!='') && ($('#metadata_latitude').attr('value'))!='') {
        if (($('#metadata_collection').attr('value')!=unescape(this.inf.collectionCode)) || ($('#metadata_institution').attr('value')!=unescape(this.inf.institutionCode)) || ($('#metadata_catalog').attr('value')!=unescape(this.inf.catalogNumber))
          || ($('#metadata_basis').attr('value')!=unescape(this.inf.basisOfRecord)) || ($('#metadata_collector').attr('value')!=unescape(this.inf.collector)) || ($('#metadata_date').attr('value')!=unescape(this.inf.eventDate))
          || ($('#metadata_country').attr('value')!=unescape(this.inf.country)) || ($('#metadata_state').attr('value')!=unescape(this.inf.stateProvince)) || ($('#metadata_county').attr('value')!=unescape(this.inf.county))
          || ($('#metadata_altitude').attr('value')!=unescape(this.inf.verbatimElevation)) || ($('#metadata_locality').attr('value')!=unescape(this.inf.locality)) || ($('#metadata_precission').attr('value')!=unescape(this.inf.coordinateUncertaintyText))
          || ($('#metadata_identifier').attr('value')!=unescape(this.inf.identifiedBy)) || ($('#metadata_gbif').attr('value')!=unescape(this.inf.occurrenceRemarks)) || ($('#metadata_url').attr('value')!=unescape(this.inf.occurrenceDetails)) || ($('#metadata_latitude').attr('value')!=unescape(this.inf.latitude)) || ($('#metadata_longitude').attr('value')!=unescape(this.inf.longitude))) {
        
            var old_data = new Object();
            old_data.changed = (this.inf.changed!=undefined)?false:this.inf.changed; 
            old_data.collectionCode = (this.inf.collectionCode!=undefined)?unescape(this.inf.collectionCode):''; 
      			old_data.institutionCode = (this.inf.institutionCode!=undefined)?unescape(this.inf.institutionCode):'';
      			old_data.catalogNumber = (this.inf.catalogNumber!=undefined)?unescape(this.inf.catalogNumber):'';
      			old_data.basisOfRecord = (this.inf.basisOfRecord!=undefined)?unescape(this.inf.basisOfRecord):'';
      			old_data.collector = (this.inf.collector!=undefined)?unescape(this.inf.collector):'';
      			old_data.eventDate = (this.inf.eventDate!=undefined)?unescape(this.inf.eventDate):'';
      			old_data.country = (this.inf.country!=undefined)?unescape(this.inf.country):'';
      			old_data.stateProvince = (this.inf.stateProvince!=undefined)?unescape(this.inf.stateProvince):'';
      			old_data.county = (this.inf.county!=undefined)?unescape(this.inf.county):'';
      			old_data.verbatimElevation = (this.inf.verbatimElevation!=undefined)?unescape(this.inf.verbatimElevation):'';
      			old_data.locality = (this.inf.locality!=undefined)?unescape(this.inf.locality):'';
      			old_data.coordinateUncertaintyText = (this.inf.coordinateUncertaintyText!=undefined)?unescape(this.inf.coordinateUncertaintyText):'';
      			old_data.identifiedBy = (this.inf.identifiedBy!=undefined)?unescape(this.inf.identifiedBy):'';
      			old_data.occurrenceRemarks = (this.inf.occurrenceRemarks!=undefined)?unescape(this.inf.occurrenceRemarks):'';
      			old_data.occurrenceDetails = (this.inf.occurrenceDetails!=undefined)?unescape(this.inf.occurrenceDetails):'';
      			old_data.latitude = this.inf.latitude;
      			old_data.longitude = this.inf.longitude;
    			
          
            this.inf.changed = true;
          	this.inf.collectionCode = $('#metadata_collection').attr('value'); 
      			this.inf.institutionCode = $('#metadata_institution').attr('value');
      			this.inf.catalogNumber = $('#metadata_catalog').attr('value');
      			this.inf.basisOfRecord = $('#metadata_basis').attr('value');
      			this.inf.collector = $('#metadata_collector').attr('value');
      			this.inf.eventDate = $('#metadata_date').attr('value');
      			this.inf.country = $('#metadata_country').attr('value');
      			this.inf.stateProvince = $('#metadata_state').attr('value');
      			this.inf.county = $('#metadata_county').attr('value');
      			this.inf.verbatimElevation = $('#metadata_altitude').attr('value');
      			this.inf.locality = $('#metadata_locality').attr('value');
      			this.inf.coordinateUncertaintyText = $('#metadata_precission').attr('value');
      			this.inf.identifiedBy = $('#metadata_identifier').attr('value');
      			this.inf.occurrenceRemarks = $('#metadata_gbif').attr('value');
      			this.inf.occurrenceDetails = $('#metadata_url').attr('value');
      			this.inf.latitude = $('#metadata_latitude').attr('value');
      			this.inf.longitude = $('#metadata_longitude').attr('value');
    			
          
            occurrences[this.marker_id].data = this.inf;
            occurrences[this.marker_id].setPosition(new google.maps.LatLng(this.inf.latitude,this.inf.longitude));
						if (convex_hull.isVisible()) {
              $(document).trigger('occs_updated');
            }
            this.hide();
          
            actions.Do('edit',[{catalogue_id:this.marker_id,info:old_data}],[{catalogue_id:this.marker_id,info:this.inf}]);
        }
      } else {
        if (($('#metadata_longitude').attr('value')=='') || (isNaN($('#metadata_longitude').attr('value')))) {
          $('#metadata_longitude').addClass('error');
          $('span.error_latlng').css('left','94px');
        } else {
          $('#metadata_longitude').removeClass('error');
        }
        
        if (($('#metadata_latitude').attr('value')=='') || (isNaN($('#metadata_latitude').attr('value')))) {
          $('#metadata_latitude').addClass('error');
          $('span.error_latlng').css('left','-14px');
        } else {
          $('#metadata_latitude').removeClass('error');
        }
        $('span.error_latlng').fadeIn().delay(2000).fadeOut();
      }
    }
    



    GapsOverlay.prototype.hide = function() {
      if (this.div_) {
        $(this.div_).fadeOut();
        $('#metadata_longitude').removeClass('error');
        $('#metadata_latitude').removeClass('error');
      }
    }
    
    GapsOverlay.prototype.goGBIF = function(ev) {
      if ($('#metadata_url').attr('value')!='') {
        window.open($('#metadata_url').attr('value'));
      }
    }
    


    GapsOverlay.prototype.show = function() {
      if (this.div_) {
        var div = this.div_;
    		$(div).fadeIn();
    	}

    }
    
    
		GapsOverlay.prototype.moveMaptoOpen = function() {
			var left = 0;
			var top = 0;
			
		  var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);
			
			if (($('div#map').width() - pixPosition.x) < 388) {
				left = -(($('div#map').width() - pixPosition.x) - 388);
			}
			
			if (($('div#map').height()-pixPosition.y) < 533) {
				top = -($('div#map').height()-pixPosition.y-533);
			}
			
			this.map_.panBy(left,top);
		}
    


    GapsOverlay.prototype.isVisible = function() {
      if (this.div_) {
        var div = this.div_;		
		
    		if ($(div).css('display')!='none') {
    			return true;
    		} else {
    			return false;
    		}
    	}
    }





