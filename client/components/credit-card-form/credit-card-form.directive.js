'use strict';

angular.module('cateringApp')
  .directive('creditCardForm', function() {
    return {
      templateUrl: 'components/credit-card-form/credit-card-form.html',
      restrict: 'E',
      scope: {
        verifier: '=?',
        user: '='
      },
      link: (scope) => {
        scope.$watch('vm.user', (value) => {
          console.log('value', value)
        });
      },
      bindToController: true,
      controller: 'CreditCardController as vm'
    };
  });
