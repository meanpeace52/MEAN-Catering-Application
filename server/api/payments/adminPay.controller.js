let config = require('../../config/environment');
let Promise = require('bluebird');
let request = require('request-promise');
let mongoose = require('mongoose');
let _ = require('lodash');

let dwollaController = require('./dwolla.controller');
let stripeController = require('./stripe.controller');

class AdminPayController {

  pay(req, res) {

    console.log(1, req.body);

    if (!req.body.items || req.body.items.length === 0) {
      return Promise.reject({});
    }

    console.log(2);

    return Promise.all(req.body.items.map(item => mongoose.model('Offer').findById(item))).then(offers => {

      console.log(3, offers);

      console.log(offers[0].catererId);

      return Promise.all(offers.map(item => mongoose.model('User').findById(item.catererId))).then(caterers => {

        let promises = [];
        let items = [];
        console.log(4);
        offers.forEach((offer, index) => {

          if (offer.invoice.refund) {
            promises.push(stripeController.$refund(offer.paymentId));
          } else {
            let amount = (offer.invoice.total * ((100 - offer.invoice.commission) / 100) - offer.invoice.adjustment.caterer).toFixed(2);
            let item = {
              "_links": {
                "destination": caterers[index].payableAccount.links.account
              },
              "amount": {
                "currency": "USD",
                "value": amount,
              }
            };
            if (offer.invoice.adjustment.chargeOff) {
              promises.push(stripeController.$refund(offer.paymentId, offer.invoice.adjustment.chargeOff));
            }
            items.push(item);
          }
        });

        if (items.length) {
          promises.push(dwollaController.pay(items));
        }

        return Promise.all(promises).then(() => {
          return Promise.all(offers.map(offer => {
            offer.status = 'completed';
            offer.paymentStatus = 'completed';
            return offer.save();
          })).then((updatedOffers) => {
            return Promise.all(updatedOffers.map(offer => mongoose.model('Event').findById(offer.eventId))).then(events => {
              return Promise.all(events.map(event => {
                event.status = 'completed';
                event.paymentStatus = 'completed';
                return event.save();
              })).then(respondWithResult(res))
                 .catch(handleError(res));
            });
          });
        });

      });
    })

  }

}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

module.exports = new AdminPayController();