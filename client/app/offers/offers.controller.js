'use strict';

class OffersController {
  constructor($http, $scope, $rootScope, socket, Auth, $cookies, IncludedInPriceService, EventsService) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$cookies = $cookies;
    this.socket = socket;

    this.isLoggedIn = Auth.isLoggedIn;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();

    this.EventsService = EventsService;
    this.incService = IncludedInPriceService;

    this.$scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
      this.$scope.includedInPrice = data;
    });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('offer');
    });

    $rootScope.$on('eventActive', (eventId) => {
      this.init(eventId);
    });

    this.isReadyForPayment = false;

  }

  init(eventId) {
    this.eventId = this.$scope.eventId =  this.$rootScope.eventActive || this.$cookies.get('eventActive');
    this.event = this.EventsService.getEventById(this.eventId).then((data) => {
      this.event = this.$scope.event = data;
      this.$scope.event.includedInPrice = this.convertIncludedInPrice(this.$scope.event.includedInPrice);
      this.$scope.offers = this.getOffersList();
    });
  }

  delete(offer) {
    let url = '/api/offers/' + offer._id;

    this.$http.delete(url, offer)
      .then(response => {
      this.getOffersList();
    })
    .catch(err => {
        this.errors.other = err.message;
    })
  }

  convertIncludedInPrice(array) {
    let cnt = [];
    _.each(this.$scope.includedInPrice, (item, j) => {
      if (_.indexOf(array, item._id) > -1) {
        cnt.push(item);
      }
    });
    return cnt;
  }

  prepareOffers() {
    let acceptedIndex = -1;
    _.each(this.$scope.offers, (offer, i) => {
      if (offer.status == 'accepted' || offer.status == 'confirmed') acceptedIndex = i;
      if (offer.status == 'cancelled') this.$scope.offers[i].drafted = true;
      if (offer.counter) {
        this.$scope.offers[i].priceWithCounter = offer.pricePerPerson - (offer.pricePerPerson * offer.counter / 100);
      } else {
        this.$scope.offers[i].priceWithCounter = offer.pricePerPerson;
      }
      this.$scope.offers[i].includedInPrice = this.convertIncludedInPrice(this.$scope.offers[i].includedInPrice);


      this.$http.get('/api/users/' + offer.catererId).then(response => {
        this.$scope.offers[i].caterer = response.data;
        this.$rootScope.$broadcast('imageLoaded');
      })
      .catch(err => {
        this.errors = err.message;
      });
    });
    if (acceptedIndex > -1) {
      _.each(this.$scope.offers, (offer, i) => {
        if (i !== acceptedIndex) this.$scope.offers[i].drafted = true;
      });
    }
  }

  decline(id) {
    if (this.user.role = 'user') {
      this.$http.post('/api/offers/' + id + '/decline', {status: 'declined'}).then(response => {
        //set visual state
        _.each(this.$scope.offers, (item, i) => {
          if (item._id == id) {
            this.$scope.offers[i].drafted = true;
            this.$scope.offers[i].status = 'declined';
          }
        });
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  accept(id) {  // by customer
    if (this.user.role = 'user') {
      this.$http.post('/api/offers/' + id + '/accept', {status: 'accepted', eventId: this.eventId }).then(response => {
        //set visual state
        _.each(this.$scope.offers, (item, i) => {
          this.$scope.offers[i].drafted = true;
          if (item._id == id) {
            this.$scope.offers[i].drafted = false;
            this.$scope.offers[i].status = 'accepted';
          }
        });
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  getOffersList() {
    this.$http.post('/api/offers', { eventId: this.eventId }).then(response => {
      this.$scope.offers = response.data;
      this.prepareOffers();
      this.socket.syncUpdates('offer', this.$scope.offers);
    });
  }
}

angular.module('cateringApp')
  .controller('OffersController', OffersController);

