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
  } else if (event.confirmedBy) {
    query = { _id: event.confirmedBy }
  } else {
    if (event.foodTypes.length) { //if only ft were specified
      query = { foodTypes: {$in: event.foodTypes }};
    }
    if (event.serviceTypes.length) { //if only st were specified
      query = { serviceTypes: {$in: event.serviceTypes }};
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

function getOfferOwnerMail(offer) {
  return User.findById(offer.catererId).exec()
    .then((user) => {
      return user.email;
    });
}

function getUsers() {
   return User.find({'role': 'caterer' }, { email: 1, role: 1, name: 1, companyName: 1, foodTypes: 1, serviceTypes: 1}).exec().then((users) => {
       return users;
     });
}

function createSummary(user) {    //user is caterer
  let eventsQuery = { foodTypes: { $in: user.foodTypes}, serviceTypes: { $in: user.serviceTypes}},
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

  eventsQuery.date = { $lte: today, $gte: start };
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
      let html = '<h2>Events scheduled for tomorrow</h2>';
      _.each(summary.eventsTomorrow, (event) => {
        let date = new Date(event.date),
            time = new Date(event.time);
        html += '<p><strong>' + event.name + '</strong></p>';
        html += '<p>Date:<strong>' + date.toDateString() + '</strong></p>';
        html += '<p>Time:<strong>' + time.toTimeString() + '</strong></p>';
        html += '<p>Location: <strong>' + event.location + '</strong></p>';
        html += '<p>People: <strong>' + event.people + '</strong></p>';
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
  breakAuth: (user, caterer) => {
    let promises = [];
    promises.push(nodemailerMailgun.sendMail({
      from: config.mailgun.from,
      to: user.email,
      subject: 'Catering-ninja: your credit card was not authorised',
      html: 'Simple message',
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    }));
    promises.push(nodemailerMailgun.sendMail({
      from: config.mailgun.from,
      to: caterer.email,
      subject: 'Catering-ninja: offer has been canceled',
      html: 'Simple message',
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    }));
    return Promise.all(promises);
  },
  breakCapture: (user, caterer) => {
    let promises = [];
    promises.push(nodemailerMailgun.sendMail({
      from: config.mailgun.from,
      to: user.email,
      subject: 'Catering-ninja: money cannot be captured',
      html: 'Simple message',
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    }));
    promises.push(nodemailerMailgun.sendMail({
      from: config.mailgun.from,
      to: caterer.email,
      subject: 'Catering-ninja: offer has been canceled',
      html: 'Simple message',
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    }));
    return Promise.all(promises);
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
    let date = new Date(event.date),
      time = new Date(event.time),
      message = '<h1>Event ' + event.name + ' was ' + fact + '!</h1>';
    message += '<p>Date:<strong>' + date.toDateString() + '</strong></p>';
    message += '<p>Time:<strong>' + time.toTimeString() + '</strong></p>';
    message += '<p>Location: <strong>' + event.location + '</strong></p>';
    message += '<p>People: <strong>' + event.people + '</strong></p>';
    message += '<p>Price per person: <strong>' + event.pricePerPerson + '</strong></p>';

    getEventMailList(event).then((sendTo) => {
      _.each(sendTo, (cEmail) => {
        nodemailerMailgun.sendMail({
          from: config.mailgun.from,
          to: cEmail,
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
    });
  },

  notifyOffer: function(offer, fact) {
    getOfferMailList(offer).then((sendTo) => {
      let message = '<h1>Offer from ' + offer.catererName + ' was ' + fact + '!</h1><p>Description: ' + offer.offerDescription + '</p><p>Status: ' + offer.status + '</p>';

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
  },

  notifyOfferAccepted: function(offer, fact) {
    getOfferOwnerMail(offer).then((sendTo) => {
      let message = '<h1>Your offer was ' + fact + '!</h1><p>Description: ' + offer.offerDescription + '</p><p>Status: ' + offer.status + '</p>';

      Event.findById(offer.eventId).exec()
        .then((event) => {
          let date = new Date(event.date),
              time = new Date(event.time);
          message += '<hr />';
          message += '<p>Event details:</p>';
          message += '<p>Name:<strong>' + event.name + '</strong></p>';
          message += '<p>Date:<strong>' + date.toDateString() + '</strong></p>';
          message += '<p>Time:<strong>' + time.toTimeString() + '</strong></p>';
          message += '<p>Location: <strong>' + event.location + '</strong></p>';
          message += '<p>People: <strong>' + event.people + '</strong></p>';
          message += '<p>Price per person: <strong>' + event.pricePerPerson + '</strong></p>';
          message += '<hr />';
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
      });
  }
}

module.exports = mailer;
