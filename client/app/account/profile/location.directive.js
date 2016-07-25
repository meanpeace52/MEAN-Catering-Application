'use strict';

angular.module('cateringApp')
  .directive('location', ($rootScope) => ({
    restrict: 'A',
    link: (scope, element, attrs, $rootScope) => {
      let el = element.get(0),
          defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631)),
          placeSearch, geolocation, circle,
          autocomplete = new google.maps.places.Autocomplete(el);

      if (navigator.geolocation) {
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
      }

      autocomplete.addListener('place_changed', () => {
        let place = autocomplete.getPlace(),
            address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || ''),
            (place.address_components[3] && place.address_components[3].short_name || ''),
            (place.address_components[4] && place.address_components[4].short_name || ''),
            (place.address_components[5] && place.address_components[5].short_name || ''),
            (place.address_components[6] && place.address_components[6].short_name || '')
          ].join(' ');
        }
        if (scope.vm.user && scope.vm.user.location) {
          scope.vm.user.location = address;
        }
        if (scope.fm && scope.fm.location) {
          scope.fm.location = address;
        }
        console.log('address', address);
      });

      autocomplete.setBounds(defaultBounds);
    }
}));
