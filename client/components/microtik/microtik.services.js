'use strict';

var app = angular.module('ctLoginsApp.microtik.services', ['ngResource']);

app.factory('Microtik', ['$http', '$q',

  function($http, $q){

    var login = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      var request = $http({
        method: 'POST',
        url: params.uamip,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: $.param({
          username: params.username,
          password: params.password
        })
      });

      return( request.then( handleSuccess, handleError ) );
    };


    var handleError = function(response, a) {
      return( true );
    };

    var handleSuccess = function(response) {
      return( response.data );
    };

    return {
      login: login
    };

}]);

