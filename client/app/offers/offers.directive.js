'use strict';

angular.module('cateringApp')
  .directive('offerslist', () => ({
    controller: 'OffersController',
    controllerAs: 'oc',
    templateUrl: 'app/offers/offers.html',
    restrict: 'E'
  }));
