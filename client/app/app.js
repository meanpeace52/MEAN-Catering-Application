'use strict';

angular.module('cateringApp', ['cateringApp.auth', 'cateringApp.admin', 'cateringApp.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap',
    'validation.match', "checklist-model", "rzModule", "angularFileUpload", 'smart-table', 'angularPayments',
    'ngAnimate', 'ui.comments.directive', 'angular-click-outside', 'stripe.checkout', 'stripe'
  ])
  .config(function($urlRouterProvider, $locationProvider, commentsConfigProvider, StripeCheckoutProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
    commentsConfigProvider.set({
      containerTemplate: 'assets/comments/template/comments/comments.html',
      commentTemplate: 'assets/comments/template/comments/comment.html',
      commentController: 'OfferCommentController'
    });

    StripeCheckoutProvider.defaults({
      key: "pk_test_0EFB2Y1WvIYGIIUsAQJ42DVD"
    });

    Stripe.setPublishableKey('pk_test_0EFB2Y1WvIYGIIUsAQJ42DVD');
  });
