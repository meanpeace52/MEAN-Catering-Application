/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

var bodyParser = require("body-parser");
var multer = require("multer");
var lusca = require('lusca');

export default function(app) {
  // Insert routes below

  app.use('/api/things', require('./api/thing'));
  app.use('/api/events', require('./api/event'));
  app.use('/api/offers', require('./api/offer'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/foodTypes', require('./api/foodType'));
  app.use('/api/includedInPrice', require('./api/includedInPrice'));

  app.use('/auth', require('./auth').default);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  var opts = { csrf: { angular: true } }; // options for lusca

  app.use(lusca(opts)); // lusca registered AFTER cookieParser

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post("/upload", multer({dest: "./uploads/"}).array("uploads[]", 12), function(req, res) {
    console.log(req);
    res.send(req.files);
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
  });




}
