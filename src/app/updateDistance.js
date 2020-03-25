module.exports = function (msg, tag, coords, cb) { 
    //console.log(msg);, 
    var obj = JSON.parse(msg);
    const minX = 1400; const minY = 900;
    const maxX = 2700; const maxY = 1400;

    console.log('Reader id: ', obj.rid);
    console.log('Reader x: ', obj.x);
    console.log('Reader y: ', obj.y);
    console.log('Distance: ', obj.distance);
    console.log('Tag id: ', obj.oid);
    console.log('Tag x: ', tag.left);
    console.log('Tag y: ', tag.top);
    tag.left = (obj.x + obj.distance);
    tag.top = (obj.y + obj.distance);

    // Push New Data to List of Coordinate
    console.log(JSON.stringify(coords, null, 4));
    var success = false; var i = 0; var s = "";
    while ( !success && i < 3 ) {
    	console.log('Coord rid: ', coords[i].rid, ', == obj.rid: ', obj.rid);
    	if ( coords[i].rid == 'dummy' || coords[i].rid == obj.rid ) { coords[i] = obj; success = true; }
    	else { i++; };
    }; 

    if ( !success ) {
        if (coords[0].distance > obj.distance) { 
    		coords[0] = coords[1]; coords[1] = coords[2]; coords[2] = obj; 
    	} else if (coords[1].distance > obj.distance) { 
    		coords[1] = coords[2]; coords[2] = obj;
    	} else if (coords[2].distance > obj.distance) { 
    		coords[2] = obj;
    	} else { console.log('distances ', coords[0].distance, ' ', coords[1].distance, ' ', coords[0].distance); };
    };
    console.log(JSON.stringify(coords, null, 4));

    // Check whether there is still dummy Coordinate
    var completeCoordinate = true; 
    for (i=0; i<3;i++) { if ( coords[i].rid == 'dummy') { completeCoordinate = false; }; };

    // if complete do triangulation
	if ( completeCoordinate ) {
		const dA = coords[0].distance;
		const dB = coords[1].distance;
		const dC = coords[2].distance;

		const a = { x: coords[0].x , y: coords[0].y };
		const b = { x: coords[1].x , y: coords[1].y };
		const c = { x: coords[2].x , y: coords[2].y };

		var W = dA*dA - dB*dB - a.x*a.x - a.y*a.y + b.x*b.x + b.y*b.y;
	    var Z = dB*dB - dC*dC - b.x*b.x - b.y*b.y + c.x*c.x + c.y*c.y;

	    var x = (W*(c.y-b.y) - Z*(b.y-a.y)) / (2 * ((b.x-a.x)*(c.y-b.y) - (c.x-b.x)*(b.y-a.y)));
	    var y = (W - 2*x*(b.x-a.x)) / (2*(b.y-a.y));
	    var y2 = (Z - 2*x*(c.x-b.x)) / (2*(c.y-b.y));
	    y = (y + y2) / 2;

	    var xmin = Math.min([a.x, b.x, c.x]); if ( xmin < minX ) { xmin = minX; };
        var xmax = Math.max([a.x, b.x, c.x]); if ( xmax > maxX ) { xmax = maxX; };
	    var ymin = Math.min([a.y, b.y, c.y]); if ( ymin < minY ) { ymin = minY; };
        var ymax = Math.max([a.y, b.y, c.y]); if ( ymax > maxY ) { ymax = maxY; };
	    var xleft = parseInt((a.x + b.x + c.x) / 3); 
	    var ytop = parseInt((a.y + b.y + c.y) / 3);
	    var xi = parseInt(x); var yi = parseInt(y);

	    if ( xi > xmin && xi < xmax ) { xleft = xi; }
	    if ( yi > ymin && yi < ymax ) { ytop = yi; }

	    s = "{ \"id\": \""+obj.oid+"\", \"x\": "+xleft+", \"y\": "+ytop+" }";
	} else {
		i = parseInt(Math.floor(Math.random() * obj.distance)); tag.left = obj.x + i; 
		i = parseInt(Math.floor(Math.random() * obj.distance)); tag.top = obj.y + i;
		s = "{ \"id\": \""+obj.oid+"\", \"x\": "+tag.left+", \"y\": "+tag.top+" }";
	};

    
    cb(s);
};