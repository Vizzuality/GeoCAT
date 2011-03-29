
      
      /*==========================================================================================================================*/
    	/*  																																																												*/
    	/*  																																																												*/
    	/*				LayerCustomization => Class to control layers of the map                           																*/
    	/*  																																																												*/
    	/*  																																																												*/
    	/*==========================================================================================================================*/


    	function LayerCustomization (file_layers) {
  		  var me = this;
  		  $('div#layer_window ul').jScrollPane({autoReinitialise:true});
        $('div#layer_window ul,div#layer_window ul li,div#layer_window ul.jspScrollable,div#layer_window ul div.jspContainer, div.scrollable-helper,ul#sources_list div.jspPane').disableSelection();
        $('div#layer_window ul,div#layer_window ul div.jspPane').sortable({
          revert:false,
          items: 'li',
          cursor: 'pointer',
          beforeStop:function(event,ui){
            $(ui.item).removeClass('moving');
            me.sortLayers();
          },
          start:function(event,ui){
            $(ui.item).addClass('moving');
          }
        });
  		  
  		  
  		  $('div#layer_window ul li a').livequery('click',function(ev){
  		    ev.stopPropagation();
  		    ev.preventDefault();
  		    var added;
  		    if (!$(this).hasClass('loading')) {
  		      if ($(this).hasClass('add')) {
  		        $(this).text('ADDED');
  		        added = true;
  		        $(this).removeClass('add').addClass('added');
  		      } else {
  		        $(this).text('ADD');
  		        added = false;
  		        $(this).removeClass('added').addClass('add');
  		      }
  		      me.addRemoveLayer($(this).parent().attr('url'),$(this).parent().attr('type'),added);
  		    }
  		  });
  		  
  		  
  		  // Import new layers events
  		  $('#import_layer input[type="text"]').livequery("focusin",function(ev){
  		    ev.stopPropagation();
  		    ev.preventDefault();
  		    var value = $(this).val();
          if (value=="Add source from URL...") {
            $(this).css('color','#666666');
            $(this).css('font','normal 11px Arial');
            $(this).val('');
          }
  		  });
  		  
  		  
  		  $('#import_layer input[type="text"]').livequery("focusout",function(ev){
  		    ev.stopPropagation();
  		    ev.preventDefault();
  		    var value = $(this).val();
          if (value=="Add source from URL..." || value=="") {
            $(this).css('color','#999999');
            $(this).css('font','italic 11px Arial');
            $(this).val('Add source from URL...');
          }
  		  });
  		  
  		  
  		  $('#import_layer').livequery("submit",function(ev){
  		    ev.stopPropagation();
  		    ev.preventDefault();
  		    var url = $('#import_layer input[type="text"]').val();
  		    
  		    if (me.layers[url]!=undefined) {
  		      $('span.layer_error p').text('This layer has already been added previously').parent().fadeIn().delay(2000).fadeOut();
  		    } else {
  		      if (url!='') {
      		    me.importLayer(url);
    		    } else {
    		      $('span.layer_error p').text('Write a valid KML or XYZ url...').parent().fadeIn().delay(2000).fadeOut();
    		    }
  		    }
  		  });
  		  
  		  
        $('div#layer_window ul li a.remove_layer').livequery('click',function(ev){
          var url = $(this).closest('li').attr('url');
          var type = $(this).closest('li').attr('type');
          me.removeLayer(url,type);
        });
  		  
        this.uplaod_layers = [];
  			this.upload_layers = file_layers;
  			this.layers = [];
  			this.getLayers();
  			this.index_layers = 0;
  			this.importation_errors = 0;
  		}



  		/*========================================================================================================================*/
  		/* Get locked layers from repository */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.getLayers = function() {
  		  var me = this;
  		  this.importation_errors = 0;
  		  $.getJSON("/data/layers.json?1",function(result){
  		    var layers = result.layers;
  		    if (me.upload_layers!=null) {
    		    layers = layers.concat(me.upload_layers);
  		    }
  		    for (var i=0; i<layers.length; i++) {
  		      var url = layers[i].url;
  		      if (me.layers[url]==undefined) {
    		      me.addLayer(layers[i].name,layers[i].source,layers[i].url,layers[i].opacity,layers[i].type,((layers[i].locked == undefined || layers[i].locked )?true:false), ((layers[i].locked != undefined)? true : false));
  		      }
  		    }
  		    if (this.importation_errors==1) {
  		      $('span.layer_error p').text('There was an error with importing the layers').parent().fadeIn().delay(2000).fadeOut();
  		    } else if (this.importation_errors>1) {
  		      $('span.layer_error p').text('There were '+this.importation_errors+' errors importing the layers').parent().fadeIn().delay(2000).fadeOut();
  		    }
  		  });
  		}
  		
  		
  		
  		/*========================================================================================================================*/
  		/* Import a new layer */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.importLayer = function(url) {
	      this.importation_errors = 0;
	      this.addLayer('','',url,0.5,'',false,true);
	      if (this.importation_errors==1) {
		      $('span.layer_error p').text('Review your layer url, seems to be incorrect').parent().fadeIn().delay(2000).fadeOut();
		    }
  		}
  		
  		
  		
  		
  		/*========================================================================================================================*/
  		/* Add a layer to the list */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.addLayer = function(name,source,url,opacity,type,locked,add) {

        if (type=='') {
          if (url.search('.kml')!=-1) {
            type = 'kml';
          } else {
            type = 'xyz';
          }
        }


  		  if (type == 'kml') {
  		    var kml_layer = new google.maps.KmlLayer(url, { suppressInfoWindows: true, preserveViewport:true});
  		    if (add) {
    		    kml_layer.setMap(map);
  		    } else {
    		    kml_layer.setMap(null);
  		    }
  		    this.layers[url] = {};
          this.layers[url].name = (name=='')?'User KML layer':name;
    		  this.layers[url].source = (source=='')?'user':source;
    		  this.layers[url].opacity = (opacity=='')?0.5:opacity;
    		  this.layers[url].type = type;
    		  this.layers[url].add = add;
          this.layers[url].layer = kml_layer;
          this.layers[url].position = 0;
          
          var api = $('div#layer_window ul').data('jsp');
    		  api.getContentPane().prepend('<li url="'+url+'" type="'+type+'"><h4>'+this.layers[url].name+'</h4><span><p>by '+this.layers[url].source+'</p>'+
    		  ((!locked)?'<a class="remove_layer">| Remove</a>':'')+
    		  '</span><a class="add_layer_link '+(add?'added':'add')+'">'+(add?'ADDED':'ADD')+'</a></li>');
    		  api.reinitialise();
          
  		  } else {
  		    if (url.search('{X}')!=-1 && url.search('{Z}')!=-1 && url.search('{Y}')!=-1) {
  		      var layer = new google.maps.ImageMapType({
              getTileUrl: function(tile, zoom) {
                var y = tile.y;
                var tileRange = 1 << zoom;
                if (y < 0 || y  >= tileRange) {
                  return null;
                }
                var x = tile.x;
                if (x < 0 || x >= tileRange) {
                  x = (x % tileRange + tileRange) % tileRange;
                }
                return this.urlPattern.replace("{X}",x).replace("{Y}",y).replace("{Z}",zoom);
              },
              tileSize: new google.maps.Size(256, 256),
              opacity:opacity,
              isPng: true,
              urlPattern:url
            });
            
            
            this.layers[url] = {};
            this.layers[url].name = (name=='')?'User XYZ layer':name;
      		  this.layers[url].source = (source=='')?'user':source;
      		  this.layers[url].opacity = (opacity=='')?0.5:opacity;
      		  this.layers[url].type = type;
      		  this.layers[url].add = add;
            this.layers[url].layer = layer;
            this.layers[url].position = this.index_layers;
            
            if (add) {
              map.overlayMapTypes.setAt(this.index_layers,layer);
      		    this.index_layers++;
            }
            
            var api = $('div#layer_window ul').data('jsp');
      		  api.getContentPane().prepend('<li url="'+url+'" type="'+type+'"><h4>'+this.layers[url].name+'</h4><span><p>by '+this.layers[url].source+'</p>'+
      		  ((!locked)?'<a class="remove_layer">| Remove</a>':'')+
      		  '</span><a class="add_layer_link '+(add?'added':'add')+'">'+(add?'ADDED':'ADD')+'</a></li>');
      		  api.reinitialise();
  		    } else {
  		      this.importation_errors++;
  		    }
  		  }
  		}
  		
  		
  		
  		/*========================================================================================================================*/
  		/* Add or remove a layer from the list */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.addRemoveLayer = function(url,type,added) {
  		  if (type == 'kml') {
  		    this.layers[url].layer.setMap((added)?map:null);
  		  } else {
  		    this.sortLayers();
  		  } 
  		}
  		
  		
  		
  		/*========================================================================================================================*/
  		/* Remove a layer from the list and map */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.removeLayer = function(url,type) {
  		  
        if (type == 'kml') {
          try {this.layers[url].layer.setMap(null);} catch (e) {}
        } else {
          $('div#layer_window ul li[url="'+url+'"] a.added').removeClass('added').addClass('add');

          var array = map.overlayMapTypes.getArray();
    		  console.log(array);
    		  for (var i in array) {
            if (this.layers[url].layer == array[i]) {
              map.overlayMapTypes.removeAt(i);
              break;
            }
          }
          
          this.sortLayers();
          
        } 
        $('div#layer_window ul li[url="'+url+'"]').remove();
  		}
  		
  		


  		/*========================================================================================================================*/
  		/* Sort layers list */
  		/*========================================================================================================================*/
  		LayerCustomization.prototype.sortLayers = function() {
  		  var me = this;
  		  var size = $('div#layer_window ul li[type="xyz"]').size() - 1;
  		  $('div#layer_window ul li[type="xyz"] a.add_layer_link').each(function(i,element){
  		    var url = $(element).parent().attr('url');
  		    var added = $(element).hasClass('added');
          map.overlayMapTypes.setAt(size-i,(!added)?null:me.layers[url].layer);
          me.layers[url].position = size-i;
  		  });
  		}
  		
  		
  		
  		/*========================================================================================================================*/
  		/* Open layers window */
  		/*========================================================================================================================*/
      function openLayers(event) {
        event.stopPropagation();
        event.preventDefault();
        changeApplicationTo();
        if (!$('a.layer').hasClass('selected')) {
          $('#layer_window').fadeIn();
          $('a.layer').addClass('selected');
          $('body').click(function(event) {
  			    if (!$(event.target).closest('#layer_window').length) {
			        $('#layer_window').fadeOut();
              $('a.layer').removeClass('selected');
							$('body').unbind('click');
							$(document).unbind('keydown');
  			    }
  				});
  				$(document).keydown(function (e) {
            if (e.keyCode == 27) { // ESC
              $('#layer_window').fadeOut();
              $('a.layer').removeClass('selected');
							$('body').unbind('click');
              $(document).unbind('keydown');
            }
          });
        }
      }
      
      
      
      /*========================================================================================================================*/
  		/* Close layers window */
  		/*========================================================================================================================*/
      function closeLayers(event) {
        event.stopPropagation();
        event.preventDefault();
        $('#layer_window').fadeOut();
        $('a.layer').removeClass('selected');
        $('body').unbind('click');
      }


  		
    		
    		
    		