
      
      /*==========================================================================================================================*/
    	/*  																																																												*/
    	/*  																																																												*/
    	/*==========================================================================================================================*/



    		function LayerCustomization (file_layers) {
    		  var me = this;
    		  $('div#layer_window ul').jScrollPane({autoReinitialise:true});
          $('div#layer_window ul,div#layer_window ul li,div#layer_window ul.jspScrollable,div#layer_window ul div.jspContainer, div.scrollable-helper,ul#sources_list div.jspPane').disableSelection();
          $('div#layer_window ul,div#layer_window ul div.jspPane').sortable({revert:true,stop:function(){
            me.sortLayers();
          }});
    		  
    		  $('div#layer_window ul li a').livequery('click',function(ev){
    		    ev.stopPropagation();
    		    ev.preventDefault();
    		    if (!$(this).hasClass('loading')) {
    		      if ($(this).hasClass('add')) {
    		        $(this).text('ADDED');
    		        $(this).removeClass('add').addClass('added');
    		      } else {
    		        $(this).text('ADD');
    		        $(this).removeClass('added').addClass('add');
    		      }
    		      me.sortLayers();
    		    }
    		  });
    		  
    			this.upload_layers = file_layers;
    			this.layers = [];
    			this.getLayers();
    			this.index_layers = 0;
    			this.importation_errors = 0;
    		}



    		/*========================================================================================================================*/
    		/* */
    		/*========================================================================================================================*/
    		LayerCustomization.prototype.getLayers = function() {
    		  var me = this;
    		  $.getJSON("/data/layers.json",function(result){
    		    var this_ = me;
    		    var layers = result.layers;
    		    for (var i=0; i<layers.length; i++) {
    		      this_.layers[name] = layers[i];
    		      this_.addLayer(layers[i].name,layers[i].source,layers[i].url,layers[i].opacity,layers[i].type,true);
    		    }
    		    //Show errors of importation
    		  });
    		}
    		
    		
    		LayerCustomization.prototype.addLayer = function(name,source,url,opacity,type,add) {


    		  if (type == 'kml') {
    		    //var kml_layer = new google.maps.KmlLayer(url, { suppressInfoWindows: true, preserveViewport:true});
    		    //kml_layer.setMap(map);
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
                opacity:0.75,
                isPng: true,
                urlPattern:url
              });
                         
              this.layers[url] = {};
              this.layers[url].name = name;
        		  this.layers[url].source = source;
        		  this.layers[url].opacity = opacity;
        		  this.layers[url].type = type;
        		  this.layers[url].add = add;
              this.layers[url].layer = layer;
              this.layers[url].position = this.index_layers;
              
              if (add) {
                map.overlayMapTypes.push(null);
                map.overlayMapTypes.setAt(this.index_layers,layer);
        		    this.index_layers++;
              }
              
    		    } else {
    		      this.importation_errors++;
    		      return;
    		    }
    		  }

    		  var api = $('div#layer_window ul').data('jsp');
    		  api.getContentPane().prepend('<li url="'+url+'"><h4>'+name+'</h4><p>by '+source+'</p><a class="'+(add?'added':'add')+'">'+(add?'ADDED':'ADD')+'</a></li>');
    		  api.reinitialise();
    		}
    		

    		LayerCustomization.prototype.sortLayers = function() {
    		  var size = $('div#layer_window ul li').size()-1;
    		  var me = this;
    		  $('div#layer_window ul li a').each(function(i,element){
    		    var url = $(element).parent().attr('url');
            map.overlayMapTypes.setAt(size-i,($(this).hasClass('add'))?null:me.layers[url].layer);
            me.layers[url].position = size-i;
    		  });
    		}
    		
    		
    		