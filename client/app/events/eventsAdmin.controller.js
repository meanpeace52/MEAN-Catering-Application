'use strict';

class EventsAdminController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, IncludedInPriceService, $interval, $filter, $uibModal, $log, $timeout) {

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

    this.$scope.selectedEvents = {};
    this.$scope.allEventsAreSelected = false;

    $scope.selectAll = value => this.$scope.events.forEach(event => $scope.selectedEvents[event._id] = value);
    $scope.isSelected = event => selectedEvents[event._id];

    $scope.select = () => {
      let allIsSelected = true;
      for (let k in $scope.selectedEvents) {
        if(!$scope.selectedEvents[k]) {
          allIsSelected = false;
          break;
        }
      }
      $scope.allEventsAreSelected = allIsSelected;
    };
    $scope.selectAll(false);

    $scope.paySelected = () => {
      let selectedEventIds = [];
      for (let k in $scope.selectedEvents) {
        if($scope.selectedEvents[k]) {
          selectedEventIds.push(k);
        }
      }
      let selectedEvents = $scope.events.filter(event => selectedEventIds.includes(event._id));

      if (selectedEvents.length) {
        this.$http.post('/api/payments/pay', {
          items: selectedEvents.map(event => event.offer._id)
        }).then(response => {
          $scope.$emit('eventUpdated');
        });
      }
    };

    $scope.pay = (offer) => {
      this.$http.post('/api/payments/pay', {
        items: [offer._id]
      }).then(response => {
        $scope.$emit('eventUpdated');
      });
    };

    $scope.open = (offer) => {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'adjustPayment.html',
        controller: ($scope, $uibModalInstance) => {

          $scope.totalRefund = angular.copy(offer.invoice);
          $scope.totalRefund.refund = $scope.totalRefund.total;
          $scope.totalRefund.adjustment.client = 0;
          $scope.totalRefund.adjustment.caterer = 0;
          $scope.totalRefund.adjustment.chargeOff = 0;
          $scope.partialRefund = angular.copy(offer.invoice);
          $scope.partialRefund.refund = 0;
          $scope.updatedInvoice = $scope.totalRefund;

          $scope.setAdjustment = (updatedInvoice) => {
            $scope.updatedInvoice = updatedInvoice
          };

          $scope.ok = () => {
            console.log(this.$scope.eventActive.offer.invoice, $scope.updatedInvoice);
            angular.merge(this.$scope.eventActive.offer.invoice, $scope.updatedInvoice);

            this.$http.post('/api/offers/' + this.$scope.eventActive.offer._id, this.$scope.eventActive.offer).then(response => {
              this.$http.post('/api/events/' + this.$scope.eventActive._id, this.$scope.eventActive).then(response => {
                $uibModalInstance.close();
              })
            });
          };

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        },
        size: 'lg'
        //resolve: {
        //  items: function () {
        //    return $scope.items;
        //  }
        //}
      });

      modalInstance.result.then(function () {
        //$scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

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
            if (event.offer.invoice) {
              $scope.events[i].offer.priceWithCounter = event.offer.invoice.total;
            } else if (event.offer.counter) {
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
        if (item._id == event._id) {
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

