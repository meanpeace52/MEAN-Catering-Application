'use strict';

class DwollaController {

  constructor(authCode, $http, $state, Auth, PaymentService) {
    let user = Auth.getCurrentUser();

    if (user.payableAccount) {
      $state.go('events');
    } else {
      PaymentService.dwollaAuth(authCode).then(response => {
        if (response) {
          $http.post(`/api/users/${user._id}`, {
            payableAccount: {
              id: response.account_id,
              links: response._links
            }
          })
            .then(res => {
              let user = res.data;
              if (user.payableAccount) {
                $state.go('events');
              }
            })
            .catch(() => $state.go('dwolla'))
        }
      });
    }//

  }

}

angular.module('cateringApp')
  .controller('DwollaController', DwollaController);
