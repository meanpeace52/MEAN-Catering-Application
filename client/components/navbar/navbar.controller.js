'use strict';

class NavbarController {
  //start-non-standard
  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.isManager = Auth.isManager;
    this.isCaterer = Auth.isCaterer;
    this.isUser = Auth.isUser;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser()
    console.log(this.user);

  }

}

angular.module('cateringApp')
  .controller('NavbarController', NavbarController);
