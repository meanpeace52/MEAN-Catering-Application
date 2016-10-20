'use strict';

class EventsEditController {
  constructor($http, $scope, socket, Auth, $state, EventsService, FoodTypesService, IncludedInPriceService, ServiceTypesService, PaymentService) {
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;
    this.verifyCard = false;
    let _this = this;
    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;
    this.EventsService = EventsService;
    this.ftService = FoodTypesService;
    this.incService = IncludedInPriceService;
    this.sService = ServiceTypesService;
    this.payments = PaymentService;

    $scope.saveCustomer = this.saveCustomer.bind(this);

    this.isUser = Auth.isUser;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();

    this.$scope.selectionOccured = true;

    this.$scope.fm = {};
    this.$scope.fm.foodTypes = [];
    this.$scope.foodTypes = [];
    this.$scope.fm.serviceTypes = [];
    this.$scope.serviceTypes = [];
    this.$scope.caterers = [];
    this.$scope.card = {};
    this.$scope.fm.includedInPrice = [];
    this.$scope.fm.selectedCaterers = [];

    this.$scope.filter = {
      allFt: false,
      allSt: false,
      selectAll: false
    }

    this.eventId = this.$state.params.id;

    EventsService.getEventById(this.eventId).then((data) => {
      this.$scope.fm = data;
      this.$scope.fm.date = this.$scope.date = new Date(this.$scope.fm.date);
      this.$scope.fm.time = this.$scope.time = new Date(this.$scope.fm.time);
      this.$scope.fm.pricePerPerson = +this.$scope.fm.pricePerPerson;
    })
    .then(() => {
      return this.getCaterers();
    })
    .then((caterers) => {
      this.$scope.caterers = caterers;
      if (this.$scope.fm.selectedCaterers.length) {
        _.each(this.$scope.caterers, (item, i) => {
          item.showByEdit = (_.indexOf(this.$scope.fm.selectedCaterers, item._id) > -1);
        });
      }
    })
    .then(() => {
      return this.ftService.getFoodTypes();
    })
    .then((ftdata)=> {
      this.$scope.foodTypes = ftdata;
    })
    .then(() => {
      return this.sService.getServiceTypes();
    })
    .then((stdata)=> {
      this.$scope.serviceTypes = stdata;
    })
    .then(() => {
      this.toggleCat();
      //this.$scope.$watch('filter.selectAll', (newValue, oldValue) => {
      //  if(newValue !== oldValue){
      //    this.toggleAll();
      //  }
      //});
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

    $scope.$watch('fm.people', updateValue3);
    $scope.$watch('fm.vegetarianMeals', updateValue3);

    function updateValue3() {
      $scope.fm.totalMeals = +$scope.fm.people - +$scope.fm.vegetarianMeals;
    }

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

  toggleAllFT() {
    if (this.$scope.filter.allFt) {
      this.$scope.fm.foodTypes = _.map(this.$scope.foodTypes, (ft) => {
          return ft._id;
    });
  } else {
    this.$scope.fm.foodTypes = [];
  }
  this.toggleCat();
  }

  toggleAllST() {
    if (this.$scope.filter.allSt) {
      this.$scope.fm.serviceTypes = _.map(this.$scope.serviceTypes, (st) => {
          return st._id;
    });
  } else {
    this.$scope.fm.serviceTypes = [];
  }
  this.toggleCat();
  }

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

  toggleCatOnclick(t) {
    if (t == 'ft') {
      this.$scope.filter.allFt = false;
    } else if (t == 'st') {
      this.$scope.filter.allSt = false;
    }

    this.toggleCat();

  }

  toggleCat() {
    let selectedFT = this.$scope.fm.foodTypes,
      selectedST = this.$scope.fm.serviceTypes;

    _.each(this.$scope.caterers, (item, i) => {
      let intersectFT = _.intersection(item.foodTypes, selectedFT),
        intersectST = _.intersection(item.serviceTypes, selectedST);
      if (!selectedFT.length && !selectedST.length) {
        this.$scope.caterers[i].showByCat = true;
      } else if (selectedFT.length && !selectedST.length) {
        this.$scope.caterers[i].showByCat = !!(intersectFT.length);
      } else if (!selectedFT.length && selectedST.length) {
        this.$scope.caterers[i].showByCat = !!(intersectST.length);
      } else if (selectedFT.length && selectedST.length) {
        this.$scope.caterers[i].showByCat = !!(intersectFT.length && intersectST.length);
      }

      if (_.indexOf(this.$scope.fm.selectedCaterers, item._id) < 0) {
        this.$scope.caterers[i].showByEdit = false;
      } else {
        this.$scope.caterers[i].showByEdit = true;
      }

    });

  }

  watchForEdit(id) {
    this.$scope.selectionOccured = true;
    //this.$scope.filter.selectAll = false;
    if (_.indexOf(this.$scope.fm.selectedCaterers, id) < 0) {
      this.addToSelected(id);
      _.each(this.$scope.caterers, (item, i) => {
        if (item._id === id) {
        this.$scope.caterers[i].showByEdit = true;
      }
    });
  } else {
    this.removeFromSelected(id);
    _.each(this.$scope.caterers, (item, i) => {
      if (item._id === id) {
      this.$scope.caterers[i].showByEdit = false;
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
    _.each(this.$scope.caterers, (item, i) => {
      if (this.$scope.filter.selectAll) {
        this.addToSelected(item._id);
        this.$scope.caterers[i].showByEdit = true;
      }
      if (!this.$scope.filter.selectAll) {
        this.removeFromSelected(item._id);
        this.$scope.caterers[i].showByEdit = false;
      }
    });
  }

  getCaterers() {
    return this.$http.get('/api/users/caterers').then(response => {
      return response.data;
    });
  }
  sendRequest(form) {

    if (!this.user.payableAccountId) {
      let saving = this.saveDraft(form);
      if (saving) {
        saving.then(() => {
          this.verifyCard = true;
        });
      }
    } else {
      this.verifyCard = false;
      let eventModel = this.$scope.fm,
        url = '/api/events/' + this.$scope.fm._id;

      eventModel.showToCaterers = true;
      eventModel.sentTo = eventModel.selectedCaterers;
      eventModel.status = 'sent';

      if (this.$scope.fm.status == 'sent') eventModel.isUpdated = true;

      if (eventModel && form.$valid) {
        //this.payments.verifyAddress(eventModel.address).then(address => {
          //eventModel.address = address;
          this.$http.post(url, eventModel)
            .then(response => {
              this.sent = true;
              this.$state.go('events', { time: 'active' });
            })
            .catch(err => {
              this.errors.other = err.message;
            });
        //}).catch(result => {
        //  this.addressValidationError = result.ErrDescription;
        //});

      }
    }

  }

  saveCustomer(status, response) {
    let token = response.id;

    this.bindCard(token).then(result => {
      this.user.payableAccountId = result.data.id;

    this.$http.post(`/api/users/${this.user._id}`, {
      payableAccountId: result.data.id
    });

    let eventModel = this.$scope.fm,
      url = '/api/events/' + eventModel._id;

    eventModel.showToCaterers = true;
    eventModel.sentTo = eventModel.selectedCaterers;
    eventModel.status = 'sent';
    eventModel.userId = this.user._id;
    eventModel.createDate = new Date();

    if (eventModel.status == 'sent') eventModel.isUpdated = true;

    if (eventModel) {
      this.$http.post(url, eventModel)
        .then(response => {
        //this.$state.go('events');
      })
    .catch(err => {
        this.errors.other = err.message;
    });
    }
    this.$state.go('events', { time: 'active' });
  });
  }


  bindCard(token) {
    return this.$http.post('/api/payments/card/verify', {
      card: token,
      description: `Verified credit card for ${this.user.firstname} ${this.user.lastname} <${this.user.email}>`,
      email: this.user.email
    });
  }

  cancel() {
    this.$state.go('events');
  }

  saveDraft(form) {
    this.verifyCard = false;
    let eventModel = this.$scope.fm,
        url = '/api/events/' + this.$scope.fm._id;

    if (eventModel.status == 'sent') {
      //TODO differ and save new draft and what was sent to caterer
    }

    if (eventModel && form.$valid) {
      return this.payments.verifyAddress(eventModel.address).then(address => {
        eventModel.address = address;
        this.$http.post(url, eventModel)
          .then(response => {
            this.saved = true;
            //this.$state.go('events');
          })
          .catch(err => {
            this.errors.other = err.message;
          });
      }).catch(result => {
        this.addressValidationError = result.ErrDescription;
      });

    }

  }
}

angular.module('cateringApp')
  .controller('EventsEditController', EventsEditController);

