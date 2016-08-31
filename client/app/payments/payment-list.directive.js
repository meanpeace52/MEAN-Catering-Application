'use strict';

angular.module('cateringApp')
  .directive('payments', () => ({
    controller: 'PaymentListController',
    controllerAs: 'vm',
    templateUrl: 'app/payments/payments-list.html',
    restrict: 'E'
  }));
