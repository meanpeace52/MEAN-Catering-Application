'use strict';

class EventsNewController {
  constructor($http, $scope,  socket, Auth, $state, EventsService, FoodTypesService, IncludedInPriceService, ServiceTypesService, PaymentService) {
    let root = this;
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;
    this.verifyCard = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;
    this.payments = PaymentService;

    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.isManager = Auth.isManager;
    this.isCaterer = Auth.isCaterer;
    this.isUser = Auth.isUser;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();

    this.ftService = FoodTypesService;
    this.incService = IncludedInPriceService;
    this.sService = ServiceTypesService;

    this.$scope.fm = {};
    this.$scope.fm.date = this.$scope.date = new Date();
    this.$scope.fm.time = this.$scope.time = new Date();
    this.$scope.fm.people = 1;
    this.$scope.fm.vegetarianMeals = 0;
    this.$scope.fm.pricePerPerson = 0.5;
    this.$scope.fm.selectedCaterers = [];
    this.$scope.selectionOccured = true;

    this.$scope.fm.foodTypes = [];
    this.$scope.foodTypes = [];
    this.$scope.fm.serviceTypes = [];
    this.$scope.serviceTypes = [];
    this.$scope.caterers = [];

    this.$scope.filter = {
      allFt: true,
      allSt: false,
      selectAll: true
    }

    this.getCaterers().then((caterers) => {
      this.$scope.caterers = caterers;
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
      this.toggleAllST();
      this.toggleAllFT();
    })
    .then(() => {
      this.$scope.$watch('filter.selectAll', () => {
        this.toggleAll();
      });
    });

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
      if (!selectedFT.length && !selectedST.length) {
        //this.$scope.caterers[i].showByCat = true;
      } else {
        let intersectFT = _.intersection(item.foodTypes, selectedFT),
          intersectST = _.intersection(item.serviceTypes, selectedST);

        //if (intersectFT.length && intersectST.length) {
        this.$scope.caterers[i].showByCat = !!(intersectFT.length && intersectST.length);

        if (_.indexOf(this.$scope.fm.selectedCaterers, item._id) < 0) {
          this.$scope.caterers[i].showByEdit = false;

        } else {
          this.$scope.caterers[i].showByEdit = true;
        }
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
    /*let selectedFT = this.$scope.fm.foodTypes,
      selectedST = this.$scope.fm.serviceTypes;

    _.each(this.$scope.caterers, (item, i) => {
      let intersectFT = _.intersection(item.foodTypes, selectedFT),
          intersectST = _.intersection(item.serviceTypes, selectedST);
      if (intersectFT.length && intersectST.length) {  //foodtype matches
        if (this.$scope.filter.selectAll) {
          this.$scope.caterers[i].showByEdit = true;
          this.$scope.caterers[i].checked = true;
          this.addToSelected(item._id);
        } else {
          this.$scope.caterers[i].showByEdit = false;
          this.$scope.caterers[i].checked = false;
          this.removeFromSelected(item._id);
        }
      }
    });*/
  }

  /*  checkFT(id, caterer) {
      if (_.indexOf(caterer.foodTypes, id) > -1) {
        return true;
      } else {
        return false;
      }
    }

    verifyUser(data) {
      console.log(12, data);
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
    } */

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
        url = (this.saved ? '/api/events/' + this.$scope.fm._id : '/api/events/new');

      eventModel.showToCaterers = true;
      eventModel.sentTo = eventModel.selectedCaterers;
      eventModel.status = 'sent';
      eventModel.userId = this.user._id;
      eventModel.createDate = new Date();

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

  cancel() {
    this.$state.go('events', { time: 'active' });
  }

  saveDraft(form) {
    this.verifyCard = false;
    let eventModel = this.$scope.fm;

    eventModel.userId = this.user._id;
    eventModel.status = 'draft';

    if (eventModel && form.$valid) {
      //return this.payments.verifyAddress(eventModel.address).then(address => {
        //eventModel.address = address;

        return this.$http.post('/api/events/new', eventModel)
          .then(response => {
            this.saved = true;
            this.$scope.fm._id = response.data._id;
          })
          .catch(err => {
            this.errors.other = err.message;
          })
      //}).catch(result => {
      //  this.addressValidationError = result.ErrDescription;
      //});

    }
  }
}

angular.module('cateringApp')
  .controller('EventsNewController', EventsNewController);



