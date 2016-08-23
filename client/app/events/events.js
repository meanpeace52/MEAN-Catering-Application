'use strict';

angular.module('cateringApp')
  .config(function($stateProvider) {
    $stateProvider.state('events', {
      url: '/events/:time',
      templateUrl: 'app/events/events.html',
      controller: 'EventsController',
      controllerAs: 'vm',
      authenticate: true
    })
      .state('newEvent', {
        url: '/events/new',
        templateUrl: 'app/events/new.html',
        controller: 'EventsNewController',
        controllerAs: 'vm',
        authenticate: 'user'
      })
      .state('editEvent', {
        url: '/events/:id',
        templateUrl: 'app/events/edit.html',
        controller: 'EventsEditController',
        controllerAs: 'vm',
        authenticate: 'user'
      });
  });
