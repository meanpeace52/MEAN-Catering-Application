'use strict';

class EventsController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, $cookies, $sce) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$sce = $sce;
    this.$cookies = $cookies;
    this.socket = socket;

    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();

    this.$scope.events = this.getEventsList();
    this.$scope.eventActive = null;

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
      completed: {
        statusClass: 'success'
      }
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('event');
      socket.unsyncUpdates('offer');
    });

  }

  delete(event) {
    let url = '/api/events/' + event._id;

    this.$http.delete(url, event)
      .then(response => {
        this.getEventsList();
      })
    .catch(err => {
        this.errors.other = err.message;
    })
  }

  cancel(id) {
    if (this.user.role = 'user') {
      this.$http.post('/api/events/' + id + '/cancel', {status: 'cancelled'}).then(response => {
        _.each(this.$scope.events, (item, i) => {
          if (item._id == id) {
            this.$scope.events[i].drafted = true;
            this.$scope.events[i].status = 'cancelled';
          }
        });
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  decline(id) {        //as caterer
    if (this.user.role = 'caterer') {
      this.$http.post('/api/events/' + id + '/decline', {rejectedBy: this.user._id}).then(response => {
        _.each(this.$scope.events, (item, i) => {
          if (item._id == id) {
            this.$scope.events[i].drafted = true;
          }
        });
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  prepareCatererEvents() {
    _.each(this.$scope.events, (event, i) => {
      if (_.indexOf(event.rejectedBy, this.user._id) >= 0 || event.status == "cancelled") {
        this.$scope.events[i].drafted = true;
      }

      this.$http.post('/api/offers', {eventId: event._id, catererId: this.user._id}).then(response => {
        let offerUrl = (response.data.length ? '/offers/' + response.data[0]._id : '/offers/new'),
            status = (response.data.length ? response.data[0].status : null),
            newOrOld = (response.data.length ? 'Edit' : 'New');
        this.$scope.events[i].offerUrl = offerUrl;
        this.$scope.events[i].newOrOld = newOrOld;
        this.$scope.events[i].offerInfo = this.$sce.trustAsHtml('<span class="label label-info">' + status + '</span>');
        //check rejected
        this.socket.syncUpdates('offer', this.$scope.events);
      });
    });
  }

  prepareUserEvents() {
    _.each(this.$scope.events, (event, i) => {
      if (event.status == "cancelled") {
        this.$scope.events[i].drafted = true;
      }
      this.$http.post('/api/offers', {eventId: event._id}).then(response => {
        let offersNumber = response.data.length,
          offersInfo = '';
        _.each(response.data, (offer, j) => {
          let status = offer.status;
          this.$http.get('/api/users/' + offer.catererId).then(res => {
            offersInfo += '<div>' + res.data.name + ' <span class="label label-info">' + status + '</span></div><hr class="popover-divider" />';
            this.$scope.events[i].offersInfo = this.$sce.trustAsHtml(offersInfo);
          });
        });
        this.$scope.events[i].offersNumber = offersNumber;
        this.socket.syncUpdates('offer', this.$scope.events);
      });
    });
  }

  getEventsList() {
    if (this.user.role == 'user') {
      this.$http.post('/api/events', {userId: this.user._id}).then(response => {
        this.$scope.events = response.data;
        this.prepareUserEvents();
        this.socket.syncUpdates('event', this.$scope.events);
      });
    } else if (this.user.role == 'caterer') {
      this.$http.post('/api/events', {showToCaterers: true, sentTo: this.user._id}).then(response => {
        this.$scope.events = response.data;
        this.prepareCatererEvents();
        this.socket.syncUpdates('event', this.$scope.events);
      });
    }
  }

  setActiveEvent(event) {
    this.$scope.eventActive = event._id;
    this.$rootScope.eventActive = event._id;
    this.$cookies.put('eventActive', event._id);
    this.$rootScope.$broadcast('eventActive', event._id);
  }
}

angular.module('cateringApp')
  .controller('EventsController', EventsController);

