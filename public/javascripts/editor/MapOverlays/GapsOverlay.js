

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
        div = this.div_ = document.createElement('DIV');
        $(div).addClass('metadata');
        div.style.position = "absolute";
        div.style.display = "none";
    		div.style.background = 'url(/images/editor/gaps_bkg.png) no-repeat 0 0';
    		
    		$(div).append(
    		  '<a class="close"></a>'+
    		  '<h3>EDITING METADATA</h3>'+
    		  '<form action="">'+
    		  '<div class="three_gaps"><span><label>LATITUDE</label><input id="metadata_latitude" disabled="true" style="color:#dddddd" value=""/></span><span class="last"><label>LONGITUDE</label><input id="metadata_longitude" disabled="true" style="color:#dddddd"/></span></div>'+
    		  '<div class="three_gaps"><span><label>COLLECTION CODE</label><input id="metadata_collection" /></span><span><label>INSTITUTION CODE</label><input id="metadata_institution" /></span><span class="last"><label>CATALOG NUMBER</label><input id="metadata_catalog" /></span></div>'+
    		  '<div class="two_gaps"><span><label>BASIS OF RECORD</label><input id="metadata_basis" /></span></div>'+
    		  '<div class="two_gaps"><span><label>COLLECTOR</label><input id="metadata_collector" /></span><span class="short last"><label>DATE COLLECTED</label><input id="metadata_date" /></span></div>'+
    		  '<div class="three_gaps"><span><label>COUNTRY</label><input id="metadata_country" /></span><span><label>STATE/PROVINCE</label><input id="metadata_state" /></span><span class="last"><label>COUNTY</label><input id="metadata_county" /></span></div>' +
    		  '<div class="three_gaps"><span><label>ALTITUDE</label><input id="metadata_altitude" /></span><span><label>LOCALITY</label><input id="metadata_locality" /></span><span class="last"><label>PRECISSION</label><input id="metadata_precission" /></span></div>' +
    		  '<div class="two_gaps"><span><label>IDENTIFIER</label><input id="metadata_identifier" /></span></div>'+
    		  '<div class="one_gap"><span><label>NOTES</label><input id="metadata_gbif" /></span></div>'+
    		  '<div class="one_gap"><span><label>URL</label><a class="goGBIF" href="#" target="_blank">Visit URL</a><input id="metadata_url" /></span></div>'+
    		  '<div class="slider_top"><label>PRECISION</label><p>3KM</p></div>'+
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
					  _markers[me.marker_id].set('distance',ui.value*1000);
  					_markers[me.marker_id].data.coordinateUncertaintyInMeters = ui.value;
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



    GapsOverlay.prototype.changePosition = function(latlng,marker_id,opt) {

    	this.marker_id = marker_id;
    	this.latlng_ = latlng;
    	var div = this.div_;
    	this.inf = opt;

      $("div.metadata div.slider").slider('value',this.inf.coordinateUncertaintyInMeters);
      $(div).find('div.slider_top p').html(this.inf.coordinateUncertaintyInMeters + 'KM');
			
    	
    	$('#metadata_latitude').attr('value',this.latlng_.lat().toFixed(2));
    	$('#metadata_longitude').attr('value',this.latlng_.lng().toFixed(2)); 
    	(this.inf.collectionCode!=undefined)?$('#metadata_collection').attr('value',this.inf.collectionCode):$('#metadata_collection').attr('value',''); 
			(this.inf.institutionCode!=undefined)?$('#metadata_institution').attr('value',this.inf.institutionCode):$('#metadata_institution').attr('value','');
			(this.inf.catalogNumber!=undefined)?$('#metadata_catalog').attr('value',this.inf.catalogNumber):$('#metadata_catalog').attr('value','');
			(this.inf.basisOfRecord!=undefined)?$('#metadata_basis').attr('value',this.inf.basisOfRecord):$('#metadata_basis').attr('value','');
			(this.inf.collector!=undefined)?$('#metadata_collector').attr('value',this.inf.collector):$('#metadata_collector').attr('value','');
			(this.inf.eventDate!=undefined)?$('#metadata_date').attr('value',this.inf.eventDate):$('#metadata_date').attr('value','');
			(this.inf.country!=undefined)?$('#metadata_country').attr('value',this.inf.country):$('#metadata_country').attr('value','');
			(this.inf.stateProvince!=undefined)?$('#metadata_state').attr('value',this.inf.stateProvince):$('#metadata_state').attr('value','');
			(this.inf.county!=undefined)?$('#metadata_county').attr('value',this.inf.county):$('#metadata_county').attr('value','');
			(this.inf.verbatimElevation!=undefined)?$('#metadata_altitude').attr('value',this.inf.verbatimElevation):$('#metadata_altitude').attr('value','');
			(this.inf.locality!=undefined)?$('#metadata_locality').attr('value',this.inf.locality):$('#metadata_locality').attr('value','');
			(this.inf.coordinateUncertaintyText!=undefined)?$('#metadata_precission').attr('value',this.inf.coordinateUncertaintyText):$('#metadata_precission').attr('value','');
			(this.inf.identifiedBy!=undefined)?$('#metadata_identifier').attr('value',this.inf.identifiedBy):$('#metadata_identifier').attr('value','');
			(this.inf.occurrenceRemarks!=undefined)?$('#metadata_gbif').attr('value',this.inf.occurrenceRemarks):$('#metadata_gbif').attr('value','');
			(this.inf.occurrenceDetails!=undefined)?$('#metadata_url').attr('value',this.inf.occurrenceDetails):$('#metadata_url').attr('value','');

    	
      this.moveMaptoOpen();

      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
      if (pixPosition) {
    	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
    	  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
      }
    	this.show();
    }
    
    
    
    GapsOverlay.prototype.save = function() {
      
      if (($('#metadata_collection').attr('value')!=this.inf.collectionCode) || ($('#metadata_institution').attr('value')!=this.inf.institutionCode) || ($('#metadata_catalog').attr('value')!=this.inf.catalogNumber)
        || ($('#metadata_basis').attr('value')!=this.inf.basisOfRecord) || ($('#metadata_collector').attr('value')!=this.inf.collector) || ($('#metadata_date').attr('value')!=this.inf.eventDate)
        || ($('#metadata_country').attr('value')!=this.inf.country) || ($('#metadata_state').attr('value')!=this.inf.stateProvince) || ($('#metadata_county').attr('value')!=this.inf.county)
        || ($('#metadata_altitude').attr('value')!=this.inf.verbatimElevation) || ($('#metadata_locality').attr('value')!=this.inf.locality) || ($('#metadata_precission').attr('value')!=this.inf.coordinateUncertaintyText)
        || ($('#metadata_identifier').attr('value')!=this.inf.identifiedBy) || ($('#metadata_gbif').attr('value')!=this.inf.occurrenceRemarks) || ($('#metadata_url').attr('value')!=this.inf.occurrenceDetails)) {
        
          var old_data = new Object();
          old_data.collectionCode = this.inf.collectionCode; 
    			old_data.institutionCode = this.inf.institutionCode;
    			old_data.catalogNumber = this.inf.catalogNumber;
    			old_data.basisOfRecord = this.inf.basisOfRecord;
    			old_data.collector = this.inf.collector;
    			old_data.eventDate = this.inf.eventDate;
    			old_data.country = this.inf.country;
    			old_data.stateProvince = this.inf.stateProvince;
    			old_data.county = this.inf.county;
    			old_data.verbatimElevation = this.inf.verbatimElevation;
    			old_data.locality = this.inf.locality;
    			old_data.coordinateUncertaintyText = this.inf.coordinateUncertaintyText;
    			old_data.identifiedBy = this.inf.identifiedBy;
    			old_data.occurrenceRemarks = this.inf.occurrenceRemarks;
    			old_data.occurrenceDetails = this.inf.occurrenceDetails;
          
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
          
          _markers[this.marker_id].data = this.inf;
          this.hide();
          
          actions.Do('edit',[{catalogue_id:this.marker_id,info:old_data}],[{catalogue_id:this.marker_id,info:this.inf}]);
        
      }
    }
    



    GapsOverlay.prototype.hide = function() {
      if (this.div_) {
        $(this.div_).fadeOut();
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





