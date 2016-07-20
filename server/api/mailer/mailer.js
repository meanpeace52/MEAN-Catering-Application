'use strict';

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
import _ from 'lodash';
import mongoose from 'mongoose';
import Event from '../event/event.model';
import Offer from '../offer/offer.model';
import User from '../user/user.model';
import config from '../../config/environment';
var Promise = require('bluebird');

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

function getUsers() {
   //return User.find({'role': 'caterer' }, { email: 1, role: 1, name: 1, companyName: 1}).exec();
  //ObjectId("57430b12cc05ff64171e4ffd")    ObjectId("57431a9f869261981414cb87")
   return User.find({'role': 'caterer' }, { email: 1, role: 1, name: 1, companyName: 1, foodTypes: 1}).exec().then((users) => {
       return users;
     });
}

function createSummary(user) {    //user is caterer
  let eventsQuery = { foodTypes: { $in: user.foodTypes}},
      eventsTomorrowQuery = { status: 'confirmed', confirmedBy: user._id },
      offersSentQuery = { catererId: user._id },
      offersAcceptedQuery = { catererId: user._id },
      today = new Date().toISOString(),
      end = new Date(),
      start = new Date(),
      summary = {};

  end = Date.parse(end) + (24 * 60 * 60 * 1000);
  end = new Date(end).toISOString();
  start = Date.parse(start) - (24 * 60 * 60 * 1000);
  start = new Date(start).toISOString();

  eventsTomorrowQuery.date = { $lte: end, $gte: today };
  offersSentQuery.date = { $lte: today, $gte: start };
  offersAcceptedQuery.dateAccepted = { $lte: today, $gte: start };

  return Event.find(eventsQuery).exec()
    .then((events) => {
       summary.eventsNumber = events.length;
       summary.eventsNumberHtml = '<p>Total number of events recieved: <strong> ' + events.length + ' </strong></p>';
    })
    .then(() => {
      return Event.find(eventsTomorrowQuery).exec();
    })
    .then((eventsTomorrow) => {
      summary.eventsTomorrow = eventsTomorrow;
      let html = '<h2>events scheduled for tomorrow</h2>';
      _.each(summary.eventsTomorrow, (event) => {
        html += '<p><strong>' + event.name + '</strong></p>';
        html += '<p>Location: <strong>' + event.location + '</strong></p>';
        html += '<p>Price per person: <strong>' + event.pricePerPerson + '</strong></p>';
        html += '<hr />';
      });
      summary.eventsTomorrowHtml = html;
    })
    .then(()=> {
      return Offer.find(offersSentQuery).exec();
    })
    .then((offersSent) => {
      summary.offersSent = offersSent.length;
      summary.offersSentHtml = '<p>Total number of offers sent: <strong> ' + offersSent.length + ' </strong></p>';
    })
    .then(()=> {
      return Offer.find(offersAcceptedQuery).exec();
    })
    .then((offersAccepted) => {
      summary.offersAccepted = offersAccepted.length;
      summary.offersAcceptedHtml = '<p>Total number of offers accepted: <strong> ' + offersAccepted.length + ' </strong></p>';
    })
    .then(() => {
      return summary;
    })
}

var mailer = {
  completeRegistration: function(user) {

  },
  report: function() {
    getUsers().then((users) => {
      _.each(users, (user) =>{
        createSummary(user).then((summary)=> {
          let message = summary.eventsNumberHtml + summary.offersSentHtml + summary.offersAcceptedHtml + summary.eventsTomorrowHtml;
          nodemailerMailgun.sendMail({
              from: config.mailgun.from,
              to: user.email,
              subject: 'Catering-ninja: daily report',
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
      });
    });
  },
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
