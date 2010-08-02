function chainHull_2D( P, n, H )
{
    // the output array H[] will be used as the stack
    var    bot=0, top=(-1);  // indices for bottom and top of the stack
    var    i;                // array scan index
 
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0, minmax;
    var xmin = P[0].position.b;
    for (i=1; i<n; i++)
        if (P[i].position.c != xmin) break;
    minmax = i-1;
    if (minmax == n-1) {       // degenerate case: all x-coords == xmin
        H[++top] = P[minmin];
        if (P[minmax].position.b != P[minmin].position.b) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin];           // add polygon endpoint
        return top+1;
    }
 
    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n-1;
    var xmax = P[n-1].position.c;
    for (i=n-2; i>=0; i--)
        if (P[i].position.c != xmax) break;
    maxmin = i+1;
 
    // Compute the lower hull on the stack H
    H[++top] = P[minmin];      // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin)
    {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft( P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
            continue;          // ignore P[i] above or on the lower line
 
        while (top > 0)        // there are at least 2 points on the stack
        {
            // test if P[i] is left of the line at the stack top
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         // P[i] is a new hull vertex
            else
                top--;         // pop top point off stack
        }
        H[++top] = P[i];       // push P[i] onto stack
    }
 
    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin)      // if distinct xmax points
        H[++top] = P[maxmax];  // push maxmax point onto stack
    bot = top;                 // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax)
    {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft( P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
            continue;          // ignore P[i] below or on the upper line
 
        while (top > bot)    // at least 2 points on the upper stack
        {
            // test if P[i] is left of the line at the stack top
            if (isLeft( H[top-1], H[top], P[i]) > 0)
                break;         // P[i] is a new hull vertex
            else
                top--;         // pop top point off stack
        }
        H[++top] = P[i];       // push P[i] onto stack
    }
    if (minmax != minmin)
        H[++top] = P[minmin];  // push joining endpoint onto stack
 
    return top+1;
}


function isLeft( P0, P1, P2 )
{
    return (P1.position.c - P0.position.c)*(P2.position.b - P0.position.b) - (P2.position.c - P0.position.c)*(P1.position.b - P0.position.b);
}