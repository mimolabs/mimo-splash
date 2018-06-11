'use strict';

var app = angular.module('ctLoginsApp.aruba.services', ['ngResource']);

app.factory('Aruba', ['$http', '$q',

  function($http, $q){

    var login = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      var request = $http({
        method: 'POST',
        url: 'https://' + params.uamip + '/cgi-bin/login',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: $.param({
          cmd: 'authenticate',
          mac: params.clientMac,
          user: params.username,
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

