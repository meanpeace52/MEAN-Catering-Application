'use strict';

class SignupController {
  //end-non-standard

  constructor(Auth, $state, $scope, PaymentService) {
    this.Auth = Auth;
    this.payments = PaymentService;
    this.$state = $state;
    this.$scope = $scope;
    this.user = {};
    this.addressValidationError = null;
  }
    //start-non-standard

  register(form) {

    let role = 'user',
      request = {
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        email: this.user.email,
        password: this.user.password,
        role: role
      };
    this.submitted = true;

    if (this.user.role) {
      request.role = 'caterer';
      request.contactInfo = this.user.contactInfo;
      request.companyName = this.user.companyName;
      request.location = this.user.location;
      request.address = this.user.address;
    }

    if (this.user.role && form.$valid) {
      this.payments.verifyAddress(request.address).then(address => {
        request.address = address;
        _register.call(this, request, form);
      }).catch(result => {
        this.addressValidationError = result.ErrDescription;
      });
    } else if (!this.user.role && form.$valid) {
      _register.call(this, request, form);
    }

  }
}

function _register(request, form) {
  return this.Auth.createUser(request)
    .then(() => {
      // Account created, redirect to home
      if (request.role === 'caterer') {
        this.$state.go('caterer-profile');
      } else {
        this.$state.go('main');
      }
    })
    .catch(err => {
      err = err.data;
      this.errors = {};

      // Update validity of form fields that match the mongoose errors
      angular.forEach(err.errors, (error, field) => {
        form[field].$setValidity('mongoose', false);
        this.errors[field] = error.message;
      });

    });
}

angular.module('cateringApp')
  .controller('SignupController', SignupController);
