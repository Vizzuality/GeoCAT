
function isLeft(P0, P1, P2) {	 
   return (P1.position.c - P0.position.c)*(P2.position.b - P0.position.b) - (P2.position.c - P0.position.c)*(P1.position.b - P0.position.b);
}



function chainHull_2D(P, n, H) {
    var    bot=0, top=(-1);  
    var    i;               

    var minmin = 0, minmax;
    var xmin = P[0].position.c;
    for (i=1; i<n; i++)
        if (P[i].position.c != xmin) break;
    minmax = i-1;
    if (minmax == n-1) {       
        H[++top] = P[minmin];
        if (P[minmax].position.b != P[minmin].position.c) 
            H[++top] = P[minmax];
        H[++top] = P[minmin];       
        return top+1;
    }

    var maxmin, maxmax = n-1;
    var xmax = P[n-1].position.c;
    for (i=n-2; i>=0; i--)
        if (P[i].position.c != xmax) break;
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
		  if (P[i].position.c == H[0].position.c && P[i].position.b == H[0].position.b) return top+1;
        H[++top] = P[i];
			
    }
    if (minmax != minmin)
        H[++top] = P[minmin];

    return top+1;
}