'use strict';

(function() {

  class AdminController {
    constructor(User, $scope, FoodTypesService, IncludedInPriceService) {
      // Use the User $resource to fetch all users
      this.users = User.query();
      this.ftService = FoodTypesService;
      this.foodTypes = this.ftService.getFoodTypes().then((data)=> {
        this.foodTypes = data;
      });

      this.incService = IncludedInPriceService;
      this.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
        this.includedInPrice = data;
      });
      this.$scope = $scope;
      this.$scope.ut = {};
    }

    delete(user) {
      user.$remove();
      this.users.splice(this.users.indexOf(user), 1);
    }

    approveFoodType(type) {
      this.ftService.approveFoodType(type._id).then((data) => {
        _.each(this.foodTypes, (item, i) => {
          if (item._id == type._id) {
            this.foodTypes[i].approved = true;
          }
        });
      });
    }

    editFoodType(type) {
      this.ftService.editFoodType(type);
    }

    addFoodType() {
      let query = {
        name: this.$scope.ft.newFoodType,
        approved: false
      }
      this.ftService.addFoodType(query).then((data) => {
        this.foodTypes.push(data);
      });
    }

    deleteFoodType(type) {
      this.foodTypes.splice(this.foodTypes.indexOf(type), 1);
      this.ftService.deleteFoodType(type._id);
    }

    deleteIncludedInPrice(ut) {
      this.includedInPrice.splice(this.includedInPrice.indexOf(ut), 1);
      this.incService.deleteIncludedInPrice(ut._id);
    }

    editIncludedInPrice(ut) {
      this.incService.editIncludedInPrice(ut);
    }

    addIncludedInPrice() {
      let query = {
        name: this.$scope.ut.newUt,
        approved: false
      }
      this.incService.addIncludedInPrice(query).then((data) => {
        this.includedInPrice.push(data);
      });
    }

  }

  angular.module('cateringApp.admin')
    .controller('AdminController', AdminController);
})();
