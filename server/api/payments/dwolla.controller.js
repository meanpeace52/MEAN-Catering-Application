let config = require('../../config/environment');
let Promise = require('bluebird');
let request = require('request-promise');

let dwolla = require('dwolla-v2');
let dwollaOptions = {
  id: config.payments.DWOLLA.KEY,
  secret: config.payments.DWOLLA.SECRET
};
if (process.env.NODE_ENV !== 'production') {
  dwollaOptions.environment = 'sandbox';
}
let dwollaClient = new dwolla.Client(dwollaOptions);

console.log(12, dwollaClient);

class DwollaController {

  endAuth() {
    return request(dwollaClient.tokenUrl, {})
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  startAuth(req, res) {
    let authUrl = dwollaClient.authUrl;
    let clientId = config.payments.DWOLLA.KEY;
    let redirectUrl = '//' + req.headers.host + req.query.redirect;
    let scope = 'Transactions|Send|Request|Funding|ManageCustomers|Email';
    let output = {
      authUrl: `${authUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&scope=${scope}`
    };
    return Promise.resolve(output).then(respondWithResult(res))
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

module.exports = new DwollaController();
