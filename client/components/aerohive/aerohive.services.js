'use strict';

var app = angular.module('ctLoginsApp.aerohive.services', ['ngResource']);

app.factory('Aerohive', ['$http', '$q',

  function($http, $q){

    var login = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      /// Post username and password to the uam ip which is usuall 1.1.101.1
      /// curl -v -XPOST http://1.1.101.1/reg.php -d "username=simon&password="

      var request = $http({
        method: 'POST',
        url: 'http://' + params.uamip + '/reg.php',
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

