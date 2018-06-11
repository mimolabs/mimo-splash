'use strict';

var app = angular.module('ctLoginsApp.cisco.services', ['ngResource']);

app.factory('Cisco', ['$http', '$q',

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
          err_flag: 0,
          err_msg: null,
          info_flag: 0,
          info_msg: null,
          redirect_url: null,
          username: params.username,
          password: params.password,
          buttonClicked: 4
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

