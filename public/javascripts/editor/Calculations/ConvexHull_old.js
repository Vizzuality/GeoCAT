
function isLeft(P0, P1, P2) {	 
   return (P1.getPosition().lng() - P0.getPosition().lng())*(P2.getPosition().lat() - P0.getPosition().lat()) - (P2.getPosition().lng() - P0.getPosition().lng())*(P1.getPosition().lat() - P0.getPosition().lat());
}



function chainHull_2D(P, n, H) {
    var    bot=0, top=(-1);  
    var    i;               

    var minmin = 0, minmax;
    var xmin = P[0].getPosition().lng();
    for (i=1; i<n; i++)
        if (P[i].getPosition().lng() != xmin) break;
    minmax = i-1;
    if (minmax == n-1) {  
        H[++top] = P[minmin];
        if (P[minmax].getPosition().lat() != P[minmin].getPosition().lng()) 
            H[++top] = P[minmax];
        H[++top] = P[minmin];       
        return top+1;
    }

    var maxmin, maxmax = n-1;
    var xmax = P[n-1].getPosition().lng();
    for (i=n-2; i>=0; i--)
        if (P[i].getPosition().lng() != xmax) break;
    maxmin = i+1;

    H[++top] = P[minmin];      
    i = minmax;
    while (++i <= maxmin)
    {
        if (isLeft( P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
            continue;

        while (top > 0) {
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         
            else
                top--;         
        }
        H[++top] = P[i];       
    }

    if (maxmax != maxmin)     
        H[++top] = P[maxmax]; 
    bot = top;                 
    i = maxmin;
    while (--i >= minmax)
    {
        if (isLeft( P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
            continue;

        while (top > bot) {
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         
            else
                top--;
        }
		  if (P[i].getPosition().lng() == H[0].getPosition().lat() && P[i].getPosition().lat() == H[0].getPosition().lat()) return top+1;
        H[++top] = P[i];
			
    }
    if (minmax != minmin)
        H[++top] = P[minmin];

    return top+1;
}