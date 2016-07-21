let config = require('../../config/environment');
let Promise = require('bluebird');

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

  checkout(req, res) {
    return stripe.charges.create(req.body)
      .then(respondWithResult(res))
      .catch(handleError(res));
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

module.exports = new StripeController();
