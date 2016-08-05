'use strict';

class OfferCommentsController {
  constructor($http, $scope, $rootScope, socket, Auth, $cookies, CommentsService) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$cookies = $cookies;
    this.socket = socket;

    this.isLoggedIn = Auth.isLoggedIn;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();  //author

    this.CS = CommentsService;
    this.$scope.newComment = '';

    $scope.$watch('offer', () => {
      this.CS.getComments($scope.offer._id).then((res) => {
        $scope.comments = res;
      });
    });

    /*this.$scope.comments = [
      {
        _id: '1l1',
        name: '@caitp',
        date: new Date(),
        profileUrl: 'https://github.com/caitp',
        text: 'UI-Comments is designed to simplify the process of creating comment systems similar to Reddit, Imgur or Discuss in AngularJS.',
        children: [{
          parentId: '1l1',
          _id: '2l2',
          name: '@bizarro-caitp',
          date: new Date(),
          profileUrl: 'https://github.com/bizarro-caitp',
          text: 'We support nested comments, in a very simple fashion. It\'s great!',
          children: [{
            parentId: '2l2',
            _id: '3l3',
            name: '@caitp',
            date: new Date(),
            profileUrl: 'https://github.com/caitp',
            text: 'These nested comments can descend arbitrarily deep, into many levels. This can be used to reflect a long and detailed conversation about typical folly which occurs in comments',
            children: [{
              parentId: '3l3',
              _id: '4l4',
              name: '@bizarro-caitp',
              date: new Date(),
              profileUrl: 'https://github.com/bizarro-caitp',
              text: 'Having deep conversations on the internet can be used to drive and derive data about important topics, from marketing demographic information to political affiliation and even sexual orientation if you care to find out about that. Isn\'t that exciting?'
            }]
          },{
            parentId: '1l1',
            _id: '5l3',
            name: '@bizarro-caitp',
            date: new Date(),
            profileUrl: 'https://github.com/bizarro-caitp',
            text: 'Is it REALLY all that wonderful? People tend to populate comments with innane nonsense that ought to get them hellbanned!',
            children: [{
              parentId: '5l3',
              _id: '6l4',
              name: '@caitp',
              date: new Date(),
              profileUrl: 'https://github.com/caitp',
              text: 'Oh whatever lady, whatever'
            }]
          }]
        }]
      }, {
        parentId: '1l1',
        _id: '7l1',
        name: '@caitp',
        date: new Date(),
        profileUrl: 'https://github.com/caitp',
        text: 'We can have multiple threads of comments at a given moment...',
      }, {
        parentId: '1l1',
        _id: '8l1',
        name: '@bizarro-caitp',
        date: new Date(),
        profileUrl: 'https://github.com/bizarro-caitp',
        text: 'We can do other fancy things too, maybe...',
        children: [{
          parentId: '8l1',
          _id: '9l2',
          name: '@caitp',
          date: new Date(),
          profileUrl: 'https://github.com/caitp',
          text: '...other fancy things, you say?',
        }, {
          parentId: '1l1',
          _id: '10l1',
          name: '@caitp',
          date: new Date(),
          profileUrl: 'https://github.com/caitp',
          text: 'suddenly I\'m all curious, what else can we do...',
          children: [{
            parentId: '10l1',
            _id: '11l2',
            name: '@bizarro-caitp',
            date: new Date(),
            profileUrl: 'https://github.com/bizarro-caitp',
            text: 'Oh, you\'ll see...',
          }]
        }]
      }] */

    /*this.deepSearch(function(item, array) {
      item.collapsed = false;
      item.toggled = true;
      item.new = '';
    });*/

    //comment: {
    //  _id,
    //  date,
    //  userId,
    //  offerId //thread
    //  parentId,
    //  name,
    //  text,
    //  profileUrl,
    //  children
    //}
  }

  deepSearch(todo) {
    _.each(this.$scope.comments, (level1) => {
      todo(level1, this.$scope.comments);
      if (level1.children) {
        _.each(level1.children, (level2) => {
          todo(level2, level1.children);
          if (level2.children) {
            _.each(level2.children, (level3) => {
              todo(level3, level2.children);
              if (level3.children) {
                _.each(level3.children, (level4) => {
                  todo(level4, level3.children);
                  if (level4.children) {
                    _.each(level4.children, (level5) => {
                      todo(level5, level4.children);
                    })
                  }
                })
              }
            })
          }
        })
      }
    });
  }

  create() {
    let newComment = {};
    newComment.parentId = '';
    newComment.date = new Date();
    newComment.userId = this.user._id;
    newComment.name = (this.user.role == 'caterer' ? this.user.companyName : (this.user.firstname + ' ' + this.user.lastname));
    if (this.user.role == 'caterer') {
      newComment.profileUrl = '/caterers/' + this.user._id;
    }
    newComment.offerId = this.$scope.offer._id;
    newComment.text = this.$scope.newComment;
    newComment.children = [];
    this.CS.addComment(newComment).then((comment) => {
      //comment.collapsed = false;
      //comment.toggled = true;
      //comment.new = '';
      this.$scope.newComment = '';
      this.$scope.comments.push(comment);
    });
  }
}


class OfferCommentController {
  constructor($http, $scope, $rootScope, socket, Auth, $cookies, CommentsService) {
    let root = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$cookies = $cookies;
    this.socket = socket;

    this.isLoggedIn = Auth.isLoggedIn;
    this.getCurrentUser = Auth.getCurrentUser;
    this.user = this.getCurrentUser();  //author

    this.CS = CommentsService;

    $scope.toggleFrom = function(comment) {
      if (comment.toggled) comment.toggled = false;
      else comment.toggled = true;
    }

    $scope.collapse = function(comment) {
      if (comment.collapsed) comment.collapsed = false;
      else comment.collapsed = true;
    }

    /*$scope.add = function(comment) {
      let newComment = {};
      newComment.parentId = comment._id;
      newComment.date = new Date();
      newComment.userId = root.user._id;
      newComment.name = (root.user.role == 'caterer' ? root.user.companyName : (root.user.firstname + ' ' + root.user.lastname));
      if (root.user.role == 'caterer') {
        newComment.profileUrl = '/caterers/' + root.user._id;
      }
      newComment.text = comment.new;
      CommentsService.addChildComment(newComment).then((data) => {
        if (comment.children) comment.children.push(data);
        else comment.children = [data];
        comment.collapsed = false;
      });
    }*/
  }
}


angular.module('cateringApp')
  .controller('OfferCommentsController', OfferCommentsController)
  .controller('OfferCommentController', OfferCommentController);

