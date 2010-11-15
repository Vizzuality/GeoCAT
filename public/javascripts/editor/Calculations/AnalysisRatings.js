


			function getAnalysisData(convex_area, convex_points, all_markers, cellsize_) {
				
				var earth_radius=6378137.79;
				var Cells = [];
				
				function getUnique (arr) {
					var o = new Object();
					var i, e;
					for (i = 0; e = arr[i]; i++) {o[e] = 1};
					var a = new Array();
					for (e in o) {a.push (e)};
					return a.length;
				}
				
				
				function LLtoCylind (Lat,Long) {
					var XY = new Array();

				 	XY[0] = deg_rad(Long) * earth_radius; //x
				 	XY[1] = Math.sin (deg_rad(Lat)) * earth_radius; //y
				 	return XY;
				}

				function CylindtoLL (x,y) {
					var LatLong = new Array();
					LatLong[0] = rad_deg(Math.asin (y / earth_radius)); //Lat
					LatLong[1] = rad_deg(x / earth_radius); // Long
					return LatLong;
				}

				function deg_rad(ang) {
				  return ang * (Math.PI/180.0);
				}

				function rad_deg(x){
					return x * (180.0/Math.PI);
				}
				
				
				
				/*=======================================*/
				/* Draw and get AOO data. */
				/*=======================================*/
				function DrawAOO (gMap, points, cellsize){
				 	var LLx, LLy, URx, URy;
				 	var LLll, URll;
				 	var Cellpoints = new Array();
				 	var testtxt = new Array();

				 	for (var idx in points) {
						var xy = LLtoCylind (points[idx].getPosition().lat(),points[idx].getPosition().lng());
						LLx = (Math.floor (xy[0]/cellsize)) * cellsize;
						LLy = (Math.floor (xy[1]/cellsize)) * cellsize;
						URx = LLx + cellsize;
						URy = LLy + cellsize;
						LLll = CylindtoLL(LLx,LLy);
						URll = CylindtoLL(URx,URy);

            
              
						//Draw cell
						Cellpoints = [
				        new google.maps.LatLng(LLll[0],LLll[1]),
				        new google.maps.LatLng(LLll[0],URll[1]),
				        new google.maps.LatLng(URll[0],URll[1]),
				        new google.maps.LatLng(URll[0],LLll[1]),
								new google.maps.LatLng(LLll[0],LLll[1])
				    ];
				
						var array_index = LLll[0] + LLll[1] + LLll[0] + URll[1];
						
						if (Cells[array_index] == undefined) {
							Cells[array_index] = new google.maps.Polygon({
								paths: Cellpoints,
					      strokeColor: "red",
					      strokeOpacity: 1,
					      strokeWeight: 1,
					      fillColor: "red",
					      fillOpacity: 0.01,
								data: {count:1},
								clickable: false
							});
						} else {
							Cells[array_index].data.count++;
							var count = Cells[array_index].data.count;
							Cells[array_index].setOptions({fillOpacity: count/100});
						}

						testtxt[idx] = LLx + "," + LLy
					}
					testtxt.sort();

					return getUnique(testtxt);
				}
				
				
				
				
				
				/*=======================================*/
				/* Get distance between two points. */
				/*=======================================*/
				function distanceFrom(latlng1, latlng2) {
				    var R = 6378137.79; // meters
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
				
				// Get Diameter
				if (cellsize_==0) {
				  var diameter = getDiameter(convex_points);
    		  cellsize_ = diameter * 100;
        }

				
				var EOORat = EOOrating(convex_area);
		    var AOO = DrawAOO(null, all_markers, cellsize_);
		    var AOOArea = (AOO * cellsize_ * cellsize_)/(1000*1000);
		    var AOOrat = AOOrating(AOOArea);

				
				return {EOORat: EOORat, EOOArea:convex_area, AOORat: AOOrat, AOOArea: AOOArea, Cells: Cells};
			}

			

