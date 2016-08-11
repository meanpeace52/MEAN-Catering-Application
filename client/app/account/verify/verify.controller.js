'use strict';

class VerifyController {
  constructor(Auth, $state) {
    this.user = {};
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;

    this.verify();
  }

  verify() {
    this.Auth.verify(this.$state.params.id)
    .then(() => {
      // Logged in, redirect to home
      this.$state.go('login');
    })
    .catch(err => {
        this.errors.other = err.message;
    });
  }
}

angular.module('cateringApp')
  .controller('VerifyController', VerifyController);
