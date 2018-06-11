'use strict';

describe('logins init', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      compile,
      routeParams,
      cookies,
      ctFactory,
      orderFactory,
      loginFactory;

  beforeEach(module('ctLoginsApp', function($provide) {
    ctFactory = {
      guestLogin: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      guestCreate: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      guestUpdatePassword: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    $provide.value("CT", ctFactory);
  }));

  describe('auth login', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies ) {
      cookies = $cookies;
      compile = $compile;
      routeParams = $routeParams;
      routeParams.token = 123123;
      location = $location;
      $scope = $rootScope;
      q = $q;
      $scope.guest = {};
      $scope.state = { status: 'loading' }
      element = angular.element('<guest-reset state="state"></guest-reset>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should display a form the user to login and reset passy", function() {
      spyOn(ctFactory, 'guestUpdatePassword').andCallThrough()

      var password = 'salsdkjfcom';
      var token = '123456';

      var cont = element.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(password);
      $scope.$digest()

      expect(element.isolateScope().guest.password).toBe(password);

      element.isolateScope().submit(element.isolateScope().guest)
      $scope.$digest()
      expect(element.isolateScope().loading).toBe(true);

      deferred.resolve()
      $scope.$digest()
      expect(element.isolateScope().reset).toBe(true);
      expect(element.isolateScope().loading).toBe(undefined);
    })

    it("should display a form the user to login and fail", function() {
      spyOn(ctFactory, 'guestUpdatePassword').andCallThrough()

      // var auth = { guestId: '123' };
      var password = 'salsdkjfcom';
      var token = '123456';

      var cont = element.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(password);
      $scope.$digest()

      expect(element.isolateScope().guest.password).toBe(password);

      element.isolateScope().submit(element.isolateScope().guest)
      $scope.$digest()
      expect(element.isolateScope().state.status).toBe('loading');

      deferred.reject(true)
      $scope.$digest()
      expect(element.isolateScope().reset).toBe(undefined);
      expect(element.isolateScope().loading).toBe(undefined);
      expect(element.isolateScope().errors).toBe(true);
    })

  });

});

