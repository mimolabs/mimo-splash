'use strict';

var app = angular.module('ctLoginsApp.orders.services', ['ngResource']);

app.factory('Order', ['$resource', 'API_END_POINT',

  function($resource, API_END_POINT){

    return $resource(API_END_POINT + '/orders/:id',
      {},
      {
      create: {
        method: 'POST',
        isArray: false,
        params: {
          cart_id: '@cart_id',
          return_url: '@return_url',
          clientMac: '@clientMac'
        }
      },
      update: {
        method: 'PATCH',
        isArray: false,
        params: {
          cart_id: '@cart_id',
          id: '@id'
        }
      },
      finalise: {
        method: 'PATCH',
        isArray: false,
        params: {
          cart_id: '@cart_id',
          id: '@id',
          guest_id: '@guest_id',
          email: '@email'
        }
      }
  });


}]);

