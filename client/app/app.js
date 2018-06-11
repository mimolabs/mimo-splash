'use strict';

var app = angular.module('ctLoginsApp', [
  'ngStorage',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ctLoginsApp.controllers',
  'ctLoginsApp.services',
  'ctLoginsApp.directives',
  'ctLoginsApp.filters',
  'config'
]);

app.config(function ($routeProvider, $locationProvider, $httpProvider) {

  $httpProvider.interceptors.push('apInterceptor');

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.commonXRequestedWith;
  $httpProvider.defaults.headers.common.Accept = 'application/json';
  $httpProvider.defaults.headers.common.ContentType = 'application/json';

  $routeProvider
    .when('/oh', {
      templateUrl: 'components/layouts/oh.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/welcome', {
      templateUrl: 'components/logins/welcome.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/ctx', {
      templateUrl: 'components/logins/index.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/social', {
      templateUrl: 'components/logins/index.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/:splash_id', {
      templateUrl: 'components/logins/index.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/', {
      templateUrl: 'components/logins/index.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});

app.constant('DEVICES', {
  ct: '1',
  aruba: '2',
  meraki: '3',
  ruckus: '4',
  aerohive: '5',
  xirrus: '6',
  vsz: '7',
  microtik: '8',
  cisco: '9',
  unifi: '10',
  cloudtrax: '11',
  preview: '500',
  unknown: '999'
});

app.factory('apInterceptor', ['$q', '$location', '$rootScope', '$routeParams', 'DEVICES',
  function($q, $location, $rootScope, $routeParams, DEVICES) {

    var response = function (response) {
      return response;
    };

    var request = function(config) {
      var setDevice = function() {
        if ($routeParams.preview === 'true') {
          $rootScope.deviceId = DEVICES.preview;
        } else if ($location.path() === '/ctx' && $routeParams.uamip !== undefined) {
          $rootScope.deviceId = DEVICES.cloudtrax;
        } else if ($location.path() === '/social' && $routeParams.requestUri !== undefined) {
          $rootScope.deviceId = DEVICES.cloudtrax;
        } else if ($routeParams.uamip !== undefined && $routeParams.uamport !== undefined && $routeParams.called !== undefined) {
          $rootScope.deviceId = DEVICES.ct;
        } else if ( $routeParams.switch_url !== undefined && $routeParams.wlan !== undefined ) {
          $rootScope.deviceId = DEVICES.cisco;
        } else if ( $routeParams.apname !== undefined && $routeParams.cmd !== undefined ) {
          $rootScope.deviceId = DEVICES.aruba;
        } else if ( $routeParams['Called-Station-Id'] !== undefined && $routeParams['NAS-ID'] !== undefined) {
          $rootScope.deviceId = DEVICES.aerohive;
        } else if ( $routeParams.login_url !== undefined && $routeParams.ap_tags !== undefined) {
          $rootScope.deviceId = DEVICES.meraki;
        } else if ($routeParams.uamip !== undefined && $routeParams.uamport !== undefined && $routeParams.apmac !== undefined) {
          $rootScope.deviceId = DEVICES.xirrus;
        } else if ( $routeParams.sip !== undefined && $routeParams.nbiIP !== undefined) {
          $rootScope.deviceId = DEVICES.vsz;
        } else if ( $routeParams.sip !== undefined && $routeParams.uip !== undefined && $routeParams.nbiIp === undefined) {
          $rootScope.deviceId = DEVICES.ruckus;
        } else if ( $routeParams.mac_client !== undefined && $routeParams.device !== undefined ) {
          $rootScope.deviceId = DEVICES.microtik;
        } else if ( $routeParams.id !== undefined && $routeParams.ap !== undefined ) {
          $rootScope.deviceId = DEVICES.unifi;
        } else if ( $location.path() !== '/confirm' && $location.path() !== '/reset') {
          // $location.path('/hello');
        }
      };

      $rootScope.$on('$routeChangeSuccess', function () {
        if ($rootScope.deviceId === undefined) {
          setDevice();
        }
      });
      return config;
    };

    var responseError = function(response) {
      return $q.reject(response);
    };

    return {
      responseError: responseError,
      response: response,
      request: request
    };
  }
]);

