'use strict';

var app = angular.module('ctLoginsApp.xirrus.services', ['ngResource']);

app.factory('Xirrus', ['$http', '$q',

  function($http, $q){

    var login = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      var request = $http({
        method: 'GET',
        url: 'http://' + params.uamip + ':' + params.uamport + '/logon?username=' + params.username + '&response=' + params.response,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        // data: $.param({
        //   username: params.username,
        //   response: params.response
        // })
      });

      return( request.then( handleSuccess, handleError ) );
    };


    var handleError = function() {
      return( true );
    };

    var handleSuccess = function(response) {
      return( response.data );
    };

    return {
      login: login
    };

}]);

