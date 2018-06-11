'use strict';

describe('logins init', function () {

  var $scope,
      rootScope,
      element,
      deferred,
      q,
      location,
      routeParams,
      $httpBackend,
      coovaFactory,
      cookies,
      arubaFactory,
      ctFactory,
      xirrusFactory,
      ruckusFactory,
      ordersFactory,
      tonyFactory,
      loginFactory;

  beforeEach(module('components/logins/_display_store.html'));

  beforeEach(module('ctLoginsApp', function($provide) {
    ctFactory = {
      reporter: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    ordersFactory = {
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    tonyFactory = {
      remind: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      create: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      addToCart: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      getCart: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    ruckusFactory = {
      login: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    arubaFactory = {
      login: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    xirrusFactory = {
      login: function () {
        deferred = q.defer();
        return deferred.promise;
      }
    };
    coovaFactory = {
      status: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      logon: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    loginFactory = {
      initialise: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
      welcome: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      }
    };
    $provide.value("Ruckus", ruckusFactory);
    $provide.value("Coova", coovaFactory);
    $provide.value("Login", loginFactory);
    $provide.value("Tony", tonyFactory);
    $provide.value("Xirrus", xirrusFactory);
    $provide.value("Aruba", arubaFactory);
    $provide.value("Order", ordersFactory);
  }));

  describe('form page', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $injector) {

      $httpBackend = $injector.get('$httpBackend');

      $httpBackend.when('POST', '/api/v1/packer?api_url=http:%2F%2Fmywifi.dev:8080%2Fapi%2Fv1&request_uri=server')
      .respond(200, {});

      $scope = $rootScope;
      rootScope = $rootScope.$new()
      location = $location;
      routeParams = $routeParams;
      routeParams.uamip = '192.168.4.1';
      routeParams.uamport = '3990';
      $scope.state = { status: 'loading' }
      $scope.form = '<form ng-submit=\'submit()\'><input name=\'password\' ng-model=\'password\'></input><input id=\'submit\'type="submit" name="login"></form>';
      $scope.redirects = { show_welcome: true, welcome_text: 'hi simon' };
      q = $q;
      element = angular.element('<form-code state="state" code="{{form}}" redirects="{{ redirects }}"></form-code>');
      $compile(element)($rootScope)
    }))

    // describe('CHILLI', function () {

    //   beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
    //     $scope.deviceId = '1';
    //     element.scope().$apply();
    //   }));

    //   it("should check the status of user via chilli / coova service NOT LOGGED IN", function() {
    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     var resp = { clientState: 0 }
    //     expect(element.isolateScope().state.status).toBe('loading');
    //     var html = element.html()

    //     deferred.resolve(resp);
    //     $scope.$apply()
    //     expect(element.html() === html).toBe(false)
    //     expect(element.isolateScope().code).toBe($scope.form);
    //     expect(element.isolateScope().state.status).toBe(undefined);

    //   })

    //   it("should check the status of user via chilli / coova service IS LOGGED IN", function() {
    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     var resp = { clientState: 1 }

    //     deferred.resolve(resp);
    //     $scope.$apply()

    //     expect(element.isolateScope().login).toBe(undefined);
    //     expect(element.isolateScope().state.errors).toBe('You\'re already logged in.');
    //   });

    //   it("should check the status of user via chilli - no connection", function() {
    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     var resp = { clientState: 1 }
    //     deferred.reject();
    //     $scope.$apply()
    //     expect(element.isolateScope().login).toBe(undefined);
    //     expect(element.isolateScope().state.errors).toBe('<h1>Connection Error </h1><p>You can\'t view the splash pages unless you\'re attached to the hotspot.<br>Reconnect to the Public Wi-Fi and try again.</p>');
    //   });

    //   it("should successfully log a user in via chilli and redirect to the welcome page and also send params to reporter", function() {
    //     var chilli = { clientState: 0, challenge: 123456 };
    //     var chilliOn = { clientState: 1, challenge: 123456 };
    //     var tony = { username: 'simon', challengeResp: '123456' };

    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     spyOn(coovaFactory, 'logon').andCallThrough()
    //     spyOn(tonyFactory, 'create').andCallThrough()

    //     element.isolateScope().submit()
    //     var client = { requestUri: 123, apMac: 456, clientMac: 789, apname: '11:22:33:44:55:66', challenge: 123 }

    //     expect(element.isolateScope().state.status).toBe('login');

    //     // First init from load temp //
    //     deferred.resolve(chilli)
    //     $scope.$apply()

    //     expect(coovaFactory.status).toHaveBeenCalled();
    //     deferred.resolve(chilli);
    //     $scope.$apply()

    //     // // Resolve Post Create Login on Tony //
    //     deferred.resolve(tony);
    //     $scope.$apply()
    //     expect(tonyFactory.create).toHaveBeenCalled();

    //     // // // Resolve against box //
    //     deferred.resolve(chilliOn);
    //     $scope.$apply()

    //     expect(coovaFactory.logon).toHaveBeenCalled();

    //     deferred.resolve();
    //     $scope.$apply()

    //     expect(element.isolateScope().login).toBe(undefined);
    //     expect(element.isolateScope().success).toBe(true);

    //   });

    //   it("should not log a user in via chilli = radius reject", function() {
    //     var chilli = { clientState: 0, challenge: 123456 };
    //     var chilliOn = { clientState: 1, challenge: 123456 };
    //     var tony = { username: 'simon', challengeResp: '123456' };

    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     spyOn(coovaFactory, 'logon').andCallThrough()
    //     spyOn(tonyFactory, 'create').andCallThrough()

    //     element.isolateScope().submit()
    //     expect(element.isolateScope().state.status).toBe('login');

    //     // First init from load temp //
    //     deferred.resolve(chilli)
    //     $scope.$apply()

    //     deferred.resolve(chilli);
    //     $scope.$apply()
    //     expect(coovaFactory.status).toHaveBeenCalled();


    //     // // Resolve Post Create Login on Tony //
    //     deferred.resolve(tony);
    //     $scope.$apply()
    //     expect(tonyFactory.create).toHaveBeenCalled();

    //     // Fail against box //
    //     deferred.resolve(chilli);
    //     $scope.$apply()
    //     expect(coovaFactory.logon).toHaveBeenCalled();
    //     expect(element.isolateScope().state.status).toBe(undefined);
    //     expect(element.isolateScope().success).toBe(undefined);
    //     // expect($scope.error.res.username).toBe('simon');
    //     expect($scope.error).toBe('Unable to log you in.');
    //   });

    //   it("should try and log a user in but fail because the password is wrong CT response", function() {
    //     var chilli = { clientState: 0, challenge: 123456 };

    //     spyOn(coovaFactory, 'status').andCallThrough()
    //     spyOn(coovaFactory, 'logon').andCallThrough()
    //     spyOn(tonyFactory, 'create').andCallThrough()

    //     element.isolateScope().password = 'passy';

    //     element.isolateScope().submit()
    //     expect(element.isolateScope().state.status).toBe('login');

    //     // First init from load temp //
    //     deferred.resolve(chilli)
    //     $scope.$apply()

    //     expect(coovaFactory.status).toHaveBeenCalled();
    //     deferred.resolve(chilli);
    //     $scope.$apply()


    //     // Resolve Post Create Login on Tony //
    //     deferred.reject({data: { message: 123}});
    //     $scope.$apply();
    //     expect(tonyFactory.create).toHaveBeenCalled();
    //     expect($scope.error).toBe(123);
    //     expect($scope.banneralert).toBe('banner-alert alert-box alert');
    //     expect(element.isolateScope().state.status).toBe(undefined);
    //     expect(element.isolateScope().password).toBe(undefined);
    //   });

    //   it("should try and log a user in via chilli but fail as they're already online", function() {
    //     var chilli = { clientState: 1, challenge: 123456 };

    //     spyOn(coovaFactory, 'status').andCallThrough()

    //     element.isolateScope().submit()
    //     expect(element.isolateScope().state.status).toBe('login');
    //     // First init from load temp //
    //     deferred.resolve(chilli)
    //     $scope.$apply()

    //     expect(coovaFactory.status).toHaveBeenCalled();

    //     expect(element.isolateScope().state.status).toBe(undefined);
    //     expect(element.isolateScope().state.errors).toBe('You\'re already logged in.');

    //     // expect($scope.banneralert).toBe('banner alert-box alert');
    //   });

    //   it("should try and log a user in via chilli but fail as we lose contact with the box", function() {
    //     var chilli = { clientState: 1, challenge: 123456 };

    //     spyOn(coovaFactory, 'status').andCallThrough()

    //     element.isolateScope().submit()
    //     expect(element.isolateScope().state.status).toBe('login');

    //     // First init from load temp //
    //     deferred.reject(chilli)

    //     $scope.$apply()
    //     expect(coovaFactory.status).toHaveBeenCalled();

    //     expect(element.isolateScope().state.status).toBe(undefined);
    //     expect(element.isolateScope().state.errors).toBe('<h1>Connection Error </h1><p>You can\'t view the splash pages unless you\'re attached to the hotspot.<br>Reconnect to the Public Wi-Fi and try again.</p>');
    //   });

    // });

    describe('MERAKI', function () {

      beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $injector) {
        $scope.deviceId = '3';

        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('JSONP', 'http://undefined:3990/json/status?callback=JSON_CALLBACK')
        .respond(200, {});

        $httpBackend.when('JSONP', 'http://undefined:3990/json/logon?&username=simon&response=undefined&uamSsl=undefined&callback=JSON_CALLBACK')
        .respond(200, {});

        element.scope().$apply();
      }))

      // it("should successfully log a user in via meraki", function() {
      //   var merakiOn = { clientState: 1 };
      //   var merakiOff = { clientState: 0 };

      //   // spyOn(tonyFactory, 'create').andCallThrough()

      //   element.isolateScope().submit()
      //   deferred.resolve();
      //   $scope.$apply()

      //   // // Sets logging in fn //
      //   expect(element.isolateScope().state.status).toBe('login');

      //   // Resolve Post Create Login on Tony //
      //   deferred.resolve(merakiOn);
      //   $scope.$apply();
      //   expect(tonyFactory.create).toHaveBeenCalled();

      //   expect(element.isolateScope().username).toBe(undefined);
      //   expect(element.isolateScope().response).toBe(undefined);

      //   // // Resolve against box //
      //   expect(element.isolateScope().state.status).toBe(undefined);
      //   expect(element.isolateScope().success).toBe(true);
      //   expect(location.path()).toBe('/welcome');
      // });

    });

    describe('ARUBA', function () {

      beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
        $scope.deviceId = '2';
        routeParams = $routeParams;
        routeParams.apname = '11:22:33';
        routeParams.apname = '11:22:33';
        element.scope().$apply();
      }));

      // it("should successfully log a user in via aruba", function() {
      //   var tony = { username: 'simon', challengeResp: '123456' };
      //   var client = { requestUri: 123, apMac: 456, clientMac: 789, apname: '11:22:33:44:55:66' }

      //   spyOn(arubaFactory, 'login').andCallThrough()
      //   spyOn(tonyFactory, 'create').andCallThrough()

      //   element.isolateScope().submit()

      //   deferred.resolve(client)
      //   $scope.$apply()

      //   deferred.resolve(tony);
      //   $scope.$apply()

      //   expect(element.isolateScope().state.status).toBe('login');

      //   // // Resolve against box //
      //   deferred.resolve(tony);
      //   $scope.$apply()
      //   expect(element.isolateScope().state.status).toBe(undefined);
      //   expect(element.isolateScope().success).toBe(true);
      //   expect(location.path()).toBe('/welcome');
      // });

    });

    describe('XIRRUS', function () {

      beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
        $scope.deviceId = '6';
        routeParams = $routeParams;
        routeParams.apname = '11:22:33';
        routeParams.apname = '11:22:33';
        element.scope().$apply();
      }));

      // it("should successfully log a user in via aruba", function() {
      //   var tony = { username: 'simon', challengeResp: '123456' };
      //   var client = { requestUri: 123, apMac: 456, clientMac: 789, apname: '11:22:33:44:55:66' }

      //   spyOn(xirrusFactory, 'login').andCallThrough()
      //   spyOn(tonyFactory, 'create').andCallThrough()

      //   element.isolateScope().submit()

      //   deferred.resolve(client)
      //   $scope.$apply()

      //   deferred.resolve(tony);
      //   $scope.$apply()

      //   expect(element.isolateScope().state.status).toBe('login');

      //   // // Resolve against box //
      //   deferred.resolve(tony);
      //   $scope.$apply()
      //   expect(element.isolateScope().state.status).toBe(undefined);
      //   expect(element.isolateScope().success).toBe(true);
      //   expect(location.path()).toBe('/welcome');
      // });

    });

    describe('RUCKUS', function () {

      beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
        $scope.deviceId = '4';
        routeParams = $routeParams;
        routeParams.apname = '11:22:33';
        routeParams.apname = '11:22:33';
        element.scope().$apply();
      }));

      xit("should successfully log a user in via aruba", function() {
        var tony = { username: 'simon', challengeResp: '123456' };
        var client = { requestUri: 123, apMac: 456, clientMac: 789, apname: '11:22:33:44:55:66' }

        spyOn(ruckusFactory, 'login').andCallThrough()
        spyOn(tonyFactory, 'create').andCallThrough()

        element.isolateScope().submit()

        deferred.resolve(client)
        $scope.$apply()

        deferred.resolve(tony);
        $scope.$apply()

        expect(element.isolateScope().state.status).toBe('login');

        // // Resolve against box //
        deferred.resolve(tony);
        $scope.$apply()
        expect(element.isolateScope().state.status).toBe(undefined);
        expect(element.isolateScope().success).toBe(true);
        expect(location.path()).toBe('/welcome');
      });

    });

  })

  describe('getting the welcome page', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location) {
      $scope = $rootScope;
      routeParams = $routeParams;
      routeParams.location_id = 123;
      location = $location;
      $scope.box = {};
      q = $q;
      $scope.state = { status: 'loading' }
      element = angular.element('<welcome></welcome>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("should get the welcome copy", function() {
      spyOn(loginFactory, 'welcome').andCallThrough()
      var data = {welcome: "Oh hi", timeout: 200 }
      expect($scope.state.status).toBe('loading');
      deferred.resolve(data);
      $scope.$apply()
      expect($scope.state.status).toBe(undefined);
      expect($scope.welcome).toBe(data.welcome);
    })

  });

  describe('displaying a list of prducts', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies) {

      cookies = $cookies;
      location = $location;
      $scope = $rootScope;
      q = $q;
      $scope.products = [{ value: 100, description: 'Simon', _id: '999' }, { _id: '888'}]
      $scope.store = { store_id: 12312312 }
      element = angular.element('<display-store id="{{store.store_id}}" products="{{products}}"></display-store>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    xit("should display a form with the products and add to cart init", function() {
      var cart = { cart: { cart_id: '123'}, products: [{ description: 'abc', _id: '999' }] }
      var cart2 = { cart: { cart_id: '123'}, products: [{ description: 'abc', _id: '888' }] }
      expect($scope.showstore).toBe(true);
      expect($scope.products.length).toBe(2)
      $scope.addToCart('999')

      deferred.resolve(cart);
      $scope.$apply()
      expect($scope.cart.products[0].description).toBe('abc')
      expect($scope.cart.cart.cart_id).toBe('123')
      expect(cookies.cartId).toBe('123')
      expect($scope.showcart).toBe(true)
      expect($scope.showstore).toBe(undefined);
      expect($scope.products.length).toBe(1)

      // If we do it again, the products should be 1 not 0
      $scope.addToCart('888')

      deferred.resolve(cart2);
      $scope.$apply()
      expect($scope.cart.products[0].description).toBe('abc')
      expect(cookies.cartId).toBe('123')
      expect($scope.showcart).toBe(true)
      expect($scope.showstore).toBe(undefined);
      expect($scope.products.length).toBe(1)
    })

    xit("should empty the cart", function() {
      var cart = { cart: { cart_id: '123'}, products: [{ description: 'abc', _id: '1999' }] }
      $scope.cart = cart;
      $scope.showcart = true;
      expect($scope.products.length).toBe(2);

      $scope.emptyCart();
      expect($scope.products.length).toBe(3);
      expect($scope.cart == undefined).toBe(false);

      deferred.resolve();
      $scope.$apply()
      expect($scope.cart == undefined).toBe(true);
      expect($scope.showcart).toBe(undefined)
    });

    xit("should click the express url and the redirect to the url returned by ct", function() {
      spyOn(ordersFactory, 'create').andCallThrough()
      var cart = { cart: { cart_id: '123'}, products: [{ _id: '999', description: 'abc' }] }
      $scope.cart = cart;

      $scope.paypal();
      deferred.resolve();
      $scope.$apply()

      expect($scope.redirecting).toBe(true);
    });

    xit("should click the express url and break 400 error", function() {
    });

  });

  describe('displaying the cart', function () {

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies) {

      cookies = $cookies;
      cookies.cartId = 123
      $scope = $rootScope;
      q = $q;
      $scope.products = [{ value: 100, description: 'Simon', _id: '999' }]
      $scope.store = { store_id: 12312312 }
      $scope.state = {};
      $scope.cart = { cart: {} };
      element = angular.element('<display-store id="{{store.store_id}}" products="{{products}}"></display-store>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    xit("should display the cart from ct on page refresh", function() {
      spyOn(tonyFactory, 'getCart').andCallThrough()
      var cart = { cart: { cart_id: '123'}, products: [{ _id: '999', description: 'abc' }] }

      cookies.cartId = '123'
      element.scope().$apply();

      expect($scope.showstore).toBe(undefined);
      expect($scope.products.length).toBe(1)


      deferred.resolve(cart);
      $scope.$apply()

      expect($scope.cart.products[0].description).toBe('abc')
      expect($scope.showcart).toBe(true)

      // And removes from the list of products //
      expect($scope.products.length).toBe(0)
    })

    xit("should fail to get a cart - tinkered with cookie, so we wipe the cookies", function() {
      spyOn(tonyFactory, 'getCart').andCallThrough()
      var cart = { cart: { cart_id: '123'}, products: [{ _id: '999', description: 'abc' }] }

      cookies.cartId = '123'
      element.scope().$apply();

      expect($scope.showstore).toBe(undefined);
      expect($scope.products.length).toBe(1)

      deferred.reject(cart);
      $scope.$apply()

      expect(cookies.cartId).toBe(undefined)
    })

    it("should process the stripe payment", function() {
      spyOn(tonyFactory, 'getCart').andCallThrough()
      spyOn(ordersFactory, 'create').andCallThrough()
      var cart = { cart: { cart_id: '123'}, products: [{ _id: '999', description: 'abc' }], store: { merchant_type: 'stripe' } }

      deferred.resolve(cart);
      $scope.$apply()

      $scope.stripePayment()
      expect($scope.cart.state).toBe('processing')
      expect($scope.showcart).toBe(undefined)

      var token = { id: 123, email: 'simon@ps.com' }
      $scope.stripeProcess(token)
      var order = {response: [{username: "feeling-7214", password: "letter"}]}

      // Client details //
      deferred.resolve(order)
      $scope.$apply()

      // Create order //
      deferred.resolve(order)
      $scope.$apply()

      expect($scope.vouchers.length).toEqual(1)
      expect($scope.cart.state).toBe('complete')
    })

    it("not fail to process the stripe payment", function() {
      spyOn(tonyFactory, 'getCart').andCallThrough()
      spyOn(ordersFactory, 'create').andCallThrough()
      var cart = { cart: { cart_id: '123'}, products: [{ _id: '999', description: 'abc' }], store: { merchant_type: 'stripe' } }

      deferred.resolve(cart);
      $scope.$apply()

      $scope.stripePayment()
      expect($scope.cart.state).toBe('processing')
      expect($scope.showcart).toBe(undefined)

      var token = { id: 123, email: 'simon@ps.com' }
      $scope.stripeProcess(token)

      // Client details //
      deferred.resolve({message: 123})
      $scope.$apply()

      // Create order //
      deferred.reject({message: 123})
      $scope.$apply()

      expect($scope.vouchers).toEqual(undefined)
      // expect($scope.cart.error).toEqual(123)
      // expect($scope.cart.state).toBe('declined')
    })

  });

  describe('forgot passy link / template', function () {

    var timeout;

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $httpBackend, $cookies, $injector, _$timeout_) {

      $httpBackend = $injector.get('$httpBackend');
      timeout = _$timeout_

      $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/logins/remind?email=s@ps.com&splash_id=123')
      .respond(200, {});

      $scope = $rootScope;
      $scope.splash = {active: true};
      element = angular.element('<forgot-password active="{{splash.active}}"></forgot-password>');
      $compile(element)($rootScope)
      element.scope().$apply();
    }))

    it("display the link and then get the remind form", function() {
      expect(element.html()).toEqual('<div class="ng-scope"><p><b><a href="" ng-click="showForm()">Forgot your details?</a></b></p></div>')
    });

    it("should display the remind form", function() {

      spyOn(tonyFactory, 'remind').andCallThrough()

      var a = '<div class="ng-scope"><p><b><a href="" ng-click="showForm()">Forgot your details?</a></b></p></div>'
      expect(element.html()).toEqual(a)
      element.isolateScope().showForm();
      expect(element.isolateScope().remind).toEqual(true)
      expect(element.html()).not.toEqual(a)

      element.isolateScope().email = 's@ps.com';
      element.isolateScope().sendReminder('s@ps.com', 123)
      expect(element.isolateScope().reminding).toEqual(true)

      deferred.resolve();
      $scope.$apply()
      // timeout.flush()
      // expect(element.isolateScope().remind).toEqual(undefined)
    });

  });

})

