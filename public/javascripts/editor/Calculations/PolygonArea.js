
		function calculateArea(points) {
			
			var earthRadiusMeters=6378137.0;
			var metersPerDegree=2.0*Math.PI*earthRadiusMeters/360.0;
			var degreesPerRadian=180.0/Math.PI;
			var radiansPerDegree=Math.PI/180.0;
			var metersPerKm=1000.0;
			
			function PlanarPolygonAreaMeters2(points) {
			    var a=0.0;
			    for(var i=0;i<points.length;++i)
			        {var j=(i+1)%points.length;
			        var xi=points[i].lng()*metersPerDegree*Math.cos(points[i].lat()*radiansPerDegree);
			        var yi=points[i].lat()*metersPerDegree;
			        var xj=points[j].lng()*metersPerDegree*Math.cos(points[j].lat()*radiansPerDegree);
			        var yj=points[j].lat()*metersPerDegree;
			        a+=xi*yj-xj*yi;}
			    return Math.abs(a/2.0);
			}

			function SphericalPolygonAreaMeters2(Points) {
			    var totalAngle=0.0;

          var points_length = Points.length-1;
			    for(i=0;i<points_length;++i)
			        {var j=(i+1)%points_length;
			        var k=(i+2)%points_length;
			        totalAngle+=Angle(Points[i],Points[j],Points[k]);}
			    var planarTotalAngle=(points_length-2)*180.0;
			    var sphericalExcess=totalAngle-planarTotalAngle;
			    if(sphericalExcess>420.0)
			        {totalAngle=points_length*360.0-totalAngle;
			        sphericalExcess=totalAngle-planarTotalAngle;}
			    else if(sphericalExcess>300.0&&sphericalExcess<420.0)
			        {sphericalExcess=Math.abs(360.0-sphericalExcess);}
			    return sphericalExcess*radiansPerDegree*earthRadiusMeters*earthRadiusMeters;
			}


			function Angle(p1,p2,p3) {
			    var bearing21=Bearing(p2,p1);
			    var bearing23=Bearing(p2,p3);
			    var angle=bearing21-bearing23;
			    if(angle<0.0) angle+=360.0;
			    return angle;
			}

			function Bearing(from,to) {
			    var lat1=from.lat()*radiansPerDegree;
			    var lon1=from.lng()*radiansPerDegree;
			    var lat2=to.lat()*radiansPerDegree;
			    var lon2=to.lng()*radiansPerDegree;
			    var angle=-Math.atan2(Math.sin(lon1-lon2)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2));
			    if(angle<0.0) angle+=Math.PI*2.0;
			    angle=angle*degreesPerRadian;
			    return angle;
			}

			var areaMeters2=PlanarPolygonAreaMeters2(points);
			if(areaMeters2>1000000.0) areaMeters2=SphericalPolygonAreaMeters2(points);
      // return areaMeters2/metersPerKm/metersPerKm;
      return areaMeters2/1000000;
		  
		}
		
		
		