'use strict';

class OffersNewController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, $cookies, EventsService, IncludedInPriceService) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;

    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.incService = IncludedInPriceService;

    this.$scope.fm = {};

    this.eventId =  $rootScope.eventActive || $cookies.get('eventActive');
    this.event = EventsService.getEventById(this.eventId).then((data) => {
      this.event = data;
      this.$scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
        this.$scope.includedInPrice = _.map(data, (item, i) => {
          if (_.indexOf(this.event.includedInPrice, item._id) < 0) {
            item.checked = false;
          } else {
            item.checked = true;
          }
          return item;
        });
      });
      this.$scope.fm.includedInPrice = this.event.includedInPrice;
      this.$scope.fm.pricePerPerson = this.event.pricePerPerson;
    });

    this.$scope.fm.contactInfo = this.user.contactInfo;
    this.$scope.fm.eventId = this.eventId;

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('offer');
    });

  }

  sendRequest() {
    let offerModel = this.$scope.fm;
    offerModel.catererId = this.user._id;
    offerModel.status = 'sent';
    if (offerModel) {
      this.$http.post('/api/offers/new', offerModel).then(response => {
        this.sent = true;
        this.$state.go('events');
        this.$scope.fm = {};
      })
      .catch(err => {
          this.errors.other = err.message;
      })
    }
  }

  saveDraft() {
    let offerModel = this.$scope.fm;
    offerModel.catererId = this.user._id;
    offerModel.status = 'draft';
    if (offerModel) {
        this.$http.post('/api/offers/new', offerModel).then(response => {
          this.saved = true;
          this.$state.go('events');
          this.$scope.fm = {};
      })
      .catch(err => {
          this.errors.other = err.message;
      })
    }
  }
}

angular.module('cateringApp')
  .controller('OffersNewController', OffersNewController);

