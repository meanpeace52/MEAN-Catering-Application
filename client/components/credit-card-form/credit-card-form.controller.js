'use strict';

class CreditCardController {

  constructor($scope, $http, $window, $location) {
    this.$http = $http;
    this.$scope = $scope;
    this.$location = $location;
    this.error = null;

    $scope.stripeCallback = this.stripeCallback.bind(this);

    this.$http.get('/api/payments/card/token').then((response) => {
      $window.Stripe.setPublishableKey(response.data.checkoutToken);
    });

  }

  checkout(user, amount, description) {
    return this.$http.post('/api/payments/card/checkout', {
      amount: amount, // amount should be in cents
      customer: user.payableAccountId,
      currency: "usd",
      description: description || "Sample Checkout"
    }).then((response) => {
      console.log(response);
      alert('Check out has been successful')
    });
  }

  bindCard(token) {
    return this.$http.post('/api/payments/card/verify', {
      card: token,
      description: `Verified credit card for ${this.user.name} <${this.user.email}>`,
      email: this.user.email
    });
  }

  stripeCallback(code, result) {

    if (result.error) {
      this.error = result.error.message ? result.error.message : result.error;
    } else {
      this.error = null;
      if (this.verifier) {
        this.bindCard(result.id).then(result => {
          this.user.payableAccountId = result.data.id;
          this.$http.post(`/api/users/${this.user._id}`, {
            payableAccountId: result.data.id
          });
        });
      }

    }
  }

}

angular.module('cateringApp')
  .controller('CreditCardController', CreditCardController);
