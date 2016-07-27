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

  endAuth(req, res) {

    console.log(12, dwollaClient.tokenUrl);
    let options = {
      "client_id": config.payments.DWOLLA.KEY,
      "client_secret": config.payments.DWOLLA.SECRET,
      "code": req.query.authCode,
      "grant_type": "authorization_code",
      "redirect_uri": '//' + req.headers.host + req.query.redirect
    };
    console.log('OPTIONS', options);

    return request.post(dwollaClient.tokenUrl, {
      headers: {
        "accept": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(options)
    })
      .then((response) => {
        //"{\"_links\":{\"account\":{\"href\":\"https://api-uat.dwolla.com/accounts/386c8b04-33c0-44c2-bdc2-c9d5c8c8f814\"}},\"access_token\":\"b8qPokpL8DxwKUp3SRJFVqwsnImUqjlj8uS4qrmTFetcOHPAQJ\",\"expires_in\":3594,\"refresh_token\":\"ardBw6w9ibkHdlMCMvFgyBpcDAlwP3JAr1MaZPV8iHshYpe6Hj\",\"refresh_expires_in\":5183994,\"token_type\":\"bearer\",\"scope\":\"send|funding\",\"account_id\":\"386c8b04-33c0-44c2-bdc2-c9d5c8c8f814\"}"
        let accountInfo = JSON.parse(response);


        return response;
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  startAuth(req, res) {
    let authUrl = dwollaClient.authUrl;
    let clientId = config.payments.DWOLLA.KEY;
    let redirectUrl = '//' + req.headers.host + req.query.redirect;
    let scope = 'Send|Funding'; //'Transactions|Send|Request|Funding|ManageCustomers|Email';
    let output = {
      authUrl: `${authUrl}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&scope=${scope}`//&verified_account=true`
    };
    return Promise.resolve(output).then(respondWithResult(res))
  }
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  console.log(100);
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  console.log(500);
  return function(err) {
    res.status(statusCode).send(err);
  };
}

module.exports = new DwollaController();
