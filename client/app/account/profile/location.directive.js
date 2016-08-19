'use strict';

angular.module('cateringApp')
  .directive('location', ($rootScope) => ({
    restrict: 'A',
    link: (scope, element, attrs, $rootScope) => {
      let el = element.get(0),
          defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631)),
          placeSearch, geolocation, circle,
          autocomplete = new google.maps.places.Autocomplete(el);

      /*if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          });
          defaultBounds = circle.getBounds();
        });
      }*/

      autocomplete.addListener('place_changed', () => {
        let place = autocomplete.getPlace(),
            address = '';
        if (place.formatted_address) {
          address = place.formatted_address;
        }

        console.log(place);

        if (scope.vm.user && scope.vm.user.location) {
          scope.vm.user.location = address;
          scope.vm.user.address = getAddress(place);
          console.log('we here in user', scope.vm.user);
        }
        if (scope.fm && scope.fm.location) {
          scope.fm.location = address;
          scope.fm.address = getAddress(place);
        }
        console.log('address', address);
      });

      autocomplete.setBounds(defaultBounds);
    }
}));

function getAddress(place) {
  let formatedComponents = place.formatted_address.split(',').map(item => item.trim());
  let region = getByIndex(formatedComponents, -2).split(' ').map(item => item.trim());
  return {
    Address1: formatedComponents[0],
    Address2: '',
    City: getByIndex(formatedComponents, -3),
    State: getByIndex(region, -2),
    Zip5: getByIndex(region, -1),
    Zip4: '0000'
  }
}

function getByIndex(arr, index) {
  if (index < 0) {
    index = arr.length + index;
  }
  return arr[index];
}
