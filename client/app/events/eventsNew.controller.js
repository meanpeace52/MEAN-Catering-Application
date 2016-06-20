'use strict';

class EventsNewController {
  constructor($http, $scope,  socket, Auth, $state, EventsService, FoodTypesService, IncludedInPriceService) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;

    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.isManager = Auth.isManager;
    this.isCaterer = Auth.isCaterer;
    this.isUser = Auth.isUser;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();

    this.ftService = FoodTypesService;
    this.incService = IncludedInPriceService;

    this.$scope.foodTypes = this.ftService.getFoodTypes().then((data)=> {
      this.$scope.foodTypes = _.map(data, (item, i) => {
        if (_.indexOf(this.$scope.fm.foodTypes, item._id) < 0) {
          item.checked = false;
        } else {
          item.checked = true;
        }
        return item;
      });
    });

    this.$scope.fm = {};
    this.$scope.fm.date = this.$scope.date = new Date();
    this.$scope.fm.time = this.$scope.time = new Date();
    this.$scope.fm.pricePerPerson = 0.5;
    this.$scope.fm.selectedCaterers = [];
    this.$scope.selectionOccured = true;
    this.$scope.caterers = this.getCaterers();

    $scope.dateOptions = {
      formatYear: 'yy',
      minDate: new Date(),
      startingDay: 1
    };

    $scope.popup1 = {
      opened: false
    };

    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };

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

  checkFT(id, caterer) {
    if (_.indexOf(caterer.foodTypes, id) > -1) {
      return true;
    } else {
      return false;
    }
  }

  toggleFT() {
    let selectedFT = this.$scope.fm.foodTypes;

    //this.$scope.foodTypesAll = true;

    _.each(this.$scope.caterers, (item, i) => {
      let intersect = _.intersection(item.foodTypes, selectedFT);
      this.$scope.caterers[i].showByFT = !!intersect.length;
      if (_.indexOf(this.$scope.fm.selectedCaterers, item._id) < 0) {
        this.$scope.caterers[i].showByEdit = false;
        this.$scope.caterers[i].checked = false;

      } else {
        this.$scope.caterers[i].showByEdit = true;
        this.$scope.caterers[i].checked = true;
      }
    });
  }

  watchForEdit(id) {
    this.$scope.selectionOccured = true;
    this.$scope.foodTypesAll = false;
    if (_.indexOf(this.$scope.fm.selectedCaterers, id) < 0) {
      this.addToSelected(id);
      _.each(this.$scope.caterers, (item, i) => {
        if (item._id === id) {
        this.$scope.caterers[i].showByEdit = true;
        this.$scope.caterers[i].checked = true;
      }
    });
  } else {
    this.removeFromSelected(id);
    _.each(this.$scope.caterers, (item, i) => {
      if (item._id === id) {
      this.$scope.caterers[i].showByEdit = false;
      this.$scope.caterers[i].checked = false;
    }
  });
  }
  }

  removeFromSelected(id) {
    _.pull(this.$scope.fm.selectedCaterers, id);
  }

  addToSelected(id) {
    this.$scope.fm.selectedCaterers.push(id);
  }

  toggleAll() {
    let selectedFT = this.$scope.fm.foodTypes;

    _.each(this.$scope.caterers, (item, i) => {
      let intersect = _.intersection(item.foodTypes, selectedFT);
    if (intersect.length) {  //foodtype matches
      if (this.$scope.foodTypesAll) {
        this.$scope.caterers[i].showByEdit = true;
        this.$scope.caterers[i].checked = true;
        this.addToSelected(item._id);
      } else {
        this.$scope.caterers[i].showByEdit = false;
        this.$scope.caterers[i].checked = false;
        this.removeFromSelected(item._id);
      }
    }
  });
  }

  getCaterers() {
    this.$http.get('/api/users/caterers').then(response => {
      this.$scope.caterers = response.data;
      this.toggleFT();
    })
    .catch(err => {
      this.errors = err.message;
    });
  }

  sendRequest(form) {
    let eventModel = this.$scope.fm,
      url = '/api/events/new';

    eventModel.showToCaterers = true;
    eventModel.sentTo = eventModel.selectedCaterers;
    eventModel.status = 'sent';
    eventModel.userId = this.user._id;
    if (this.$scope.fm.status = 'sent') eventModel.isUpdated = true;

    console.log(form);

    if (eventModel && form.$valid) {
      this.$http.post(url, eventModel)
        .then(response => {
        this.sent = true;
        this.$state.go('events');
      })
      .catch(err => {
          this.errors.other = err.message;
      });
    }
  }

  saveDraft(form) {
    let eventModel = this.$scope.fm;

    eventModel.userId = this.user._id;
    eventModel.status = 'draft';

    if (eventModel && form.$valid) {
      this.$http.post('/api/events/new', eventModel)
        .then(response => {
          this.saved = true;
          this.$scope.fm = {};
          //this.$state.go('events');
        })
        .catch(err => {
          this.errors.other = err.message;
        })
    }
  }
}

angular.module('cateringApp')
  .controller('EventsNewController', EventsNewController);

