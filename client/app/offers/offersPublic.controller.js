'use strict';

class OffersPublicController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, $cookies, OffersService, EventsService, IncludedInPriceService, PaymentService) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;
    this.payments = PaymentService;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;

    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();

    this.incService = IncludedInPriceService;

    this.id = this.$state.params.id;
    this.$scope.fm = OffersService.getOfferById(this.id).then((data) => {
      this.$scope.fm = data;
      this.$scope.offer = data;
    });

    this.$scope.isPast = false;

    this.eventId =  $rootScope.eventActive || $cookies.get('eventActive');
    this.event = EventsService.getEventById(this.eventId).then((data) => {
      this.event = data;
      if (Date.parse(this.event.date) < Date.parse(new Date())) this.$scope.isPast = true;
    });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('event');
    });

    this.$scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
      this.$scope.includedInPrice = _.map(data, (item, i) => {
        if (_.indexOf(this.$scope.fm.includedInPrice, item._id) < 0) {
          item.checked = false;
        } else {
          item.checked = true;
        }
        return item;
      });
    });
  }

  backToList() {
    this.$state.go('events', { time: 'active' });
  }
}

angular.module('cateringApp')
  .controller('OffersPublicController', OffersPublicController);

