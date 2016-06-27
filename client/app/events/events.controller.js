'use strict';

class EventsController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, $cookies, $sce, OffersService, $interval, NgTableParams) {

    var root = this,
      sync = $interval(eventPoller, (1000 * 60 * 2));

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
    this.OffersService = OffersService;
    this.NgTableParams = NgTableParams;

    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.$scope.eventActive = null;
   /*this.$scope.events = this.$http.post('/api/events', {userId: this.user._id}).then(response => {
      this.$scope.events = response.data;
      console.log('fff', response.data);
    });
    console.log('rrr', this.$scope.events);

    this.tableParams = new NgTableParams({}, { getData: function(params){
      return $http.post('/api/events', {userId: root.user._id}).then((response) => {
        params.total(response.data.length);
        console.log('params', params, response.data, root.user._id);
        root.$scope.events = response.data;
        return root.$scope.events;
      });
    }}); */

    function eventPoller() {
      root.$scope.events = root.getEventsList();
      //this.tableParams.reload();
    }

    eventPoller();

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('event');
      socket.unsyncUpdates('offer');
      $interval.cancel(sync);
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
      this.$http.post('/api/offers/cancelAll', {eventId: id, catererId: this.user._id}).then(response => {
       //all offers are cancelled
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
            offersNumber = response.data.length;
        this.$scope.events[i].offerUrl = offerUrl;
        this.$scope.events[i].offerStatus = status;
        this.$scope.events[i].offersNumber = offersNumber;
        this.tableParams = new this.NgTableParams({
          filter: { name: "T" }
        }, {
          dataset: this.$scope.events
        });
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

        this.tableParams = new this.NgTableParams({}, {
          dataset: this.$scope.events
        });
        console.log('fff', this.tableParams);
        this.socket.syncUpdates('offer', this.$scope.events);
      });
    });
  }

  getEventsList() {
    if (this.user.role == 'user') {
      this.$http.post('/api/events', {userId: this.user._id}).then(response => {
        this.$scope.events = response.data;
        console.log('fff', response.data);
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
    _.each(this.$scope.events, (item, i) => {
      if (item._id ==  event._id) {
        this.$scope.events[i].active = true;
      }
    });
  }
}

angular.module('cateringApp')
  .controller('EventsController', EventsController);

