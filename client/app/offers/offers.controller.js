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

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('offer');
    });

    $rootScope.$on('eventActive', (eventId) => {
      console.log('get event');
      this.init(eventId);
    });

  this.isReadyForPayment = false;

    this.statuses = {
      draft: {
        statusClass: 'default'
      },
      sent: {
        statusClass: 'info'
      },
      cancelled: {
        statusClass: 'disabled'
      },
      accepted: {
        statusClass: 'warning'
      },
      confirmed: {
        statusClass: 'success'
      },
      payed: {
        statusClass: 'success money'
      }
    }

  }

  init(eventId) {
    console.log('we here');
    this.eventId = this.$scope.eventId =  this.$rootScope.eventActive || this.$cookies.get('eventActive');
    this.event = this.EventsService.getEventById(this.eventId);
    this.$scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
      this.$scope.includedInPrice = _.map(data, (item, i) => {
        return item;
      });
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

  prepareOffers() {
    _.each(this.$scope.offers, (offer, i) => {
      let cnt = [];
      _.each(this.$scope.includedInPrice, (item, j) => {
        if (_.indexOf(this.$scope.offers[i].includedInPrice, item._id) > -1) {
          cnt.push(item);
        }
      });
      this.$scope.offers[i].includedInPrice = cnt;

      this.$http.get('/api/users/' + offer.catererId).then(response => {
        this.$scope.offers[i].catererName = response.data.name;
      })
      .catch(err => {
        this.errors = err.message;
      });
    });
  }

  decline(id) {
    if (this.user.role = 'user') {
      this.$http.post('/api/offers/' + id + '/decline', {status: 'declined'}).then(response => {
        //set visual state
        _.each(this.$scope.offers, (item, i) => {
          if (item._id == id) {
            this.$scope.offers[i].status = 'declined';
          }
        });
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  accept(id) {  // by customer
    if (this.user.role = 'user') {
      this.$http.post('/api/offers/' + id + '/accept', {status: 'accepted'}).then(response => {
        //set visual state
        _.each(this.$scope.offers, (item, i) => {
          if (item._id == id) {
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

