'use strict';

var app = angular.module('ctLoginsApp.ruckus.services', ['ngResource']);

app.factory('Ruckus', ['$http', '$q',

  function($http, $q){

    var login = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      var request = $http({
        method: 'GET',
        dataType: 'jsonp',
        url: 'http://' + params.uamip + ':' + params.uamport + '/login?',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        params: {
          username: params.username,
          password: params.password
        }
      });

      return( request.then( handleSuccess, handleError ) );
    };


    var handleError = function(err) {
      return( true );
    };

    var handleSuccess = function(response) {
      return( response.data );
    };

    return {
      login: login
    };

}]);

