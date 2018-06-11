'use strict';

var app = angular.module('ctLoginsApp.logins.services', ['ngResource']);

app.factory('Login', ['$resource', 'API_END_POINT',

  function($resource, API_END_POINT){

    return $resource(API_END_POINT + '/logins',
      {},
      {
      // initialise: {
      //   cache: true,
      //   method: 'GET',
      //   isArray: false,
      //   params: {
      //     v: 2,
      //     location_id: '2343279843255694423'
      //   }
      // },
      welcome: {
        cache: true,
        method: 'GET',
        isArray: false,
        params: {
          v: 2,
          // location_id: '2343279843255694423',
          welcome: true,
          clientMac: '@clientMac',
          request_uri: '@requestUri'
        }
      }
  });

}]);

