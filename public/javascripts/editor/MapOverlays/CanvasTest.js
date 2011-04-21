
  var test_canvas;
  var canvas_map;
  var myStage;

  function CanvasOVerlay(map) {
    this.map = map;
    this.canvas_ = null;
    this.setMap(this.map);
    this.bounds_ = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85,-180),
      new google.maps.LatLng(85,180)
    );
    this.points = [];
  }

  CanvasOVerlay.prototype = new google.maps.OverlayView();

  CanvasOVerlay.prototype.onAdd = function() {

    var canvas = document.createElement('svg');
    canvas.style.border = "3px solid red";
    canvas.style.position = "absolute";
    this.canvas_ = canvas;
    test_canvas = canvas;
    
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(canvas);
    
    var map_height = $('div#map').height();
    var map_width = $('div#map').width();
    canvas.setAttribute('width',map_width);
    canvas.setAttribute('height',map_height);
    
  }


  CanvasOVerlay.prototype.draw = function() {
    // var overlayProjection = this.getProjection();
    // 
    // var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    // var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
    // 
    // var canvas = this.canvas_;
    // canvas.style.left = '0';
    // canvas.style.top = '0';
    console.log('paint');
    
    // _.each(this.points,function(element){
    //   drawMarker(element.latitude,element.longitude,false);
    // });
  }
  
  
  
  function drawMarker(lat,lng,save) {
    var pixPosition = canvas_map.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(lat,lng));
    
    var new_canvas = document.createElement('canvas');
    test_canvas.appendChild(new_canvas);
    
    new_canvas.style.position = "absolute";
    new_canvas.style.width = '22px!important';
    new_canvas.style.height = '22px!important';
    new_canvas.style.zIndex = 0;
    new_canvas.setAttribute('width',22);
    new_canvas.setAttribute('height',22);
    new_canvas.style.left = pixPosition.x + 'px';
    new_canvas.style.top = pixPosition.y + 'px';
    
    $(new_canvas).hover(function(){
      $(this).css('cursor','pointer');
    });
    
    if (new_canvas.getContext) {
      var context = new_canvas.getContext('2d');
      context.fillStyle = "rgba(255,255,255,0.75)";
      context.beginPath();
      context.arc(11,11,11,0,Math.PI*2,false);
      context.fill();
      context.fillStyle = "#FF3399"; //pink
      context.beginPath();
      context.arc(11,11,8,0,Math.PI*2,false);
      context.closePath();
      context.fill();
      //if (save) canvas_map.points.push({latitude:lat,longitude:lng});
    }
 
  }
  
  
  function draw10000() {
    for (var i=0; i<10000; i++) {
      var bounds = map.getBounds();
      var southWest = bounds.getSouthWest();
      var northEast = bounds.getNorthEast();
      var lngSpan = northEast.lng() - southWest.lng();
      var latSpan = northEast.lat() - southWest.lat();
      var point = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(),southWest.lng() + lngSpan * Math.random());
      drawMarker(point.lat(),point.lng(),false);
    }
  }
  
  
  function drawOld() {
    for (var i=0; i<10000; i++) {
      var bounds = map.getBounds();
      var southWest = bounds.getSouthWest();
      var northEast = bounds.getNorthEast();
      var lngSpan = northEast.lng() - southWest.lng();
      var latSpan = northEast.lat() - southWest.lat();
      var point = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(),southWest.lng() + lngSpan * Math.random());
      new CreateMarker(new google.maps.LatLng(point.lat(),point.lng()), 'user', true, true, {geocat_kind:'user',catalogue_id:'0'}, map);
    }
  }
  