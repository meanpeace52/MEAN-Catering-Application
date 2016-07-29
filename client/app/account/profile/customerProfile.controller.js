'use strict';

class CustomerProfileController {
  constructor(Auth, $state, $scope) {
    this.user = {};
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.$scope.ft = {};
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

    if (userModel && form.$valid) {
      this.$http.post(url, userModel).then(response => {
        let root = this;
        this.saved = true;
        this.$timeout(function() {
          root.saved = false;
        }, 3000);
      })
      .catch(err => {
          this.errors.other = err.message;
      });
    }
  }

}

angular.module('cateringApp')
  .controller('CustomerProfileController', CustomerProfileController);
