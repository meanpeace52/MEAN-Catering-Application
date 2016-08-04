let config = require('../../config/environment');
let Promise = require('bluebird');
let request = require('request-promise');

let dwolla = require('dwolla-v2');
let dwollaOptions = {
  id: config.payments.DWOLLA.KEY,
  secret: config.payments.DWOLLA.SECRET
};
//if (process.env.NODE_ENV !== 'production') {
  dwollaOptions.environment = 'sandbox';
//}
let dwollaClient = new dwolla.Client(dwollaOptions);

console.log(12, dwollaClient);

class DwollaController {

  pay(items) {
    var accountToken = new dwollaClient.Token({
      access_token: config.payments.DWOLLA.ACCESS_TOKEN,
      refresh_token: config.payments.DWOLLA.REFRESH_TOKEN
    });

    console.log(JSON.stringify(items), accountToken);

    if (items.length === 0 || !accountToken) {
      return Promise.reject({});
    }



    return accountToken.get(`https://api-uat.dwolla.com/accounts/${config.payments.DWOLLA.ACCOUNT_ID}/funding-sources`).then((response) => {
      let fundingSources = response.body._embedded['funding-sources'];
      let balance = fundingSources.filter(item => item.type === 'balance')[0];
      console.log(11, balance._links.self.href);
      var requestBody = {
        _links: {
          source: balance._links.self
        },
        items: items
      };
      return accountToken.post('mass-payments', requestBody).then(response => {
        console.log(1000, response);
      });
    });

  }

  endAuth(req, res) {

    console.log(12, dwollaClient.tokenUrl);
    let options = {
      "client_id": config.payments.DWOLLA.KEY,
      "client_secret": config.payments.DWOLLA.SECRET,
      "code": req.query.authCode,
      "grant_type": "authorization_code",
      "redirect_uri": '//' + req.headers.host + req.query.redirect /*"redirect_uri": request.headers.protocol + '://' + req.headers.host + req.query.redirect*/
    };
    console.log('OPTIONS', options);

    return request.post(dwollaClient.tokenUrl, {
      headers: {
        "accept": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(options)
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
