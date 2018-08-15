var colors = require('colors');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var connectDb = require('./dist/shared/db').connectDb;
var initSalt = require('./dist/shared/db/shared/utils').initSalt;
var api = require('./dist/express/routes/api').default;

const app = express();

// =======================
// configuration =========
// =======================

const port = process.env.PORT || 3000;

// add CORS support
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser({ limit: '50mb' }));

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================

// basic route (useful for a possible health-check)
app.get('/', function(req, res) {
  res.send('Hello World!');
});

// api routes
app.use('/api', api);

// =======================
// start the server ======
// =======================

app.listen(port, function() {
  connectDb();

  initSalt();

  console.log(`hgo-manager app listening on port ${port}!`);
});
