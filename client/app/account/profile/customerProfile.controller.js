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


}

angular.module('cateringApp')
  .controller('CustomerProfileController', CustomerProfileController);
