// Mattel eBeacon Server by PrioSasoko@halotec-indonesia.com
// Halotec 2020

// set up ======================================================================
const express          = require('express');
const morgan           = require('morgan');
const clientSession    = require('client-sessions');
const helmet           = require('helmet');
const path             = require('path');
const bodyParser       = require('body-parser');
const stylus           = require('stylus');
const nib              = require('nib');
const ejsLayouts       = require('express-ejs-layouts');
const updateDist       = require('./src/app/updateDistance.js');
const initCoord        = require('./src/app/initCoordinates.js');
var reader             = require('./src/app/reader.js');
var tags               = require('./src/app/tags.js');
const {SESSION_SECRET} = require('./config');
const app              = express();
const api              = require('./src/api');
const ble              = require('./src/ble');
const pg               = require('pg');
const {Pool}           = require('pg');

// configuration ===============================================================
app.use(morgan('short'));
app.use(express.json());
app.use(
  clientSession({
    cookieName: 'session',
    secret: SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000
  })
);

app.use(helmet());
app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function compile(str, path) {return stylus(str).set('filename', path).use(nib())};
app.use(stylus.middleware({src: __dirname + '/public', compile: compile}));
app.use(express.static(__dirname + '/public'));

// routes ======================================================================
app.use(api);
app.use(ble);

app.get('/health', (req, res) => res.sendStatus(200));
if (process.env.DATABASE_URL) { pg.defaults.ssl = false };
var connString = process.env.DATABASE_URL || "postgresql://postgres:Beacon@postgres:5432/db?ssl=false";
const pool     = new Pool({connectionString:connString});

app.get('/', async (req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM tbl_beacon');
        const results = { 'results': (result) ? result.rows : null};
        //console.log(results);
        res.render('index', results );
        client.release();
    } catch (err) { console.error(err); res.send("Error " + err); }
});

// launch ======================================================================
let server;
module.exports = {
  start(port) {
    server = app.listen(port, () => {
      console.log(`App started on port ${port}`);
    });
    return app;
  },
  stop() {
    server.close();
  }
};
