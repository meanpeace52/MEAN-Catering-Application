let config = require('../../config/environment');
let mongoose = require('mongoose');
let Promise = require('bluebird');
let mailer = require('mailer');

let stripe = require('stripe')(config.payments.STRIPE.SECRET_KEY);

class StripeController {

  getToken(req, res) {
    return Promise.resolve({
      checkoutToken: config.payments.STRIPE.PUBLIC_KEY
    }).then(respondWithResult(res))
  }

  verify(req, res) {
    return stripe.customers.create(req.body)
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  auth(req, res) {
    return this.$auth(req.body.offerId)
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  capture(req, res) {
    return this.$capture(req.body.offerId)
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  $auth(offerId) {
    return _auth(offerId);
  }

  $capture(offerId) {
    return _capture(offerId);
  }

  $refund(charge, amount) {

    let options = {
      charge: charge
    };

    // don't pass amount for full refund
    if (amount) {
      options.amount = amount * 100; // amount should be in cents
    }

    return stripe.refunds.create(options);
  }

}

function _getData(offerId) {
  "use strict";
  return mongoose.model('Offer').findById(offerId)
    .then(offer => {
      return mongoose.model('Event').findById(offer.eventId)
        .then(event => {
          return mongoose.model('User').findById(event.userId)
            .then(user => {
              return Promise.resolve({
                offer: offer,
                event: event,
                user: user
              });
            });
        });
    });
}

function _auth(offerId) {
  return _getData(offerId).then(data => {
    "use strict";
    let paymentData = {
      amount: data.offer.invoice.total * 100, // amount should be in cents
      currency: "usd",
      customer: data.user.payableAccountId,
      description: "Sample Checkout",
      capture: false
    };
    return stripe.charges.create(paymentData).then(payment => {
      if (payment.status === "succeeded") {
        data.offer.paymentId = payment.id;
        data.offer.paymentStatus = 'hold';
        data.event.paymentStatus = 'hold';
        return data.event.save().then(() => data.offer.save());
      }

      return _breakOffer(data.user, data.offer, mailer.breakAuth);

    });
  });
}

function _capture(offerId) {
  return _getData(offerId).then(data => {
    return stripe.charges.capture(data.offer.paymentId).then(payment => {
      if (payment.status === "succeeded") {
        data.offer.paymentStatus = 'paid';
        data.event.paymentStatus = 'paid';
        return data.event.save().then(() => data.offer.save());
      }
      return _breakOffer(data.user, data.offer, mailer.breakCapture);
    });
  });
}

function _breakOffer(user, offer, mailerMethod) {
  user.payableAccountId = undefined;
  offer.status = 'canceled';
  return Promise.all([user.save(), offer.save()]).then(() => {
    return mongoose.model('User').findById(offer.catererId).then(caterer => {
      return mailerMethod(user, caterer);
    });
  });
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
    console.log(err);
    res.status(statusCode).send(err);
  };
}

module.exports = new StripeController();
