'use strict';

class OfferCommentsController {
  constructor($http, $scope, $rootScope, socket, Auth, $cookies) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$cookies = $cookies;
    this.socket = socket;

    this.isLoggedIn = Auth.isLoggedIn;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();  //customer

    this.$scope.comments = [];

    //comment: {
    //  _id,
    //  name,
    //  userId,
    //  offerId //thread
    //  userName,
    //  text,
    //  level,
    //  repyTo //parent id
    //}
  }
}
angular.module('cateringApp')
  .controller('OfferCommentsController', OfferCommentsController);

