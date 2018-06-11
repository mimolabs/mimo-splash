'use strict';

var app = angular.module('ctLoginsApp.main.directives', []);

app.factory('onlineStatus', ['$window', '$rootScope', function ($window, $rootScope) {

    var onlineStatus = {};

    onlineStatus.onLine = $window.navigator.onLine;

    onlineStatus.isOnline = function() {
        return onlineStatus.onLine;
    };

    $window.addEventListener('online', function () {
        onlineStatus.onLine = true;
        $rootScope.$digest();
    }, true);

    $window.addEventListener('offline', function () {
        onlineStatus.onLine = false;
        $rootScope.$digest();
    }, true);

    return onlineStatus;
}]);


app.directive('onlineStatus', ['onlineStatus', '$window', function(onlineStatus, $window) {

  var link = function(scope,element,attrs) {
    scope.onlineStatus = onlineStatus;
    scope.$watch('onlineStatus.isOnline()', function(online) {
      scope.online_status_string = online ? 'online' : 'offline';
      if (scope.online_status_string === 'offline') {
      } else if (scope.online_status_string === 'online' ){
        $window.location.href = 'http://polkaspots.com/?ref=logins';
      }
    });
  };

  return {
    link: link
  };

}]);
