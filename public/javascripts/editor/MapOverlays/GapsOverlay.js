

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
    		  '<div class="three_gaps"><span><label>LATITUDE</label><input id="metadata_latitude" disabled="true" style="color:#dddddd" value=""/></span><span class="last"><label>LONGITUDE</label><input id="metadata_longitude" disabled="true" style="color:#dddddd"/></span></div>'+
    		  '<div class="three_gaps"><span><label>COLLECTION CODE</label><input id="metadata_collection" /></span><span><label>INSTITUTION CODE</label><input id="metadata_institution" /></span><span class="last"><label>CATALOG NUMBER</label><input id="metadata_catalog" /></span></div>'+
    		  '<div class="two_gaps"><span><label>BASIS OF RECORD</label><input id="metadata_basis" /></span></div>'+
    		  '<div class="two_gaps"><span><label>COLLECTOR</label><input id="metadata_collector" /></span><span class="short last"><label>DATE COLLECTED</label><input id="metadata_date" /></span></div>'+
    		  '<div class="three_gaps"><span><label>COUNTRY</label><input id="metadata_country" /></span><span><label>STATE/PROVINCE</label><input id="metadata_state" /></span><span class="last"><label>COUNTY</label><input id="metadata_county" /></span></div>' +
    		  '<div class="three_gaps"><span><label>ALTITUDE</label><input id="metadata_altitude" /></span><span><label>LOCALITY</label><input id="metadata_locality" /></span><span class="last"><label>PRECISSION</label><input id="metadata_precission" /></span></div>' +
    		  '<div class="two_gaps"><span><label>IDENTIFIER</label><input id="metadata_identifier" /></span></div>'+
    		  '<div class="one_gap"><span><label>GBIF NOTES</label><input id="metadata_gbif" /></span></div>'+
    		  '<div class="one_gap"><span><label>URL</label><input id="metadata_url" /></span></div>'+
    		  '<div class="slider_top"><label>PRECISSION</label><p>3KM</p></div>'+
    		  '<div class="slider"></div>'+
    		  '<span class="bottom"><a class="cancel">Cancel</a><a class="save">SAVE CHANGES</a></span>'
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
  					_markers[me.marker_id].data.accuracy = ui.value;
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

      $("div.metadata div.slider").slider('value',this.inf.accuracy);
      $(div).find('div.slider_top p').html(this.inf.accuracy + 'KM');
			
    	
    	$('#metadata_latitude').attr('value',this.latlng_.lat().toFixed(2));
    	$('#metadata_longitude').attr('value',this.latlng_.lng().toFixed(2)); 
    	(this.inf.collection_code!=undefined)?$('#metadata_collection').attr('value',this.inf.collection_code):''; 
			(this.inf.institution_code!=undefined)?$('#metadata_institution').attr('value',this.inf.institution_code):'';
			(this.inf.catalog_numer!=undefined)?$('#metadata_catalog').attr('value',this.inf.catalog_numer):'';
			(this.inf.basis_record!=undefined)?$('#metadata_basis').attr('value',this.inf.basis_record):'';
			(this.inf.collector!=undefined)?$('#metadata_collector').attr('value',this.inf.collector):'';
			(this.inf.date_collected!=undefined)?$('#metadata_date').attr('value',this.inf.date_collected):'';
			(this.inf.country!=undefined)?$('#metadata_country').attr('value',this.inf.country):'';
			(this.inf.state!=undefined)?$('#metadata_state').attr('value',this.inf.state):'';
			(this.inf.county!=undefined)?$('#metadata_county').attr('value',this.inf.county):'';
			(this.inf.altitude!=undefined)?$('#metadata_altitude').attr('value',this.inf.altitude):'';
			(this.inf.locality!=undefined)?$('#metadata_locality').attr('value',this.inf.locality):'';
			(this.inf.precission!=undefined)?$('#metadata_precission').attr('value',this.inf.precission):'';
			(this.inf.identifier!=undefined)?$('#metadata_identifier').attr('value',this.inf.identifier):'';
			(this.inf.gbif_notes!=undefined)?$('#metadata_gbif').attr('value',this.inf.gbif_notes):'';
			(this.inf.url!=undefined)?$('#metadata_url').attr('value',this.inf.url):'';

    	
      this.moveMaptoOpen();

      var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
      if (pixPosition) {
    	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
    	  div.style.top = (pixPosition.y + this.offsetVertical_) + "px";
      }
    	this.show();
    }
    
    
    
    GapsOverlay.prototype.save = function() {
      
      if (($('#metadata_collection').attr('value')!=this.inf.collection_code) || ($('#metadata_institution').attr('value')!=this.inf.institution_code) || ($('#metadata_catalog').attr('value')!=this.inf.catalog_numer)
        || ($('#metadata_basis').attr('value')!=this.inf.basis_record) || ($('#metadata_collector').attr('value')!=this.inf.collector) || ($('#metadata_date').attr('value')!=this.inf.date_collected)
        || ($('#metadata_country').attr('value')!=this.inf.country) || ($('#metadata_state').attr('value')!=this.inf.state) || ($('#metadata_county').attr('value')!=this.inf.county)
        || ($('#metadata_altitude').attr('value')!=this.inf.altitude) || ($('#metadata_locality').attr('value')!=this.inf.locality) || ($('#metadata_precission').attr('value')!=this.inf.precission)
        || ($('#metadata_identifier').attr('value')!=this.inf.identifier) || ($('#metadata_gbif').attr('value')!=this.inf.gbif_notes) || ($('#metadata_url').attr('value')!=this.inf.url)) {
        
          var old_data = new Object();
          old_data.collection_code = this.inf.collection_code; 
    			old_data.institution_code = this.inf.institution_code;
    			old_data.catalog_numer = this.inf.catalog_numer;
    			old_data.basis_record = this.inf.basis_record;
    			old_data.collector = this.inf.collector;
    			old_data.date_collected = this.inf.date_collected;
    			old_data.country = this.inf.country;
    			old_data.state = this.inf.state;
    			old_data.county = this.inf.county;
    			old_data.altitude = this.inf.altitude;
    			old_data.locality = this.inf.locality;
    			old_data.precission = this.inf.precission;
    			old_data.identifier = this.inf.identifier;
    			old_data.gbif_notes = this.inf.gbif_notes;
    			old_data.url = this.inf.url;
          
        	this.inf.collection_code = $('#metadata_collection').attr('value'); 
    			this.inf.institution_code = $('#metadata_institution').attr('value');
    			this.inf.catalog_numer = $('#metadata_catalog').attr('value');
    			this.inf.basis_record = $('#metadata_basis').attr('value');
    			this.inf.collector = $('#metadata_collector').attr('value');
    			this.inf.date_collected = $('#metadata_date').attr('value');
    			this.inf.country = $('#metadata_country').attr('value');
    			this.inf.state = $('#metadata_state').attr('value');
    			this.inf.county = $('#metadata_county').attr('value');
    			this.inf.altitude = $('#metadata_altitude').attr('value');
    			this.inf.locality = $('#metadata_locality').attr('value');
    			this.inf.precission = $('#metadata_precission').attr('value');
    			this.inf.identifier = $('#metadata_identifier').attr('value');
    			this.inf.gbif_notes = $('#metadata_gbif').attr('value');
    			this.inf.url = $('#metadata_url').attr('value');
          
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





