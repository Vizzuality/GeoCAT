		var allBaseLines = [];
		
		function getConvexHullPoints(points) {
			
			
			var MeanLng;
			var maxPt, minPt;
			var totalNeg = 0;
			var totalPos = 0;
			var NoNeg = 0;
			var NoPos = 0;
			var newPoints = new Array();

			for (var idx in points) {
				var long = points[idx].getPosition().lng();
				if (long >= 0){
					totalPos = totalPos + long;
					NoPos = NoPos + 1;
					newPoints[idx] = new google.maps.LatLng(points[idx].getPosition().lat(),points[idx].getPosition().lng());
				} else {
					totalNeg = totalNeg + long
					NoNeg = NoNeg + 1;
					newPoints[idx] = new google.maps.LatLng(points[idx].getPosition().lat(),points[idx].getPosition().lng() + 360,true);
				}
			}

			var meanPos = totalPos / NoPos;
			var meanNeg = totalNeg / NoNeg;
			var disPos = meanPos - meanNeg;
			var disNeg = (180 - meanPos) + (180 + meanNeg);

			if (disPos > 180) {
				points = newPoints.sort(sortpoints);
			} else {
				points = points.sort(sortpoints);
			}
			console.log(newPoints);
			console.log(points);
			
			
			
			
			
			
			
			
			
			//find first baseline
			var maxX, minX;
			var maxPt, minPt;
			for (var idx in points) {
				// transform point to [lat,lng] array from LatLng
				var pt = [points[idx].getPosition().lat(),points[idx].getPosition().lng()];
				if (pt[0] > maxX || !maxX) {
					maxPt = pt;
					maxX = pt[0];
				}
				if (pt[0] < minX || !minX) {
					minPt = pt;
					minX = pt[0];
				}
			}
			
			
			// transform point back into a LatLng
			minPt = new google.maps.LatLng(minPt[0],minPt[1],true);
			maxPt = new google.maps.LatLng(maxPt[0],maxPt[1],true);
			
			//console.log(minPt);
			//console.log(maxPt);
			
			// get all baselines
			allBaseLines = new Array();
			var ch = [].concat(buildConvexHull([minPt, maxPt], points), buildConvexHull([maxPt, minPt], points));
			
			//console.log(buildConvexHull([minPt, maxPt], points));
			//console.log(buildConvexHull([maxPt, minPt], points));
			
			//console.log(ch);
			
			// turn baseline array into points array
			var points = new Array();
			for(var i in ch){
				points.push(ch[i][0]);
				points.push(ch[i][1]);
			}
			
			return points;

			// private functions
			function buildConvexHull(baseLine, points) {
				allBaseLines.push(baseLine);
				//console.log(allBaseLines);
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
				// transform LatLn into array
				cpt = [cpt.getPosition().lat(),cpt.getPosition().lng()];
				bl  = [[bl[0].lat(),bl[0].lng()],[bl[1].lat(),bl[1].lng()]]
				// get distance from point to baseline
				Vy = bl[1][0] - bl[0][0];
				Vx = bl[0][1] - bl[1][1];
				// return distance (dotproduct or crossproduct?)
				return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]));
			}
			
			function sortpoints(p1, p2){
				return (p1.getPosition().lng() - p2.getPosition().lng());
			}
		}
