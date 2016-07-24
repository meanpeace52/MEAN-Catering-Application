'use strict';

class BankController {

  constructor($http, $window, authCode) {
    this.$http = $http;
    this.$window = $window;

    if (!authCode) {
      this.auth();
    } else {
      this.isAuth = true;
      this.getTokens(authCode);
    }

  }

  auth() {
    this.$http.get('/api/payments/bank/startAuth?redirect=/payments/bank').then((response) => {
      this.$window.open(response.data.authUrl, '_self');
    });
  }

  getTokens(authCode) {
    this.$http.get('/api/payments/bank/startAuth?redirect=/payments/bank&authCode=' + authCode).then((response) => {
      //
    });
  }

  sendPayment(token) {
    this.$http.post('/api/payments/checkout', {
      amount: 50, // amount should be in cents
      currency: "usd",
      source: token,
      description: "Sample Checkout"
    }).then((response) => {
      console.log(response);
      alert('Check out has been successful')
    });
  }

  callback(code, result) {
    if (result.error) {
      alert('it failed! error: ' + result.error.message);
    } else {
      this.checkout(result.id);
    }
  }

}

angular.module('cateringApp')
  .controller('BankController', BankController);
