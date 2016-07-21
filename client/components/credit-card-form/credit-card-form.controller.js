'use strict';

class CreditCardController {

  constructor($scope, $http, $window, $location) {
    this.$http = $http;
    this.$scope = $scope;
    this.$location = $location;

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

    console.log(code, result, this.$scope.verifier, this.verifier);



    if (result.error) {
      console.log(result.error);
    } else {

      if (this.verifier) {
        this.bindCard(result.id).then(result => {
          this.user.payableAccountId = result.data.id;
          this.$http.post(`/api/users/${this.user._id}`, {
            payableAccountId: result.data.id
          }).then(result => {
            console.log(result.data);
            // this.checkout(result.data, 10000, 'test');
          });
        });
      }

      if (this.auth) {

      }

      if (this.capture) {

      }


    }
  }

}

angular.module('cateringApp')
  .controller('CreditCardController', CreditCardController);
