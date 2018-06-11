'use strict';

var app = angular.module('ctLoginsApp.linkedin.directives', ['ngResource']);

app.directive('linkedin', ['$window', '$compile', '$q', '$rootScope', '$timeout', '$interval', 'CT', function($window, $compile, $q, $rootScope, $timeout, $interval, CT) {

  var link = function(scope,element,attrs,controller) {

    var auth, checkLi;

    CT.status().then(function(msg) {
      console.log('Tony says: ', msg);
    });

    var handleUser = function() {
      fetchUser().then(function(user) {
        controller.setSocialName(user);
        scope.backup = true;
        auth = ($.cookie('linkedin_oauth_' + attrs.liApiKey));
        var msg;
        if (controller.$scope.attrs.autoLogin === 'true' || scope.newUser ) {
          controller.autoLogin().then(scope.ctLogin);
        } else {
          msg =
            '<div>' +
            '<a href=\'\' ng-click=\'ctLogin()\' class=\'social linkedin\' >Linkedin <span ng-if=\'processing\'><i class="fa fa-spinner fa-pulse"></i></span></a>'+
            '</div>';
          compileTemplate(msg);
        }
      });
    };

    scope.ctLogin = function() {
      scope.processing = true;
      controller.$scope.authResponse = JSON.parse($.cookie('linkedin_oauth_' + attrs.liApiKey));
      controller.doCtLogin().then(function(a) {
        loginHandler();
      }, function(err) {
        $rootScope.banneralert = 'banner-alert alert-box alert';
        $rootScope.error = err.msg;
        console.log(err.res);
        scope.processing = undefined;
      });
    };

    function loginHandler () {
      redirect();
    }

    function redirect() {
      var url = controller.$scope.attrs.ctSuccessUrl || 'https://google.com';
      $window.location.href = url;
    }

    var fetchUser = function() {
      var deferred = $q.defer();
      IN.API.Profile('me')
        .fields('id','first-name','last-name','location','industry','headline','picture-urls::(original)','email-address')
        .result(function(data){
          deferred.resolve(data.values[0].firstName);
        })
        .error(function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    };

    function compileTemplate(msg) {
      var templateObj = $compile('<div>' + msg +'</div>')(scope);
      element.html(templateObj);
    }

    function onLinkedInAuth() {
      if (IN.User !== undefined) {
        if (IN.User.isAuthorized() === true) {
          scope.authorise();
        } else {
          var msg =
            '<p><a href=\'\' ng-click=\'authoriseNewUser()\' class=\'social linkedin\'>LinkedIn</a></p>';
          compileTemplate(msg);
        }
        scope.liLoaded = true;
      }
    }

    scope.authoriseNewUser = function() {
      scope.newUser = true;
      scope.authorise();
    };

    scope.authorise = function() {
      IN.User.authorize(function() {
        handleUser();
      });
    };

    var authorise = function() {
      checkLi = $interval(onLinkedInAuth, 100, 50);
    };

    scope.$watch('liLoaded', function(value) {
      if (value !== undefined) {
        $interval.cancel(checkLi);
      }
    });

    var initialise = function() {
      var def = $q.defer();
      $.getScript('https://platform.linkedin.com/in.js?async=true', function success() {
        IN.init({
          api_key: attrs.liApiKey,
          authorize: true,
          onLoad: authorise(),
          credentials_cookie: true
        });
        def.resolve();
      });

      return def.promise;
    };

    initialise();
  };

  return {
    link: link,
    scope: {
      liApiKey: '@',
    },
    require: '^social'
  };

}]);

