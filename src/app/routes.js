module.exports  = function(app, io) {

	const ip      = require('ip');
    const ipAddr  = ip.address();
    const port    = process.env.PORT || 8080;
    const url     = "http://"+ipAddr+":"+port;
    const {Pool}  = require('pg');
    const gmapkey = require('./google.js');

    var activeTags = [];


    var readerA00 = {name: "a00", position: { x:    0, y:    0}, url: "/ble/a00" };
    var readerA01 = {name: "a01", position: { x: 1000, y: 1100}, url: "/ble/a01" };
    var readerA02 = {name: "a02", position: { x: 1170, y: 2000}, url: "/ble/a02" };
    var readerA03 = {name: "a03", position: { x: 1250, y: 2350}, url: "/ble/a03" };
    var readerA04 = {name: "a04", position: { x: 1500, y: 1280}, url: "/ble/a04" };
    var readerA05 = {name: "a05", position: { x: 1650, y: 2000}, url: "/ble/a05" };
    var readerA06 = {name: "a06", position: { x: 1650, y: 1000}, url: "/ble/a06" };
    var readerA07 = {name: "a07", position: { x: 1700, y: 1350}, url: "/ble/a07" };
    var readerA08 = {name: "a08", position: { x: 2000, y:  950}, url: "/ble/a08" };
    var readerA09 = {name: "a09", position: { x: 2000, y: 1330}, url: "/ble/a09" };
    var readerA10 = {name: "a10", position: { x: 1950, y: 2550}, url: "/ble/a10" };
    var readerA11 = {name: "a11", position: { x: 2300, y:  950}, url: "/ble/a11" };
    var readerA12 = {name: "a12", position: { x: 2300, y: 1320}, url: "/ble/a12" };
    var readerA13 = {name: "a13", position: { x: 2650, y:  980}, url: "/ble/a13" };
    var readerA14 = {name: "a14", position: { x: 2600, y: 1320}, url: "/ble/a14" };
    var readerA15 = {name: "a15", position: { x: 2450, y: 2520}, url: "/ble/a15" };
    var readerA16 = {name: "a16", position: { x: 2800, y: 1240}, url: "/ble/a16" };
    var readerA17 = {name: "a17", position: { x: 2700, y: 2000}, url: "/ble/a17" };
    var readerA18 = {name: "a18", position: { x: 3300, y: 1100}, url: "/ble/a18" };
    var readerA19 = {name: "a19", position: { x: 3250, y: 1500}, url: "/ble/a19" };
    var readerA20 = {name: "a20", position: { x: 3150, y: 2100}, url: "/ble/a20" };
    var readerA21 = {name: "a21", position: { x:    0, y:    0}, url: "/ble/a21" };
    var readerA22 = {name: "a22", position: { x:    0, y:    0}, url: "/ble/a22" };
    var readerA23 = {name: "a23", position: { x:    0, y:    0}, url: "/ble/a23" };
    var readerA24 = {name: "a24", position: { x:    0, y:    0}, url: "/ble/a24" };
    var readerA25 = {name: "a25", position: { x:    0, y:    0}, url: "/ble/a25" };

    var meter2pixel = 450/5.8;

    if (process.env.DATABASE_URL) { pg.defaults.ssl = true };
    var connString = process.env.DATABASE_URL || 'postgresql://prioritas:Bismillah@localhost:5432/prioritas';
    const pool   = new Pool({connectionString:connString});

    //index page (index.ejs);
    app.get('/', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM sigfox');
            const results = { 'results': (result) ? result.rows : null};
            res.render('index', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    });

    var mapkey = gmapkey.keys;
    app.get('/map', function(req, res) { res.render('map', mapkey) });
    app.get('/map2', function(req, res) { res.render('mapleaf') });
    app.get('/contact', function(req, res) {res.render('contact') });

    app.get('/db', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM sigfox');
            const results = { 'results': (result) ? result.rows : null};
            res.render('pages/db', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    });

    app.get('/ble', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM ble');
            const results = { 'results': (result) ? result.rows : null};
            res.render('indexble', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    });

    app.post('/setBleName', (req, res) => {
        const payload = req.body;
        
        pool.connect((err, client, done) => {
            var query = 'INSERT INTO blename (bleid, name, objid) VALUES ($1, $2, $3) RETURNING *';
            var values = [(payload.bleID), (payload.Name), (payload.objID)];

            client.query(query, values, (error, result) => {
                done();
                if (error) { res.status(400).json({error}); }
                else { res.status(202).send({status:'Successful',result:result.rows[0],}); };
            });
        });
    });

    app.get('/getBleName', async (req, res) => {
        const payload = req.body;
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT name FROM blename WHERE bleid = $1', payload.bleID);
            const results = { 'results': (result) ? result.rows : null};
            res.render('indexble', results );
            client.release();
        } catch (err) { console.error(err); res.send("Error " + err); }
    });

    async function getName(bleid, cb) {
        var gname = "";
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT name FROM blename WHERE bleid = $1', [(bleid)]);
            console.log('Result: ', result.rows[0]);
            if (result.rows != 0) { gname = result.rows[0].name; };
            console.log('Name1:', gname);
            client.release();
        } catch (err) { console.error(err); };
        console.log('Name2:',gname); cb(gname);
    };

    async function getObjId(bleid, cb) {
        var oid = "";
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT objid FROM blename WHERE bleid = $1', [(bleid)]);
            console.log('Result: ', result.rows[0]);
            if (result.rows != 0) { oid = result.rows[0].objid; };
            console.log('objid1:', oid);
            io.emit('add', {id: oid, x: 2000, y:2000});
            client.release();
        } catch (err) { console.error(err); };
        console.log('objid2:',oid); cb(oid);
    };

    app.post('/ble/:readerid', (req, res) => {
        const rid = req.params.readerid;
        const payload = req.body;
        console.log('FROM READER ', rid); console.log(payload);
        const bleid = payload.bleID;
        const name = payload.Name;;
        const time = Date.now();
        const serviceuuid = payload.ServiceUUID;
        const rssi = parseInt(payload.RSSI, 10);
        const appearance = parseInt(payload.Appearance, 10);

        var distance = 0.0; var txpower = 0;
        if (payload.TXpower < 0) { txpower = parseInt(payload.TXpower); }
        else { txpower = -60; };
        //distance = Math.pow(10.0, (txpower - rssi) / 20.0);
        if (rssi == 0) { distance = -1.0; }
        else {
            var ratio = rssi*1.0/txpower;
            if (ratio < 1.0) { distance = Math.pow(ratio,10); }
            else { distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111; };
        };

        pool.connect((err, client, done) => {
            var rslt = ""; getObjId(bleid, function(oid) { rslt = oid; });
            var query = 'INSERT INTO '+rid+' (bleid, timestamp, rssi, distance, name, txpower)';
            query += ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
            var values = [(bleid), (time), (rssi), (distance), (name), (txpower)];

            client.query(query, values, (error, result) => {
                done();
                if (error) { res.status(400).json({error}); }
                else {  res.status(202).send({status:'Successful',result:result.rows[0],}); };
            });
        });
    })

    app.post('/sigfox', (req, res) => {
        const payload = req.body;
        // Do data mining first
        var mac1 = new Buffer(6); for (var i=0; i<6; i++) {mac1[i]=0x00;}
        var mac2 = new Buffer(6); for (var i=0; i<6; i++) {mac2[i]=0x00;}
        var NS = ''; var WE = '';
        var lat = -1; var lon = -1;
        var lathex = new Buffer(4); lathex.fill(0);
        var lonhex = new Buffer(4); lonhex.fill(0);
        var temp = -1; var bar0 = -1; var bar1 = -1; var batt = -1;
        var humi = -1; var accx = -1; var accy = -1; var accz = -1;
        var latfloat = 0.0; var lonfloat = 0.0;

        const byteArr = Buffer.from(payload.data, 'hex');
        switch (byteArr[0]) {
            case 0x00 : for (var i = 0; i<6; i++) { mac1[i] = byteArr[i] };
                        for (var i = 0; i<6; i++) { mac2[i] = byteArr[i+6] };
                        break;
            case 0x53 : NS = 'S';
                        lat = parseInt(byteArr[1].toString());
                        for (var i=0; i<3; i++) {lathex[i+1]=byteArr[i+2]};
                        if (byteArr[5]==0x45) {WE='E';} else {WE='W';};
                        lon = parseInt(byteArr[6].toString());
                        for (var i=0; i<3; i++) {lonhex[i+1]=byteArr[i+7]};
                        break;
            case 0x4E : NS = 'N';
                        lat = parseInt(byteArr[1].toString());
                        for (var i=0; i<3; i++) {lathex[i+1]=byteArr[i+2]};
                        if (byteArr[5]==0x45) {WE='E';} else {WE='W';};
                        lon = parseInt(byteArr[6].toString());
                        for (var i=0; i<3; i++) {lonhex[i+1]=byteArr[i+7]};
                        break;
            case 0xFF : temp = parseInt(byteArr[1].toString());
                        bar1 = parseInt(byteArr[5].toString());
                        bar0 = parseInt(byteArr[6].toString());
                        batt = parseInt(byteArr[7].toString());
                        humi = parseInt(byteArr[8].toString());
                        break;
            case 0x08 : temp = parseInt(byteArr[1].toString());
                        accx = parseInt(byteArr[2].toString());
                        accy = parseInt(byteArr[3].toString());
                        accz = parseInt(byteArr[4].toString());
                        bar1 = parseInt(byteArr[5].toString());
                        bar0 = parseInt(byteArr[6].toString());
                        batt = parseInt(byteArr[7].toString());
                        humi = parseInt(byteArr[8].toString());
                        break;
            default   : break;
        } ;

        // Convert Hex to float
        latfloat = lat + (lathex.readUInt32BE(0) * 0.0000001); 
        lonfloat = lon + (lonhex.readUInt32BE(0) * 0.0000001);

        pool.connect((err, client, done) => {
            // Insert the whole data payload to database
            var query = 'INSERT INTO sigfox (payloadStr, deviceId, time, seqNumber';
            query += ', data, reception, duplicate, receptionstr, payload, macaddress1';
            query += ', macaddress2, ns, we, latdeg, longdeg, latitude, longitude, temperature';
            query += ', barometer0, barometer1, battery, humidity, accelx, accely, accelz)';
            query += ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14';
            query += ', $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *';
            var values = [(JSON.stringify(payload)), (payload.deviceId), (payload.time)
            , (payload.seqNumber), (payload.data), (payload.reception), (payload.duplicate)
            , (JSON.stringify(payload.reception)), (payload), (mac1), (mac2), (NS), (WE), (lat), (lon)
            , (latfloat), (lonfloat), (temp), (bar0), (bar1), (batt), (humi), (accx), (accy), (accz)];

            client.query(query, values, (error, result) => {
                done();
                if (error) { res.status(400).json({error}); }
                else {  res.status(202).send({status:'Successful',result:result.rows[0],});  };
            });
        });
    });
    console.log("route from "+url);
}