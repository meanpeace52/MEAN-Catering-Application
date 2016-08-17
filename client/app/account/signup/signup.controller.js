'use strict';

class SignupController {
  //end-non-standard

  constructor(Auth, $state, $scope, FoodTypesService, ServiceTypesService, PaymentService) {
    this.Auth = Auth;
    this.payments = PaymentService;
    this.$state = $state;
    this.$scope = $scope;
    this.user = {};
    this.addressValidationError = null;

    this.$scope.signupProcess = true;
    this.$scope.signupSuccess = false;

    this.ftService = FoodTypesService;
    this.stService = ServiceTypesService;
    this.user = {};
    this.addressValidationError = null;
    this.$scope.foodTypes = this.ftService.getFoodTypes().then((data)=> {
      this.user.foodTypes = data;
    });
    this.$scope.serviceTypes = this.stService.getServiceTypes().then((data)=> {
      this.user.serviceTypes = data;
    });

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
      request.contact_email = this.user.contact_email;
      request.contact_phone = this.user.contact_phone;
      request.ninja_firstname = this.user.ninja_firstname;
      request.ninja_lastname = this.user.ninja_lastname;
      request.ninja_email = this.user.ninja_email;
      request.ninja_phone = this.user.ninja_phone;
      request.serviceTypes = this.user.serviceTypes;
      request.minprice = this.user.minprice;
      request.description = this.user.description;
      request.veganOffers = this.user.veganOffers;
      request.website = this.user.website;
      request.phone = this.user.phone;

    }

    if (/*this.user.role && */ form.$valid) {
    //  /his.payments.verifyAddress(request.address).then(address => {
    //    request.address = address;
    //    _register.call(this, request, form);
    //  }).catch(result => {
    //    this.addressValidationError = result.ErrDescription;
    //  });
    //} else if (!this.user.role && form.$valid) {
      _register.call(this, request, form);
    }

  }
}


function _register(request, form) {
  return this.Auth.createTempUser(request)
    .then(() => {
      let root = this;
      this.$scope.signupProcess = false;
      this.$scope.signupSuccess = true;
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
