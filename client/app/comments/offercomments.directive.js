'use strict';

angular.module('cateringApp')
  .directive('offercomments', () => ({
  controller: 'OfferCommentsController',
  controllerAs: 'occ',
  templateUrl: 'app/comments/offercomments.html',
  restrict: 'EAC'
}));
