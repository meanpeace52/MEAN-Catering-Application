'use strict';

class EventsEditController {
  constructor($http, $scope, socket, Auth, $state, EventsService, FoodTypesService, IncludedInPriceService, ServiceTypesService) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;
    this.EventsService = EventsService;
    this.ftService = FoodTypesService;
    this.incService = IncludedInPriceService;
    this.sService = ServiceTypesService;

    this.$scope.caterers = [];
    this.$scope.selectionOccured = false;

    this.eventId = this.$state.params.id;
    this.$scope.fm = EventsService.getEventById(this.eventId).then((data) => {
      this.$scope.fm = data;
      this.$scope.fm.date = this.$scope.date = new Date(this.$scope.fm.date);
      this.$scope.fm.time = this.$scope.time = new Date(this.$scope.fm.time);
      this.$scope.fm.pricePerPerson = +this.$scope.fm.pricePerPerson;
      if (!this.$scope.fm.includedInPrice) {
        this.$scope.fm.includedInPrice = [];
      }

      if (!this.$scope.fm.selectedCaterers) {
        this.$scope.fm.selectedCaterers = [];
      } else {
        this.$scope.selectionOccured = true;
      }
      this.$scope.caterers = this.getCaterers();
    });

    this.$scope.foodTypes = this.ftService.getFoodTypes().then((data)=> {
      this.$scope.foodTypes = data;
    });

    this.$scope.serviceTypes = this.sService.getServiceTypes().then((data)=> {
      this.$scope.serviceTypes = data;
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

    this.required = {
      name: "Name should not be empty",
      date: "Select date",
      time: "Select time",
      pricePerPerson: "Select price per person",
      people: "Enter number of people",
      location: "Enter location"
    }

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
  }

  //caterer
  //  showByFT
  //  checked
  //  showByEdit

  checkFT(id, caterer) {
    if (_.indexOf(caterer.foodTypes, id) > -1) {
      return true;
    } else {
      return false;
    }
  }

  checkST(id, caterer) {
    if (_.indexOf(caterer.serviceTypes, id) > -1) {
      return true;
    } else {
      return false;
    }
  }

  toggleCat() {
    let selectedFT = this.$scope.fm.foodTypes,
      selectedST = this.$scope.fm.serviceTypes;

    //this.$scope.foodTypesAll = true;

    _.each(this.$scope.caterers, (item, i) => {
      if (!selectedFT.length && !selectedST.length) {
      this.$scope.caterers[i].showByCat = true;
    } else {
      let intersectFT = _.intersection(item.foodTypes, selectedFT),
        intersectST = _.intersection(item.serviceTypes, selectedST);

      //if (intersectFT.length && intersectST.length) {
      this.$scope.caterers[i].showByCat = !!(intersectFT.length && intersectST.length);
      //}

      if (_.indexOf(this.$scope.fm.selectedCaterers, item._id) < 0) {
        this.$scope.caterers[i].showByEdit = false;
        this.$scope.caterers[i].checked = false;

      } else {
        this.$scope.caterers[i].showByEdit = true;
        this.$scope.caterers[i].checked = true;
      }
    }

  });
  }

  watchForEdit(id) {
    this.$scope.selectionOccured = true;
    this.$scope.selectAll = false;
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
    let selectedFT = this.$scope.fm.foodTypes,
      selectedST = this.$scope.fm.serviceTypes;

    _.each(this.$scope.caterers, (item, i) => {
      let intersectFT = _.intersection(item.foodTypes, selectedFT),
      intersectST = _.intersection(item.serviceTypes, selectedST);
    if (intersectFT.length && intersectST.length) {  //foodtype matches
      if (this.$scope.selectAll) {
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
      this.toggleCat();
    })
    .catch(err => {
      this.errors = err.message;
    });
  }

  sendRequest() {
    let eventModel = this.$scope.fm,
        url = '/api/events/' + this.$scope.fm._id;

    eventModel.showToCaterers = true;
    eventModel.sentTo = eventModel.selectedCaterers;
    eventModel.status = 'sent';

    if (this.$scope.fm.status = 'sent') eventModel.isUpdated = true;

    if (eventModel) {
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

  saveDraft() {
    let eventModel = this.$scope.fm,
        url = '/api/events/' + this.$scope.fm._id;

    if (eventModel.status == 'sent') {
      //TODO differ and save new draft and what was sent to caterer
    }

    if (eventModel) {
      this.$http.post(url, eventModel)
        .then(response => {
          this.saved = true;
          //this.$state.go('events');
        })
        .catch(err => {
          this.errors.other = err.message;
        });
    }
  }
}

angular.module('cateringApp')
  .controller('EventsEditController', EventsEditController);

