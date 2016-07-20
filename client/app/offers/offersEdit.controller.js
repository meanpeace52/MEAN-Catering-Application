'use strict';

class OffersEditController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, $cookies, OffersService, EventsService, IncludedInPriceService) {
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
    this.user = this.getCurrentUser();

    this.incService = IncludedInPriceService;

    this.id = this.$state.params.id;
    this.$scope.fm = OffersService.getOfferById(this.id).then((data) => {
      this.$scope.fm = data;
    });

    this.eventId =  $rootScope.eventActive || $cookies.get('eventActive');
    this.event = EventsService.getEventById(this.eventId).then((data) => {
      this.event = data;
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

  confirm(id) {  //by caterer
    if (this.user.role = 'caterer') {
      this.$http.post('/api/offers/' + id + '/confirm', {status: 'confirmed', eventId: this.eventId, userId: this.user._id, dateConfirmed: new Date() }).then(response => {
        //set visual state
        this.confirmed = true;
        this.$scope.fm.status = 'confirmed';
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }
  cancel(id) {
    if (this.user.role = 'caterer') {
      this.$http.post('/api/offers/' + id + '/cancel', {status: 'cancelled', isUpdated: true}).then(response => {
        //set visual state
        this.cancelled = true;
        this.$scope.fm.status = 'cancelled';
        this.socket.syncUpdates('offer', this.$scope.offers);
      });
    }
  }

  sendRequest() {
    let offerModel = this.$scope.fm;
    offerModel.catererId = this.user._id;
    offerModel.status = 'sent';
    if (offerModel) {
      this.$http.post('/api/offers/' + this.$scope.fm._id, offerModel).then(response => {
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
    let offerModel = this.$scope.fm,
      url = '/api/offers/' + this.$scope.fm._id;

    if(!offerModel.status) offerModel.status = 'draft';

    if (offerModel) {
      this.$http.put(url, offerModel)
        .then(response => {
          this.saved = true;
        })
      .catch(err => {
        this.errors.other = err.message;
      })
    }
  }
}

angular.module('cateringApp')
  .controller('OffersEditController', OffersEditController);

