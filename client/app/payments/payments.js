'use strict';

angular.module('cateringApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('checkout', {
        url: '/payments/checkout',
        templateUrl: 'app/payments/checkout.html',
        controller: 'CheckoutController',
        controllerAs: 'vm',
        authenticate: true
      });
  });
