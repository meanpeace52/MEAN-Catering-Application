'use strict';

class CatererProfileController {
  constructor(Auth, $cookies, $state, $http, FoodTypesService, ServiceTypesService, $scope, FileUploader, $rootScope, $timeout, PaymentService) {
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$cookies = $cookies;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.getCurrentUser();
    this.ftService = FoodTypesService;
    this.payments = PaymentService;

    let csrf_token = $cookies.get('XSRF-TOKEN'),
        root = this,
        reader = new FileReader();

    $scope.uploadButtonReady = false;
    $scope.uploadButtonShow = false;

    reader.onload = function(event) {
      root.user.logo = reader.result;
      $scope.uploadButtonReady = true;
    }

    var uploader = this.$scope.uploader = new FileUploader({
      queueLimit: 1,
      autoUpload: false,
      url: '/api/upload',
      headers: {
        'X-CSRF-TOKEN': csrf_token
      },
      formData: {
        userId: this.user._id
      },
      removeAfterUpload: true,
      onAfterAddingFile: function(item) {
        reader.readAsDataURL(item._file);
        $scope.uploadButtonShow = true;
        //item.upload();
      }
    });

    // FILTERS

    uploader.filters.push({
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    this.sService = ServiceTypesService;
    this.$scope.serviceTypes = this.sService.getServiceTypes().then((data)=> {
      this.$scope.serviceTypes = data;
    });

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

  saveImage() {
    let url = '/api/users/' + this.user._id;
    this.$http.post(url, {logo: this.user.logo})
      .then(response => {
      this.$scope.uploadButtonShow = false;
      this.$rootScope.$broadcast('imageLoaded');
    })
    .catch(err => {
        this.errors.other = err.message;
    });
  }

  changePassword(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
        this.message = 'Password successfully changed.';
    })
    .catch(() => {
        form.password.$setValidity('mongoose', false);
        this.errors.other = 'Incorrect password';
        this.message = '';
      });
    }
  }

  save(form) {
    let userModel = this.user,
      url = '/api/users/' + this.user._id;

    if (userModel.logo) {
      delete userModel.logo;
    }

    console.log(form);

    if (userModel) {
      this.payments.verifyAddress(userModel.address).then(address => {
        userModel.address = address;
        this.$http.post(url, userModel)
          .then(response => {
            let root = this;
            this.saved = true;
            this.$timeout(function() {
              root.saved = false;
            }, 3000);
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
  .controller('CatererProfileController', CatererProfileController);
