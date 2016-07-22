'use strict';

class EventsAdminController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, IncludedInPriceService, $interval, $filter) {

    var root = this;
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.socket = socket;
    this.incService = IncludedInPriceService;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.$scope.user = this.getCurrentUser();
    this.$scope.eventActive = null;
    this.$scope.events = [];
    this.$scope.displayed = [];

    $scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
      $scope.includedInPrice = data;
    });

    let query = { status: 'confirmed' };

    function convertIncludedInPrice(array) {
      let cnt = [];
      _.each($scope.includedInPrice, (item, j) => {
        if (_.indexOf(array, item._id) > -1) {
          cnt.push(item);
        }
      });
      return cnt;
    }

    this.pipe = function(tableState) {
      $scope.tableState = (angular.isObject(tableState) && tableState ? tableState : $scope.tableState);

      $http.post('/api/events/dataset', query).then(response => {
        $scope.events = response.data;
        _.each($scope.events, (event, i) => {
          $scope.events[i].includedInPrice = convertIncludedInPrice(event.includedInPrice);
          if ($scope.events[i].offer) {
            $scope.events[i].offer.includedInPrice = convertIncludedInPrice(event.offer.includedInPrice);
            if (event.offer.counter) {
              $scope.events[i].offer.priceWithCounter = event.pricePerPerson * event.people - event.offer.counter;
            } else {
              $scope.events[i].offer.priceWithCounter = event.pricePerPerson * event.people;
            }
          }
        })
      });

      let filtered = $scope.tableState.search.predicateObject ? $filter('filter')($scope.events, $scope.tableState.search.predicateObject) : $scope.events,
        start = $scope.tableState.pagination.start,
        number = $scope.tableState.pagination.number;

      if ($scope.tableState.sort.predicate) {
        filtered = $filter('orderBy')(filtered, $scope.tableState.sort.predicate, $scope.tableState.sort.reverse);
      }

      $scope.displayed = filtered.slice(start, start + number);
      $scope.tableState.pagination.numberOfPages = Math.ceil(filtered.length / number);
      if ($scope.eventActive) $scope.setActiveEvent($scope.eventActive);
    }

    $scope.setActiveEvent = function(event) {
      $scope.eventActive = event;
      console.log('event', event);
      _.each($scope.events, (item, i) => {
        $scope.events[i].active = false;
        if (item._id === event._id) {
          $scope.events[i].active = true;
        }
      });
    }

    var sync = $interval(root.pipe, (1000 * 60));

    $scope.$on('eventUpdated', () => {
      root.pipe();
    });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('event');
      socket.unsyncUpdates('offer');
      $interval.cancel(sync);
    });
  }
}

angular.module('cateringApp')
  .controller('EventsAdminController', EventsAdminController);

