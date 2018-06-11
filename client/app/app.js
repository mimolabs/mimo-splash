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

app.config(function ($routeProvider, $locationProvider, $httpProvider, ENVIRONMENT) {

  $httpProvider.interceptors.push('apInterceptor');

  if (ENVIRONMENT === 'production') {
    console.log('%cHey you! Pleased to meet.', 'font: 3em sans-serif; color: red;');
    console.log('%cFrom time to time, we\'ll need some information from this console. This will help us debug problems you\'re having, we hope it\'s not too much bother. If you need even logs or want your customers to debug things a little easier, you can enable console debugging in your splash page settings. That\'s going turn the volume up to 11.', 'font: 1.4em sans-serif; color: black; line-height: 1.4em;');
    console.log('%cThank you for for helping us build the awesome.', 'font: 1em sans-serif; color: black; line-height: 4em; border-bottom: 1px solid black;');
  }

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
    .when('/shop', {
      templateUrl: 'components/logins/index.html',
      reloadOnSearch: false,
      controller: 'LoginsController'
    })
    .when('/reset', {
      templateUrl: 'components/guests/reset.html',
      reloadOnSearch: false,
      controller: 'LoginsResetGuestController'
    })
    .when('/confirm', {
      templateUrl: 'components/orders/confirm.html',
      reloadOnSearch: false,
      controller: 'LoginsShopController'
    })
    .when('/hello', {
      templateUrl: 'components/logins/hello.html',
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
    .when('/guest/s/:zone', {
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

app.factory('apInterceptor', ['$q', '$location', '$rootScope', '$routeParams', 'DEVICES', 'CTDebugger',
  function($q, $location, $rootScope, $routeParams, DEVICES, CTDebugger) {

    var debug = function() {
      if ($routeParams.debug  === 'true' || window.location.hostname === 'debug.my-wifi.co' || window.location.hostname === 'debug.my-wifi.dev') {
        return true;
      }
    };

    var debugging;
    var debuggingTool = function(err) {
      if ( debug() ) {
        if ( debugging === undefined) {
          CTDebugger.debug();
          debugging = true;
        }
        console.log(err);
      }
    };

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
      debuggingTool(response);
      return $q.reject(response);
    };

    return {
      responseError: responseError,
      response: response,
      request: request
    };
  }
]);

