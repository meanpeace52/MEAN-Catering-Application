'use strict';

angular.module('cateringApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('dwolla', {
        url: '/dwolla',
        templateUrl: 'app/payments/dwolla.html',
        controller: 'DwollaController',
        controllerAs: 'vm',
        authenticate: true,
        resolve: {
          authCode: function($location) {
            return $location.search().code;
          }
        }
      });
  });
