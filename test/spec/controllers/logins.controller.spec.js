'use strict';

describe('Controller: LoginsController', function () {

  beforeEach(module('ctLoginsApp'));

  var LoginsController,
      LoginsShopController,
      loginFactory,
      localStorage,
      clientFactory,
      ctFactory,
      orderFactory,
      cookies,
      routeParams,
      $location,
      $httpBackend,
      deferred,
      scope,
      rootScope,
      q,
      store = {};


  beforeEach(module('ctLoginsApp', function($provide) {
    orderFactory = {
      update: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    ctFactory = {
      init: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      guestUpdatePassword: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    },
    clientFactory = {
      details: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    },
    loginFactory = {
      initialise: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    },
    $provide.value("Login", loginFactory);
    $provide.value("Client", clientFactory);
    $provide.value("Order", orderFactory);
    $provide.value("CT", ctFactory);
  }));

  describe('Controller: LoginsController', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q, $injector) {

      $httpBackend = _$httpBackend_;
      $httpBackend = $injector.get('$httpBackend');

      $httpBackend.when('GET', 'http://127.0.0.1:8080/api/v1/logins?apMac=456&clientMac=789&location_id=2343279843255694423&request_uri=123&v=2')
      .respond(200, {});

      q = $q;
      rootScope = $rootScope;
      scope = $rootScope.$new();
      $location = _$location_;
      scope.deviceId = '3';

      LoginsController = $controller('LoginsController', {
        $scope: scope,
        $rootScope: rootScope
      });
    }));

    /// COME AND TEST THIS LATER TODAY ///

    xit('should connect to CT and successfully init the logins', function () {
      var eventData = 123
      var results = { splash: { custom_url: 'http://polkaspots', custom_css: '123'}, form: { body: {} }, archived: false, redirects: {show_welcome: true} };
      var client = { requestUri: 123, apMac: 456, clientMac: 789 }

      spyOn(loginFactory, 'initialise').andCallThrough();
      spyOn(clientFactory, 'details').andCallThrough();
      expect(scope.loading).toBe(true);
      expect(rootScope.bodylayout).toBe('login-layout');
      expect(rootScope.hidden).toBe(true);


      rootScope.$broadcast('$routeChangeSuccess', eventData);

      // resolve the client.details //
      deferred.resolve(client)
      scope.$apply()

      deferred.resolve(client)
      scope.$apply()

      // resolve the login services
      deferred.resolve(results)
      scope.$apply()

      expect(scope.custom_url).toBe('http://polkaspots');
      expect(scope.custom_css).toBe('123');
      expect(scope.splash).toBe(results.splash);
      expect(scope.form).toBe(results.form.body);
      expect(scope.redirects).toBe(results.redirects);

    });

    xit('should connect to CT and fail to init the logins ARCHIVED', function () {
      var eventData = 123
      var results = { splash: { custom_url: 'http://polkaspots', custom_css: '123'}, form: {}, archived: true };
      var client = { requestUri: 123, apMac: 456, clientMac: 789 }

      spyOn(loginFactory, 'initialise').andCallThrough();
      expect(scope.loading).toBe(true);
      expect(rootScope.bodylayout).toBe('login-layout');
      expect(rootScope.hidden).toBe(true);

      rootScope.$broadcast('$routeChangeSuccess', eventData);

      // resolve the client.details //
      deferred.resolve(client)
      scope.$apply()

      // resolve the login services
      deferred.resolve(results)
      scope.$apply()

      expect(scope.error).toBe('<p>This splash page has been archived and you can <b>no longer login</b>.</p><p>If you think this is an error, please contact the owner of the Wi-Fi Network</p>');
      expect($location.path()).toBe('/oh');
      expect(scope.loading).toBe(undefined);
      expect(rootScope.bodylayout).toBe('login-error');
      expect(rootScope.hidden).toBe(undefined);

    });

    xit('should connect to CT but get an error', function () {
      var eventData = 123
      var results = { error: "over limit" };
      var client = { requestUri: 123, apMac: 456, clientMac: 789 }

      spyOn(loginFactory, 'initialise').andCallThrough();
      expect(scope.loading).toBe(true);
      expect(rootScope.bodylayout).toBe('login-layout');
      expect(rootScope.hidden).toBe(true);

      rootScope.$broadcast('$routeChangeSuccess', eventData);

      // resolve the client.details //
      deferred.resolve(client)
      scope.$apply()

      // resolve the login services
      deferred.resolve(results)
      scope.$apply()

      expect(scope.error).toBe('<p>over limit</p>');
    });

    it('should FAIL to connect to CT', function () {

    });

    it('should redirect to / unless its already root', function () {

    });

  });

  describe('Controller: LoginsShopsController', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q, $injector, $routeParams, $localStorage, $cookies) {

      cookies = $cookies;
      cookies.put('cartId', 123123)
      q = $q;
      localStorage = $localStorage;
      localStorage.searchParams = JSON.stringify({a: 123});
      routeParams = $routeParams;
      routeParams.orderId = 123;
      routeParams.token = 456;
      routeParams.PayerID = 'J8NQ8SXTCFVZS';

      rootScope = $rootScope;
      scope = $rootScope.$new();
      scope.cart = { cart: { cart_id: 123 } }
      $location = _$location_;
      scope.deviceId = '3';

      LoginsShopController = $controller('LoginsShopController', {
        $scope: scope,
        $rootScope: rootScope
      });
    }));


    it('should send the order number off to CT', function () {

      spyOn(orderFactory, 'update').andCallThrough();
      var order = { _id: 123, state: 'pending' };
      var results = { splash: { custom_url: 123 } };
      var eventData = 123;
      expect(scope.state.status).toBe('loading');
      expect(scope.state.order).toBe('loading');
      expect(scope.state.hidden).toBe(true);

      deferred.resolve(results);
      scope.$apply();

      deferred.resolve(order);
      scope.$apply();

      expect(scope.state.status).toBe(undefined);
      expect(scope.state.order).toBe(undefined);
      expect(scope.state.hidden).toBe(undefined);
      expect(scope.order.state).toBe('pending')
    });

    // // It now fails cos of the redirect //
    // xit('should send the order number off to CT and fail', function () {
    //   spyOn(orderFactory, 'update').andCallThrough();
    //   spyOn(ctFactory, 'init').andCallThrough();
    //   var order = { _id: 123, state: 'pending' };
    //   var results = { splash: { custom_url: 123 } };

    //   deferred.resolve(results);
    //   scope.$apply();

    //   deferred.reject(123)
    //   scope.$apply()

    //   expect(scope.order.errors).toBe(123)
    // });

  });

  describe('Controller: LoginsShopsController', function () {

    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, _$location_, $q, $injector, $routeParams, $localStorage, $cookies) {

      cookies = $cookies;
      cookies.put('cartId', 123123)
      q = $q;
      localStorage = $localStorage;
      localStorage.searchParams = JSON.stringify({a: 123});
      routeParams = $routeParams;
      routeParams.orderId = 123;
      routeParams.token = 456;
      routeParams.PayerID = 'J8NQ8SXTCFVZS';

      rootScope = $rootScope;
      scope = $rootScope.$new();
      scope.cart = { cart: { cart_id: 123 } }
      $location = _$location_;
      scope.deviceId = '3';

      LoginsShopController = $controller('LoginsResetGuestController', {
        $scope: scope,
        $rootScope: rootScope
      });
    }));


    it('should allow the user to reset their password', function () {

      spyOn(ctFactory, 'guestUpdatePassword').andCallThrough();

      // deferred.resolve(results);
      // scope.$apply();

      // deferred.resolve(order);
      // scope.$apply();

      // expect(scope.loading).toBe(undefined)
      // expect(scope.order.state).toBe('pending')
    });

  });
});

