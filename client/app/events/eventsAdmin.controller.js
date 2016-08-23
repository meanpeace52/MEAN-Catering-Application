'use strict';

class EventsAdminController {
  constructor($http, $scope, $rootScope, socket, Auth, $state, IncludedInPriceService, $interval, $filter, $uibModal, $log, $timeout) {

    var root = this;
    this.errors = {};
    this.submitted = false;
    this.saved = false;
    this.sent = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.socket = socket;
    this.incService = IncludedInPriceService;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isLoggedIn = Auth.isLoggedIn;
    this.user = this.$scope.user = this.getCurrentUser();
    this.$scope.eventActive = null;
    this.$scope.events = [];
    this.$scope.displayed = [];

    this.$scope.selectedEvents = {};
    this.$scope.allEventsAreSelected = false;

    $scope.selectAll = value => this.$scope.events.forEach(event => $scope.selectedEvents[event._id] = value);
    $scope.isSelected = event => selectedEvents[event._id];

    $scope.select = () => {
      let allIsSelected = true;
      for (let k in $scope.selectedEvents) {
        if(!$scope.selectedEvents[k]) {
          allIsSelected = false;
          break;
        }
      }
      $scope.allEventsAreSelected = allIsSelected;
    };
    $scope.selectAll(false);

    $scope.paySelected = () => {
      let selectedEventIds = [];
      for (let k in $scope.selectedEvents) {
        if($scope.selectedEvents[k]) {
          selectedEventIds.push(k);
        }
      }
      let selectedEvents = $scope.events.filter(event => selectedEventIds.includes(event._id));

      if (selectedEvents.length) {
        this.$http.post('/api/payments/pay', {
          items: selectedEvents.map(event => event.offers[0]._id)
      }).then(response => {
        $scope.$emit('eventUpdated');
    });
  }
};

$scope.pay = (offer) => {
  this.$http.post('/api/payments/pay', {
    items: [offer._id]
  }).then(response => {
    $scope.$emit('eventUpdated');
});
};

$scope.open = (offer) => {

  var modalInstance = $uibModal.open({
    animation: true,
    templateUrl: 'adjustPayment.html',
    controller: ($scope, $uibModalInstance) => {

    $scope.totalRefund = angular.copy(offer.invoice);
  $scope.totalRefund.refund = $scope.totalRefund.total;
  $scope.totalRefund.adjustment.client = 0;
  $scope.totalRefund.adjustment.caterer = 0;
  $scope.totalRefund.adjustment.chargeOff = 0;
  $scope.partialRefund = angular.copy(offer.invoice);
  $scope.partialRefund.refund = 0;
  $scope.updatedInvoice = $scope.totalRefund;

  $scope.setAdjustment = (updatedInvoice) => {
    $scope.updatedInvoice = updatedInvoice
  };

  $scope.ok = () => {
    console.log('invoice', root.$scope.eventActive.offers[0].invoice, $scope.updatedInvoice);
    angular.merge(root.$scope.eventActive.offers[0].invoice, $scope.updatedInvoice);

    $http.post('/api/offers/' + root.$scope.eventActive.offers[0]._id, root.$scope.eventActive.offers[0]).then(response => {
      $http.post('/api/events/' + root.$scope.eventActive._id, root.$scope.eventActive).then(response => {
      $uibModalInstance.close();
  })
});
};

$scope.cancel = function () {
  $uibModalInstance.dismiss('cancel');
};
},
size: 'lg'
});

modalInstance.result.then(function () {
  //$scope.selected = selectedItem;
}, function () {
  $log.info('Modal dismissed at: ' + new Date());
});
};

$scope.includedInPrice = this.incService.getIncludedInPrice().then((data)=> {
  $scope.includedInPrice = data;
});

$scope.query = { status: 'confirmed' };

function convertIncludedInPrice(array) {
  let cnt = [];
  _.each($scope.includedInPrice, (item, j) => {
    if (_.indexOf(array, item._id) > -1) {
    cnt.push(item);
  }
});
return cnt;
}

$scope.filter = {
  paid: 'all', //allPaid, allUnpaid
  dateTo: null,
  dateFrom: null
}

$scope.dateOptions = {
  formatYear: 'yy',
  //minDate: new Date(),
  startingDay: 1
};

$scope.popup1 = {
  opened: false
};

$scope.open1 = function() {
  $scope.popup1.opened = true;
};

$scope.popup2 = {
  opened: false
};

$scope.open2 = function() {
  $scope.popup2.opened = true;
};


this.pipe = function(tableState) {
  console.log('pipe');
  $scope.tableState = (angular.isObject(tableState) && tableState ? tableState : $scope.tableState);

  $http.post('/api/events/dataset', $scope.query).then(response => {
    $scope.events = response.data;
  console.log('events', $scope.events.length);
  _.each($scope.events, (event, i) => {
    $scope.events[i].includedInPrice = convertIncludedInPrice(event.includedInPrice);
  if ($scope.events[i].offers.length) {
    $scope.events[i].offers[0].includedInPrice = convertIncludedInPrice(event.offers[0].includedInPrice);
    if (event.offers[0].invoice) {
      $scope.events[i].offers[0].priceWithCounter = event.offers[0].invoice.total;
    } else if (event.offers[0].counter) {
      $scope.events[i].offers[0].priceWithCounter = event.pricePerPerson * event.people - event.offers[0].counter;
    } else {
      $scope.events[i].offers[0].priceWithCounter = event.pricePerPerson * event.people;
    }
  }
})

let filtered = $scope.tableState.search.predicateObject ? $filter('filter')($scope.events, $scope.tableState.search.predicateObject) : $scope.events,
  start = $scope.tableState.pagination.start,
  number = $scope.tableState.pagination.number;

if ($scope.tableState.sort.predicate) {
  filtered = $filter('orderBy')(filtered, $scope.tableState.sort.predicate, $scope.tableState.sort.reverse);
}

$scope.displayed = filtered.slice(start, start + number);
$scope.tableState.pagination.numberOfPages = Math.ceil(filtered.length / number);
if ($scope.eventActive) $scope.setActiveEvent($scope.eventActive);
});
}

$scope.setActiveEvent = function(event) {
  $scope.eventActive = event;

  _.each($scope.events, (item, i) => {
    $scope.events[i].active = false;
  if (item._id == event._id) {
    $scope.events[i].active = true;
  }
});
}

$scope.$watchGroup(['filter.paid', 'filter.dateTo', 'filter.dateFrom'], () => {
  if ($scope.filter.paid === 'all') {
  delete $scope.query.paymentStatus;
} else if ($scope.filter.paid === 'allPaid') {
  $scope.query.paymentStatus = { $in: ['paid', 'hold'] };
} else if ($scope.filter.paid === 'allUnpaid') {
  $scope.query.paymentStatus = { $exists: false };
}

if ($scope.filter.dateTo && !$scope.filter.dateFrom) {
  $scope.query.date = { $lte: $scope.filter.dateTo };
} else if ($scope.filter.dateTo && $scope.filter.dateFrom) {
  $scope.query.date = { $lte: $scope.filter.dateTo, $gte: $scope.filter.dateFrom };
} else if (!$scope.filter.dateTo && $scope.filter.dateFrom) {
  $scope.query.date = { $gte: $scope.filter.dateFrom } ;
} else if (!$scope.filter.dateTo && !$scope.filter.dateFrom) {
  delete $scope.query.date;
}

console.log('query', $scope.query);

this.pipe();
});

var sync = $interval(root.pipe, (1000 * 60));

$scope.$on('eventUpdated', () => {
  root.pipe();
});

$scope.$on('$destroy', function () {
  socket.unsyncUpdates('event');
  socket.unsyncUpdates('offer');
  $interval.cancel(sync);
});
}
}

angular.module('cateringApp')
  .controller('EventsAdminController', EventsAdminController);

