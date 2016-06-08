///Start custom poly fill code
PolyLineFill.prototype = new google.maps.OverlayView();

function PolyLineFill(poly, map, fill, stroke, pattern_stroke) {
   var bounds = new google.maps.LatLngBounds();
   for (var i = 0; i < poly.length; i++) {
       bounds.extend(poly[i]);
   }

   //initialize all properties.
   this.bounds_ = bounds;
   this.map_ = map;
   this.div_ = null;
   this.poly_ = poly;
   this.polysvg_ = null;
   this.fill_ = fill;
   this.stroke_ = stroke;
   this.pattern_stroke_ = pattern_stroke;

   // Explicitly call setMap on this overlay
   this.setMap(map);
}

PolyLineFill.prototype.onAdd = function () {
   // Create the DIV and set some basic attributes.
   var div = document.createElement('div');
   div.style.borderStyle = 'none';
   div.style.borderWidth = '0px';
   div.style.position = 'absolute';
   div.style.zIndex = '1';

   //createthe svg element
   var svgns = "http://www.w3.org/2000/svg";
   var svg = document.createElementNS(svgns, "svg");
   svg.setAttributeNS(null, "preserveAspectRatio", "xMidYMid meet");

   var def = document.createElementNS(svgns, "defs");

   //create the pattern fill
   var pattern = document.createElementNS(svgns, "pattern");
   pattern.setAttributeNS(null, "id", "lineFill");
   pattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
   pattern.setAttributeNS(null, "patternTransform", "rotate(-45)");
   pattern.setAttributeNS(null, "height", "7");
   pattern.setAttributeNS(null, "width", "7");
   def.appendChild(pattern);

   var rect = document.createElementNS(svgns, "rect");
   rect.setAttributeNS(null, "id", "rectFill");
   rect.setAttributeNS(null, "fill", this.fill_ || "red");
   rect.setAttributeNS(null, "fill-opacity", "0");
   rect.setAttributeNS(null, "stroke", this.stroke_ || "#666");
   rect.setAttributeNS(null, "stroke-dasharray", "7,7");
   rect.setAttributeNS(null, "height", "7");
   rect.setAttributeNS(null, "width", "7");
   pattern.appendChild(rect);

   svg.appendChild(def);

   //add polygon to the div
   var p = document.createElementNS(svgns, "polygon");
   p.setAttributeNS(null, "fill", "url(#lineFill)");
   p.setAttributeNS(null, "stroke", this.pattern_stroke_ || "#666");
   p.setAttributeNS(null, "stroke-width", "2");
   //set a reference to this element;
   this.polysvg_ = p;
   svg.appendChild(p);

   div.appendChild(svg);

   // Set the overlay's div_ property to this DIV
   this.div_ = div;

   var panes = this.getPanes();
   panes.overlayMouseTarget.appendChild(div);
}

PolyLineFill.prototype.AdjustPoints = function () {
   //adjust the polygon points based on the projection.
   var proj = this.getProjection();
   var sw = proj.fromLatLngToDivPixel(this.bounds_.getSouthWest());
   var ne = proj.fromLatLngToDivPixel(this.bounds_.getNorthEast());

   var points = "";
   for (var i = 0; i < this.poly_.length; i++) {
       var point = proj.fromLatLngToDivPixel(this.poly_[i]);
       if (i == 0) {
           points += (point.x - sw.x) + ", " + (point.y - ne.y);
       } else {
           points += " " + (point.x - sw.x) + ", " + (point.y - ne.y);
       }
   }
   return points;
}

PolyLineFill.prototype.draw = function () {
   // Size and position the overlay. We use a southwest and northeast
   // position of the overlay to peg it to the correct position and size.
   // We need to retrieve the projection from this overlay to do this.
   var overlayProjection = this.getProjection();

   // Retrieve the southwest and northeast coordinates of this overlay
   // in latlngs and convert them to pixels coordinates.
   // We'll use these coordinates to resize the DIV.
   var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
   var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

   // Resize the image's DIV to fit the indicated dimensions.
   var div = this.div_;
   div.style.left = sw.x + 'px';
   div.style.top = ne.y + 'px';
   div.style.width = (ne.x - sw.x) + 'px';
   div.style.height = (sw.y - ne.y) + 'px';

   this.polysvg_.setAttributeNS(null, "points", this.AdjustPoints());
}

PolyLineFill.prototype.onRemove = function () {
   this.div_.parentNode.removeChild(this.div_);
   this.div_ = null;
}