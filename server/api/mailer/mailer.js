'use strict';

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
import _ from 'lodash';
import mongoose from 'mongoose';
import Event from '../event/event.model';
import Offer from '../offer/offer.model';
import User from '../user/user.model';
import config from '../../config/environment';

var auth = {
  auth: {
    api_key: config.mailgun.api_key,
    domain: config.mailgun.domain
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

function getEventMailList(event) {
  let query = {};

  if (event.sentTo.length) { //if Caterers were specified
    _.map(event.sentTo, (id) => {
      return new mongoose.Types.ObjectId(id);
    });
    query = { _id: {$in: event.sentTo }};
  } else {
    if (event.foodTypes.length) { //if only ft were specified
      query = { foodTypes: {$in: event.foodTypes }};
    }
  }

  return User.find(query).exec()
    .then((users) => {
      return _.map(users, (user) => {
          return user.email;
        });
    });
}

function getOfferMailList(offer) {
  return Event.findById(offer.eventId).exec()
   .then((event) => {
     return User.findById(event.userId).exec()
       .then((user) => {
          return user.email;
       });
   });
}

var mailer = {
  notifyEvent: function(event, fact) {
    let message = '<h1>Event ' + event.name + ' was ' + fact + '!</h1>';

    getEventMailList(event).then((sendTo) => {
      nodemailerMailgun.sendMail({
       from: config.mailgun.from,
       to: sendTo, // An array if you have multiple recipients.
       subject: 'Catering-ninja: event has been ' + fact,
       html: message,
       }, function (err, info) {
       if (err) {
        console.log('Error: ' + err);
       }
       else {
        console.log('Response: ' + info);
       }
       });
    });
  },

  notifyOffer: function(offer, fact) {
    getOfferMailList(offer).then((sendTo) => {
      let message = '<h1>Offer from ' + offer.catererName + ' was ' + fact + '!</h1><p>Counter: ' + offer.counter + '</p><p>Description: ' + offer.offerDescription + '</p><p>Status: ' + offer.status + '</p><p>Counter: ' + offer.counter + '</p>';

      nodemailerMailgun.sendMail({
        from: config.mailgun.from,
        to: sendTo, // An array if you have multiple recipients.
        subject: 'Catering-ninja: offer has been ' + fact,
        html: message,
        }, function (err, info) {
        if (err) {
          console.log('Error: ' + err);
        }
        else {
          console.log('Response: ' + info);
        }
       });
    });
  }

}

module.exports = mailer;
