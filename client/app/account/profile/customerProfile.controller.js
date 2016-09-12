'use strict';

class CustomerProfileController {
  constructor(Auth, $state, $scope, $http, $timeout) {
    this.user = {};
    this.errors = {};
    this.submitted = false;
    this.saved = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.$timeout = $timeout;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.$scope.ft = {};

    this.getPayments().then(response => {
      this.$scope.events = response.data;
      console.log(this.$scope.events);
    });
  }

  getPayments() {
    return this.$http.post('/api/events/payments', {userId: this.user._id});
  }

  showInvoice($event, event) {
    this.$scope.isInvoiceMode = true;
    this.$scope.eventForInvoice = angular.copy(event);
    $event.stopPropagation();
  }

  changePassword(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword).then(() => {
        this.message = 'Password successfully changed.';
      })
      .catch(() => {
        form.password.$setValidity('mongoose', false);
        this.errors.other = 'Incorrect password';
        this.message = '';
      });
    }
  }

  save(form) {

    let userModel = this.user,
      url = '/api/users/' + this.user._id;
    
    this.submitted = true;

    if (userModel && form.$valid) {
      this.$http.post(url, userModel).then(response => {
        let root = this;
        this.saved = true;
        this.submitted = false;
        this.$timeout(function() {
          root.saved = false;
        }, 3000);
      })
      .catch(err => {
          this.errors.other = err.message;
      });
    }
  }

  doCheckout(token) {
    console.log("Got Stripe token: " + token.id);
  }

}

angular.module('cateringApp')
  .controller('CustomerProfileController', CustomerProfileController);
