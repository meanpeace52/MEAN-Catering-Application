'use strict';

class NavbarController {
  //end-non-standard

  //start-non-standard
  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.isManager = Auth.isManager;
    this.isCaterer = Auth.isCaterer;
    this.isUser = Auth.isUser;
    this.getCurrentUser = Auth.getCurrentUser;
  }

}

angular.module('cateringApp')
  .controller('NavbarController', NavbarController);
