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
      })
      .state('bank', {
        url: '/payments/bank',
        templateUrl: 'app/payments/bank.html',
        controller: 'BankController',
        controllerAs: 'vm',
        authenticate: true,
        resolve: {
          authCode: function($location) {
            return $location.search().code;
          }
        }
      });
  });
