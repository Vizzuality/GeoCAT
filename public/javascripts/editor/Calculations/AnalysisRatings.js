


			function getAnalysisData(convex_area, convex_points) {
				
				
				/*=======================================*/
				/* Get distance between two points. */
				/*=======================================*/
				function distanceFrom(latlng1, latlng2) {
				    var R = 6378137; // meters
					  var lat1 = latlng1.lat();
					  var lon1 = latlng1.lng();
					  var lat2 = latlng2.lat();
					  var lon2 = latlng2.lng();
					  var dLat = (lat2-lat1) * Math.PI / 180;
					  var dLon = (lon2-lon1) * Math.PI / 180;
					  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * Math.sin(dLon/2) * Math.sin(dLon/2);
					  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
					  var d = R * c;
					  return d;
				}
				
				
				
				/*=======================================*/
				/* Get diameter of the points. */
				/*=======================================*/
				function getDiameter(points) {
					var diamaxt, diamax;
					var p1, p2;
					var test;
					test = 0;
					diamax = 0;
					diamaxt = 0;
					var plist1  = new Array();
					plist1 = points;
					for (var idy in points){
						p1 = points[idy];
						for (var idx in plist1) {
							test = test + 1;
							p2 = points[idx];
							diamaxt = distanceFrom(p1,p2);
							if (diamaxt > diamax) {
								diamax = diamaxt;
							}
						}
					}
					return diamax/1000;
				}
				
				
				/*=======================================*/
				/* EOO rating, change image icon in app. */
				/*=======================================*/
				function EOOrating (EOOarea) {
					var EOOString = "lc";
					if (EOOarea < 100) {
					  EOOString = "cr";
					  }
					else if (EOOarea < 5000) {
					  EOOString = "en";
					  }
					else if (EOOarea < 20000) {
					  EOOString = "vu";
					  }
					else if (EOOarea < 45000) {
					  EOOString = "nt";
					  }
					return (EOOString);
				}

				/*=======================================*/
				/* AOO rating, change image icon in app. */
				/*=======================================*/
				function AOOrating (AOOArea) {
					var AOOString = "lc";
					if (AOOArea < 10) {
					  AOOString = "cr";
					  }
					else if (AOOArea < 500) {
					  AOOString = "en";
					  }
					else if (AOOArea < 2000) {
					  AOOString = "vu";
					  }
					else if (AOOArea < 4500) {
					  AOOString = "nt";
					  }
					return (AOOString);
				}
				
				
				var EOORat = EOOrating(convex_area);
				
				// Get Diameter
			  //var diameter = getDiameter(convex_points);
		    //var cellsize = diameter * 100;
				var cellsize = 200000;
				
				// Does AOO
		    //var AOO = DrawAOO(gMap, newPlacemarkers, cellsize);
				var AOO = 3;
		    var AOOArea = (AOO * cellsize * cellsize)/(1000*1000);
		    var AOOrat = AOOrating(AOOArea);
			 	// var messagetxt  = "EOO Area (km2): "	+ area.toFixed(2) + "<br />";
			 	// messagetxt = messagetxt + "Diameter(km): " + diameter.toFixed(2) + "<br />";
			 	// messagetxt = messagetxt + "Cell size(km): " + (cellsize / 1000).toFixed(2) + "<br />";
			 	// messagetxt = messagetxt + "Number of cells: " + AOO + "<br />";
			 	// messagetxt = messagetxt + "AOO Area (km2): " + AooArea.toFixed(2) + "<br />";
			 	// messagetxt = messagetxt + "EOO Rating: " 	+ EOORat + "<br />";
			 	// messagetxt = messagetxt + "AOO Rating: " + AOOrat;
			 	// gMap.openInfoWindowHtml(convexHull.getBounds().getCenter(), (messagetxt));
				
				
				return {EOORat: EOORat, EOOArea:convex_area, AOORat: AOOrat, AOOArea: AOOArea};
			}

			

