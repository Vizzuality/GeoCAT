  function getConvexHullPoints(points) {
        
    
    points = getPointCheck(points);
        
  	var maxX, minX;
  	var maxPt, minPt;
  	for (var idx in points) {
  		var pt = [points[idx].lat(),points[idx].lng()];
  		if (pt[0] > maxX || !maxX) {
  			maxPt = pt;
  			maxX = pt[0];
  		}
  		if (pt[0] < minX || !minX) {
  			minPt = pt;
  			minX = pt[0];
  		}
  	}
  	minPt = new google.maps.LatLng(minPt[0],minPt[1],true);
  	maxPt = new google.maps.LatLng(maxPt[0],maxPt[1],true);

  	
  	var allBaseLines = new Array();
  	var ch = [].concat(buildConvexHull([minPt, maxPt], points), buildConvexHull([maxPt, minPt], points))
  	var points = new Array();
  	for(var i in ch){
  		points.push(ch[i][0]);
  		points.push(ch[i][1]);
  	}

  	return points;

  	function buildConvexHull(baseLine, points) {
  		allBaseLines.push(baseLine)
  		var convexHullBaseLines = new Array();
  		var t = findMostDistantPointFromBaseLine(baseLine, points);
  		if (t.maxPoint && t.maxPoint.lat) {
  			convexHullBaseLines = convexHullBaseLines.concat( buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints) );
  			convexHullBaseLines = convexHullBaseLines.concat( buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints) );
  			return convexHullBaseLines;
  		} else {
  			return [baseLine];
  		}
  	}
  	function findMostDistantPointFromBaseLine(baseLine, points) {
  		var maxD = 0;
  		var maxPt = new Array();
  		var newPoints = new Array();
  		for (var idx in points) {
  			var pt = points[idx];
  			var d = getDistant(pt, baseLine);
  			if ( d > 0) {
  				newPoints.push(pt);
  			} else {
  				continue;
  			}
  			if ( d > maxD ) {
  				maxD = d;
  				maxPt = pt;
  			}
  		}
  		return {maxPoint:maxPt, newPoints:newPoints}
  	}
  	function getDistant(cpt, bl) {
  		cpt = [cpt.lat(),cpt.lng()];
  		bl  = [[bl[0].lat(),bl[0].lng()],[bl[1].lat(),bl[1].lng()]]
  		Vy = bl[1][0] - bl[0][0];
  		Vx = bl[0][1] - bl[1][1];
  		return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]))
  	}
  	
  	function getPointCheck(points_){
    	var MeanLng;
    	var maxPt, minPt;
    	var totalNeg = 0;
    	var totalPos = 0;
    	var NoNeg = 0;
    	var NoPos = 0;
    	var newPoints = new Array();
    	

    	for (var idx in points_) {
    		var long = points_[idx].lng();
    		if (long >= 0){
    			totalPos = totalPos + long;
    			NoPos = NoPos + 1;
    		  newPoints[idx] = new google.maps.LatLng(points_[idx].lat(),points_[idx].lng());
    		} else {
    		  totalNeg = totalNeg + long
    		  NoNeg = NoNeg + 1;
    		  newPoints[idx] = new google.maps.LatLng(points_[idx].lat(),points_[idx].lng() + 360,true);
    		}
    	}

    	var meanPos = totalPos / NoPos;
    	var meanNeg = totalNeg / NoNeg;
    	var disPos = meanPos - meanNeg;
    	var disNeg = (180 - meanPos) + (180 + meanNeg);
    	
    	if (disPos > 180) {
        return (newPoints.sort(sortpoints));
      } else {
    	  return (points_.sort(sortpoints));
    	}
    }
    function sortpoints(p1, p2){
    	return (p1.lng() - p2.lng());
    }
  }
  
