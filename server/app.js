/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
import async from 'async';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
var bodyParser = require("body-parser");
var mailer = require('./api/mailer/mailer');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.minute = 0;
rule.hour = 23;

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

// Populate databases with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);

var j = schedule.scheduleJob(rule, function(){
  mailer.report();
});

/*verify emails
var User = require('./api/user/user.model');
var nev = require('email-verification')(mongoose);

nev.configure({
  verificationURL: 'http://myawesomewebsite.com/email-verification/${URL}',
  persistentUserModel: User,
  tempUserCollection: 'tempUsers',

  transportOptions: {
    service: 'Mailgun',
    auth: {
      api_key: config.mailgun.api_key,
      domain: config.mailgun.domain
    }
  },
  verifyMailOptions: {
    from: 'Do Not Reply ' + config.mailgun.from,
    subject: 'Please confirm account',
    html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
    text: 'Please confirm your account by clicking the following link: ${URL}'
  }
});

nev.generateTempUserModel(User);
var TempUser = require('./api/user/tempUser.model');
nev.configure({
  tempUserModel: TempUser
});

*/

function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
