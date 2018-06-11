'use strict';

var app = angular.module('ctLoginsApp.facebook.directives', ['ngResource']);

app.directive('fbFinished', ['$window', '$compile', '$q', '$routeParams', '$localStorage', 'CT', function($window, $compile, $q, $routeParams, $localStorage, CT) {

  var link = function(scope,el,attrs,controller) {
    var client;
    var searchParams = $localStorage.searchParams;
    if (searchParams) {
      client = JSON.parse($localStorage.searchParams);
    }

    var init = function() {
      var deferred = $q.defer();
      CT.init({request_uri: client.requestUri, clientMac: client.clientMac, apMac: client.apMac, tags: client.apTags}).then(function(results) {
        deferred.resolve();
      }, function() {

      });
      return deferred.promise;
    };

    var fetch = function() {

    };

    var authResponse = {};
    authResponse.access_token = $routeParams.code;
    init().then(controller.doCtLogin(authResponse));
  };

  return {
    link: link,
    require: '^social'
  };

}]);


app.directive('facebook', ['$window', '$compile', '$q', '$rootScope', '$localStorage', 'Client', function($window, $compile, $q, $rootScope, $localStorage, Client) {

  var link = function(scope,element,attrs,controller) {

    var user, authResponse, appId;
    var mimo = ['s.oh-mimo.com'];

    function errorMsg(msg) {
      $rootScope.banneralert = 'banner-alert alert-box alert';
      $rootScope.error = msg;
    }

    function compileTemplate(msg) {
      var templateObj = $compile('<div>' + msg +'</div>')(scope);
      element.html(templateObj);
    }

    function statusChangeCallback(response) {
      if (attrs.appId !== '' && attrs.appId !== null) {
        appId = attrs.appId;
      }

      if (attrs.appId === '' || attrs.appId === null) {
        appId = '468282836525087'; // ct
      }

      if (mimo.indexOf(window.location.hostname) >= 0) {
        appId = '177303432997780';
      }

      console.log('Using APP ID:', appId);

      var msg =
        '<div>' +
        '<a href=\'\' ng-click=\'login()\' class=\'social facebook\' >Continue with Facebook<span ng-if=\'processing\'><i class="fa fa-spinner fa-pulse"></i></span></a>'+
        '</div>';
        compileTemplate(msg);
    }

    scope.login = function() {
      Client.details().then(function(client) {
        var host = window.location.host;
        var params = window.btoa(angular.toJson(client));
        window.location = 'https://www.facebook.com/v2.12/dialog/oauth?display=page&client_id=' + appId + '&redirect_uri=http://' + host + '/auth/facebook&action&oauth_facebook_callback&scope=email&state=' + params;
      });
    };

    statusChangeCallback();

  };

  return {
    link: link,
    scope: {
      appId: '@',
      fbCheckin: '@',
      fbTimeout: '@',
      fbPageId: '@',
      fbPageRedirect: '@',
      backup: '=',
      fbMsg: '@'
    },
    template: '<div></div>',
    require: '^social'
  };

}]);
