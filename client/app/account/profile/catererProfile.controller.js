'use strict';

class CatererProfileController {
  constructor(Auth, $state, $http, FoodTypesService, $scope, FileUploader) {
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.ftService = FoodTypesService;

    console.log(this.user, FileUploader)

    this.$scope.FileUploader = new FileUploader();

    this.$scope.faOptions = {
      removeAfterUpload: true,
      url: '/upload',
      queueLimit: 1,
      autoUpload: false
    }

    this.$scope.foodTypes = this.ftService.getFoodTypes().then((data)=> {
      this.$scope.foodTypes = data;
    });

    this.$scope.ft = {};
  }

  addFoodType() {
    let query = {
      name: this.$scope.ft.newFoodType,
      approved: false,
      custom: true,
      user: this.user._id
    }
    this.ftService.addFoodType(query).then((data) => {
      this.$scope.foodTypes.push(data);
    });
  }

  checkRights(type) {
    if (type.custom && type.user == this.user._id) {
      return true;
    } else {
      return false;
    }
  }

  deleteFoodType(type) {
    if (this.checkRights(type)) {
      this.$scope.foodTypes.splice(this.$scope.foodTypes.indexOf(type), 1);
      this.ftService.deleteFoodType(type._id);
    }
  }

  save() {
    let userModel = this.user,
      url = '/api/users/' + this.user._id;

    console.log(userModel);

    if (userModel) {
      this.$http.post(url, userModel)
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
  .controller('CatererProfileController', CatererProfileController);
