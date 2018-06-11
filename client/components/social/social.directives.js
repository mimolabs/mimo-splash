'use strict';

var app = angular.module('ctLoginsApp.social.directives', ['ngResource']);

app.directive('social', ['CT', '$q', '$timeout', '$compile', '$window', 'Client', '$sce', function(CT, $q, $timeout, $compile, $window, Client, $sce) {

  var link = function(scope, element, attrs) {
    function redirect() {
      $window.location.href = scope.redirectUrl;
    }
  };

  var controller = function($scope, $element, $attrs) {

    var auth = {};

    this.$scope = $scope;

    $attrs.$observe('autoLogin', function(val){
      if (val !== '') {
        $scope.attrs = $attrs;
      }
    });

    this.setSocialName = function(name) {
      if ($scope.socialName === undefined || $scope.socialName === '') {
        $scope.socialName = name;
      }
    };

    this.doCtLogin = function(response) {
      formatAuthResponse(response);
      var deferred = $q.defer();
      var params = {
        token: auth.accessToken,
        expires: auth.expires,
        userId: auth.userID,
        memberId: auth.memberId,
        signature: auth.signature,
        signature_version: auth.signature_version,
        signature_order: auth.signature_order,
        newsletter: $scope.newsletter
      };
      CT.login(params).then(function(a) {
        if (a !== undefined && a.type === 'ruckus') {
          loginRuckus(a).then(function(b) {
            deferred.resolve(1);
          });
        }
        else if (a !== undefined && a.type === 'microtik') {
          loginMicrotik(a).then(function(b) {
            deferred.resolve(1);
          });
        } else {
          deferred.resolve(1);
        }
      }, function(err) {
        $scope.loggingIn = undefined;
        deferred.reject(err);
      });
      return deferred.promise;
    };

    /// Refactor into Tony ////

    var loginRuckus = function(auth) {
      var deferred = $q.defer();
      addForm();
      Client.details().then(function(client) {
        var openUrl = 'http://' + client.uamip + ':' + client.uamport +'/login?username='+ auth.username +'&password=' + auth.password;
        $scope.detailFrame =  $sce.trustAsResourceUrl(openUrl);
        $timeout(function() {
          deferred.resolve();
        },3000);
      });
      return deferred.promise;
    };

    var loginMicrotik = function(auth) {
      var deferred = $q.defer();
      addForm();
      Client.details().then(function(client) {
        var openUrl = client.uamip + '?username='+ auth.username +'&password=' + auth.password;
        $scope.detailFrame =  $sce.trustAsResourceUrl(openUrl);
        $timeout(function() {
          deferred.resolve();
        },3000);
      });
      return deferred.promise;
    };

    var addForm = function() {
      document.querySelector('#backup').className = 'hidden';
      var template =
        '<div class=\'small-12 medium-6 medium-centered columns alert-box success\'>Logging you in, please hold tight...</div>' +
        '<iframe style="display: none;" width="0" height="0" ng-src="{{detailFrame}}"></iframe>'+
        '</div>';

      var templateObj = $compile(template)($scope);
      $element.html(templateObj);
    };

    this.autoLogin = function() {
      var deferred = $q.defer();
      $scope.loggingIn = true;
      var timeout = ($attrs.timeout > 0) ? ($attrs.timeout * 1000) : 0;
      $timeout(function() {
        deferred.resolve();
      },timeout);
      return deferred.promise;
    };

    var formatAuthResponse = function(auth) {
      if (auth) {
        $scope.authResponse = auth;
      }
      if ($scope.authResponse.member_id !== undefined) {
        auth.accessToken        = $scope.authResponse.access_token;
        auth.memberId           = $scope.authResponse.member_id;
        auth.signature_order    = $scope.authResponse.signature_order;
        auth.signature          = $scope.authResponse.signature;
        auth.signature_version  = $scope.authResponse.signature_version;
      } else if ($scope.authResponse.userID !== undefined) {
        auth.accessToken = $scope.authResponse.accessToken;
        auth.userID = $scope.authResponse.userID;
        auth.expires = $scope.authResponse.expires;
      } else if ($scope.authResponse.client_id !== undefined) {
        auth.accessToken = $scope.authResponse.access_token;
        auth.clientID = $scope.authResponse.client_id;
      }
    };

    this.compileTemplate = function(msg) {
      document.querySelector('#backup').className = 'hidden';
      var templateObj = $compile('<div>' + msg +'</div>')($scope);
      $element.html(templateObj);
    };
  };

  return {
    scope: {
      loading: '@'
    },
    transclude: true,
    controller: controller,
    link: link,
    template:
      '<div>' +
      '<h2 ng-show=\'loggingIn\'><b>Logging you in, please hold tight...</b></h2>' +
      '<div ng-hide=\'loggingIn\'><h2 ng-if=\'socialName\'>Hey {{ socialName }}, nice to see you again.</h2>'+
      '<div ng-transclude></div></div>' +
      '</div>'
  };

}]);
