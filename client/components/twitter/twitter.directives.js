'use strict';

var app = angular.module('ctLoginsApp.twitter.directives', ['ngResource']);

app.directive('twitter', ['$window', '$compile', '$q', '$rootScope', '$localStorage', 'Client', function($window, $compile, $q, $rootScope, $localStorage, Client) {

  var link = function(scope,element,attrs,controller) {

    function compileTemplate(msg) {
      var templateObj = $compile('<div>' + msg +'</div>')(scope);
      element.html(templateObj);
    }

    var msg =
      '<div>' +
      '<a href=\'\' ng-click=\'login()\' class=\'social twitter\' >Continue with Twitter<span ng-if=\'processing\'><i class="fa fa-spinner fa-pulse"></i></span></a>'+
      '</div>';
    compileTemplate(msg);

    scope.login = function() {
      Client.details().then(function(client) {
        var host = window.location.host;
        var params = JSON.stringify(client);
        window.location = '/auth/twitter?state=' + params;
      });
    };
  };

  return {
    link: link,
    scope: {
      appId: '@',
    },
    template: '<div></div>',
    require: '^social'
  };

}]);
