'use strict';

describe('logins init', function () {

  var $scope,
      element,
      deferred,
      q,
      location,
      compile,
      loginScope,
      routeParams,
      timeout,
      $window,
      controller,
      cookies,
      ctFactory,
      orderFactory,
      loginFactory;

  beforeEach(module('components/logins/_display_store.html'));

  beforeEach(module('ctLoginsApp', function($provide) {
    $window = {
        location: {},
        document: window.document
    };
    ctFactory = {
      guestLogin: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      guestCreate: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      guestReset: function () {
        deferred = q.defer();
        return deferred.promise;
      },
      login: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    orderFactory = {
      finalise: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("CT", ctFactory);
    $provide.constant( '$window' , $window );
    $provide.value("Order", orderFactory);
  }));

  describe('authorising logins', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies ) {
      cookies = $cookies;
      cookies.remove('guestId');
      compile = $compile;
      location = $location;
      $scope = $rootScope;
      q = $q;
      $scope.guest = {};
      $scope.state = 'pending'
      element = angular.element('<finalise-order state="order.state"><guest-login reg="true"></guest-login></finalise-order>');
      $compile(element)($rootScope)

      loginScope = element.find('guest-login');
      element.scope().$apply();
      controller = element.controller
    }));

    it("should display a form the user to login and login", function() {
      spyOn(ctFactory, 'guestLogin').andCallThrough()

      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var cont = element.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      cont = element.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(passy);
      $scope.$digest();

      expect(loginScope.isolateScope().guest.email).toBe(email);
      expect(loginScope.isolateScope().guest.password).toBe(passy);

      loginScope.isolateScope().guestLogin(loginScope.isolateScope().guest)
      $scope.$digest()
      expect(loginScope.isolateScope().loading).toBe(true);

      deferred.resolve(auth)
      $scope.$digest()
      expect(cookies.get('guestId')).toBe(auth.guestId);
      // expect(loginScope.isolateScope().loading).toBe(undefined);
    })

    it("should display a form the user to login and not login", function() {
      spyOn(ctFactory, 'guestLogin').andCallThrough()

      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      var cont = loginScope.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(passy);
      $scope.$digest();

      expect(loginScope.isolateScope().guest.email).toBe(email);
      expect(loginScope.isolateScope().guest.password).toBe(passy);

      loginScope.isolateScope().guestLogin(loginScope.isolateScope().guest)
      deferred.reject();
      $scope.$digest();
      expect(loginScope.isolateScope().loggedIn).toBe(undefined);
      expect(loginScope.isolateScope().guest.password).toBe(undefined);
      expect($scope.error).toBe('Username or password incorrect or not a valid guest account');
      expect($scope.banneralert).toBe('banner-alert alert-box alert');
    });

    it("should remove the login form and put a registerionation one up", function() {
      spyOn(ctFactory, 'guestLogin').andCallThrough()

      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var el = element.html();
      loginScope.isolateScope().registerUser();
      $scope.$digest();

      expect(element.html() === el).toBe(false);

    });

    it("should reset the password", function() {
      spyOn(ctFactory, 'guestReset').andCallThrough();
      var email = 'simon@ps.com';
      var el = element.html();
      loginScope.isolateScope().resetPassword();
      $scope.$digest();
      expect(el === element.html()).toBe(false);

      var cont = element.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);

      loginScope.isolateScope().processReset(email);
      $scope.$digest();
      expect(loginScope.isolateScope().resetting).toBe(true);

      deferred.resolve();
      $scope.$digest();
      expect(loginScope.isolateScope().resetting).toBe(undefined);
      expect(loginScope.isolateScope().reset).toBe(true);
    });

    it("should not reset the password", function() {
      spyOn(ctFactory, 'guestReset').andCallThrough();
      var email = 'simon@ps.com';
      var el = loginScope.html();
      loginScope.isolateScope().resetPassword()
      $scope.$digest();
      expect(el === loginScope.html()).toBe(false)

      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);

      loginScope.isolateScope().processReset(email)
      $scope.$digest();
      expect(loginScope.isolateScope().resetting).toBe(true);

      deferred.reject(123)
      $scope.$digest()
      expect(loginScope.isolateScope().resetting).toBe(undefined);
      expect(loginScope.isolateScope().error).toBe(123);
    });

    xit("should display a form the user to register and login and finalise", function() {
      expect(cookies.cartId).toBe('123')
      spyOn(ctFactory, 'guestCreate').andCallThrough()

      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      loginScope.isolateScope().registerUser()
      $scope.$digest();
      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      var cont = loginScope.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(passy);
      $scope.$digest()

      expect(loginScope.isolateScope().guest.email).toBe(email);
      expect(loginScope.isolateScope().guest.password).toBe(passy);

      loginScope.isolateScope().guestRegister(loginScope.isolateScope().guest)
      $scope.$digest()
      expect(loginScope.isolateScope().loading).toBe(true);

      deferred.resolve(auth)
      $scope.$digest()
      expect(cookies.guestId).toBe(auth.guestId);
      expect(cookies.cartId).toBe('123')

      var results = { message: 123 }
      deferred.resolve(results)
      $scope.$digest()
      expect(element.isolateScope().finalised).toBe(true);
    });

    xit("should display the email reg. form only", function() {
      spyOn(ctFactory, 'guestCreate').andCallThrough()

      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      var cont = loginScope.find('input[name*="password"]').controller('ngModel');
      cont.$setViewValue(passy);
      $scope.$digest()

      expect(loginScope.isolateScope().guest.email).toBe(email);
      expect(loginScope.isolateScope().guest.password).toBe(passy);

      loginScope.isolateScope().guestRegister(loginScope.isolateScope().guest)
      $scope.$digest()
      expect(loginScope.isolateScope().loading).toBe(true);

      deferred.reject()
      $scope.$digest()
      expect(loginScope.isolateScope().loggedIn).toBe(undefined);
      expect(loginScope.isolateScope().loading).toBe(undefined);
      expect(cookies.cartId).toBe('123')
      expect($scope.error).toBe('Invalid details, please try again. Are you already registered?');
      expect($scope.banneralert).toBe('banner-alert alert-box alert');
    });

    // xit("should cancel an order", function() {
    //   // full preload //
    //   var auth = { guestId: '123' };
    //   var email = 'simon@ps.com';
    //   var passy = '123456';

    //   loginScope.isolateScope().cancelOrder();
    //   expect(cookies.cartId).toBe(undefined);

    // })

  });

  describe('no login / reg - just voucher codes', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies, _$timeout_, _$location_ ) {
      cookies = $cookies;
      location = _$location_
      timeout = _$timeout_;
      cookies.put('cartId', '123');
      compile = $compile;
      location = $location;
      $scope = $rootScope;
      q = $q;
      $scope.guest = {};
      $scope.order = { state: 123 }
      element = angular.element('<finalise-order state="order.state"><guest-login reg="false"></guest-login></finalise-order>');
      $compile(element)($rootScope);

      loginScope = element.find('guest-login');
      element.scope().$apply();
      controller = element.controller
    }))

    it("should display a form the user to enter their email and rturn voucher codes", function() {
      expect(cookies.get('cartId')).toBe('123')
      spyOn(ctFactory, 'guestCreate').andCallThrough()

      var results = { vouchers: [{username: 123}] }
      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      $scope.$digest()

      expect(loginScope.isolateScope().guest.email).toBe(email);

      loginScope.isolateScope().finaliseOrder(loginScope.isolateScope().guest);
      $scope.$digest();
      // expect(loginScope.isolateScope().loading).toBe(true);

      deferred.resolve(results);
      $scope.$digest();
      expect(element.isolateScope().finalised).toBe(true);
      expect(element.isolateScope().vouchers[0].username).toBe(123);
      expect(cookies.cartId).toBe(undefined)

      // expect( $window.location.path ).toBe('/the-url-expected');
    });

    it("should not log the user in with a voucher code and redirect to bbc", function() {
      expect(cookies.get('cartId')).toBe('123')
      spyOn(ctFactory, 'guestCreate').andCallThrough()
      spyOn(ctFactory, 'login').andCallThrough()

      var results = { vouchers: [{username: 123}] }
      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';


      loginScope.isolateScope().finaliseOrder(loginScope.isolateScope().guest)
      $scope.$digest()

      deferred.resolve(results)
      $scope.$digest()

      element.isolateScope().loginNow()
      expect(element.isolateScope().loggingIn).toBe(true)

      deferred.reject()
      $scope.$digest()
      expect(ctFactory.login).toHaveBeenCalled();
      timeout.flush()
      // expect(location.href()).toBe(123)

    });

    it("should log the user in with a voucher code", function() {
      expect(cookies.get('cartId')).toBe('123')
      spyOn(ctFactory, 'guestCreate').andCallThrough()
      spyOn(ctFactory, 'login').andCallThrough()

      var results = { vouchers: [{username: 123}] }
      var auth = { guestId: '123' };
      var email = 'simon@ps.com';
      var passy = '123456';

      var cont = loginScope.find('input[name*="email"]').controller('ngModel');
      cont.$setViewValue(email);
      $scope.$digest()

      expect(loginScope.isolateScope().guest.email).toBe(email);

      loginScope.isolateScope().finaliseOrder(loginScope.isolateScope().guest)
      $scope.$digest()

      deferred.resolve(results)
      $scope.$digest()
      expect(element.isolateScope().finalised).toBe(true);
      expect(element.isolateScope().vouchers[0].username).toBe(123);
      expect(cookies.cartId).toBe(undefined)

      element.isolateScope().loginNow()
      expect(element.isolateScope().loggingIn).toBe(true)

      deferred.resolve()
      $scope.$digest()
      expect(ctFactory.login).toHaveBeenCalled();

    });

  });

  describe('finalising the order', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies) {
      cookies = $cookies;
      cookies.put('cartId', '123');
      $scope = $rootScope;
      q = $q;
      $scope.guest = { email: '123', guest_id: 678 }
      $scope.order = { state: 'pending' }
      element = angular.element('<finalise-order state="order.state"></finalise-order>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should finalise the order with guest id", function() {
      var order = { a: '123' }
      expect(cookies.get('cartId')).toBe('123')
      spyOn(orderFactory, 'finalise').andCallThrough();
      element.isolateScope().finalise($scope.guest);
      expect(element.isolateScope().finalising).toBe(true);

      deferred.resolve(order)
      $scope.$digest()

      expect(element.isolateScope().finalising).toBe(undefined);
      expect(element.isolateScope().finalised).toBe(true);
      expect(cookies.cartId).toBe(undefined)

    })

    it("should not finalise the order with guest id", function() {
      var order = { a: '123' }
      expect(cookies.get('cartId')).toBe('123')
      spyOn(orderFactory, 'finalise').andCallThrough();
      element.isolateScope().finalise($scope.guest);
      expect(element.isolateScope().finalising).toBe(true);

      deferred.reject(order)
      $scope.$digest()

      expect(element.isolateScope().finalising).toBe(undefined);
      expect(element.isolateScope().finalised).toBe(undefined);
      expect(cookies.cartId).toBe(undefined)
      expect(element.isolateScope().errors).toBe(true);

    })

  });

});

