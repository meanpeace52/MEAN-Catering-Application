'use strict';

angular.module('cateringApp')
  .directive('payments-list', function() {
    return {
      templateUrl: 'app/payments/payment-list.html',
      restrict: 'E',
      scope: {
        verifier: '=?',
        ccupdate:'=',
        user: '=',
        event: '='
      },
      link: (scope) => {
        scope.$watch('vm.user', (value) => {
          console.log('value', value)
        });
      },
      bindToController: true,
      controller: 'PaymentListController as vm'
    };
  });
