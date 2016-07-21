'use strict';

class CheckoutController {

  constructor($scope, $http, $window) {
    this.$http = $http;
    $scope.stripeCallback = this.callback.bind(this);

    this.$http.get('/api/payments/card/token').then((response) => {
      $window.Stripe.setPublishableKey(response.data.checkoutToken);
    });

  }

  checkout(token) {
    this.$http.post('/api/payments/card/checkout', {
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
  .controller('CheckoutController', CheckoutController);
