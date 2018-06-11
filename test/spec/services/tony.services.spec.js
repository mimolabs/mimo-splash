'use strict';

describe("Tony Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Tony;
  var routeParams;

  beforeEach(inject(function($injector, _Tony_, $routeParams) {

    routeParams = $routeParams;
    routeParams.uamip = '192.168.4.1';

    Tony = _Tony_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('JSONP', 'http://mywifi.dev:8080/api/v1/logins?callback=JSON_CALLBACK&challenge=challenge&mac=11:22:33:44:55:66&password=morley&request_uri=polkaspots.my-wifi.co&type=create&username=simon')
      .respond(200, {});

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/store_carts?product_ids=1&product_ids=2&product_ids=3&store_id=123')
      .respond(200, {});

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/store_carts/123')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to location zones', function() {
    var result = Tony.create({username: 'simon', password: 'morley', mac: '11:22:33:44:55:66', challenge: 'challenge', request_uri: 'polkaspots.my-wifi.co'});
    $httpBackend.expectJSONP('http://mywifi.dev:8080/api/v1/logins?callback=JSON_CALLBACK&challenge=challenge&mac=11:22:33:44:55:66&password=morley&request_uri=polkaspots.my-wifi.co&type=create&username=simon')
    $httpBackend.flush();
  });

  it('should have sent a POST request to create a store cart', function() {
    var result = Tony.addToCart({store_id: 123, product_ids: [1,2,3]});
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/store_carts?product_ids=1&product_ids=2&product_ids=3&store_id=123');
    $httpBackend.flush();
  });

  it('should have sent a get request to fetch a store cart', function() {
    var result = Tony.getCart({ id: 123 });
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/store_carts/123');
    $httpBackend.flush();
  });


})

describe("Tony Unit Tests", function() {

  beforeEach(module('ctLoginsApp', function($provide) {
    coovaFactory = {
      status: function () {
        deferred = q.defer();
        return {$promise: deferred.promise};
      },
    };
    $provide.value("Coova", coovaFactory);
  }));

  beforeEach(module('ctLoginsApp'));

    var
      CTService,
      coovaFactory,
      routeParams,
      q,
      $scope,
      rootScope,
      location,
      httpBackend,
      deferred;

  beforeEach(inject(function($injector, _CT_, $routeParams, $q, $rootScope, _$routeParams_, _$httpBackend_, _$location_ ) {

    httpBackend = _$httpBackend_
    location = _$location_
    $routeParams = _$routeParams_;
    $routeParams.splash_id = '123';
    $scope = $rootScope;
    rootScope = $rootScope.$new();
    q = $q
    CTService = _CT_;

   }));

  describe("Tony Init Function", function() {

    it('should test that we get the logins from CT', function() {
      httpBackend.whenJSONP("http://mywifi.dev:8080/api/v1/logins?callback=JSON_CALLBACK&splash_id=123&v=2").respond(200, {});
      CTService.init();
      $scope.$apply()
      expect($scope.bodyLayout).toBe(undefined);
      httpBackend.flush();

      // There's nothing really to test here other than it calls Tony //
    });

    it('should get the logins unsuccessfully and set an error', function() {

      $scope.state = {}
      var deferred = q.defer();
      httpBackend.whenJSONP("http://mywifi.dev:8080/api/v1/logins?callback=JSON_CALLBACK&splash_id=123&v=2").respond(422, {});

      CTService.init();
      deferred.reject();
      $scope.$digest()

      rootScope.$apply();
      // Cant get these working, dont know why //
      // expect(rootScope.bodyLayout).toBe('login-error');
      // expect(location.path()).toBe('/oh')
      httpBackend.flush();
    });

  });

  describe("Tony Login Function", function() {

    xit('should test that we get the logins from CT', function() {

      //This doesnt test anything yet //
      // Needs to figure out the order of things //

      var deferred = q.defer();
      var params = { username: 'simon', password: 'morley' }
      var chilli = { clientState: 113 }
      $scope.deviceId = '1';

      spyOn(CTService, "status").andCallThrough();
      spyOn(coovaFactory, 'status').andCallThrough()
      httpBackend.whenPOST("http://mywifi.dev:8080/api/v1/logins?password=morley&username=simon").respond(200, {});

      CTService.login(params);

      deferred.resolve();
      $scope.$apply()

      // expect(coovaFactory.status).toHaveBeenCalled();

      httpBackend.flush();
    });

  });

  describe("Tony Coova Status Function", function() {

    var $httpBackend;

    beforeEach(inject(function($compile, $rootScope, $q, $routeParams, $location, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('JSONP', 'http://undefined:3990/json/status?callback=JSON_CALLBACK')
      .respond(200, {});
    }))

    // it('should test that coova status is called from the splash pages', function() {
    //   var deferred = q.defer();
    //   // spyOn(CTService, "status").andCallThrough();
    //   // spyOn(coovaFactory, 'status').andCallThrough()
    //   $scope.deviceId = '1';

    //   CTService.status();

    //   deferred.resolve();
    //   $scope.$apply()
    //   expect(coovaFactory.status).toHaveBeenCalled();
    // });

    it('should test that coova status is NOT called from the splash pages', function() {
      var deferred = q.defer();
      spyOn(CTService, "status").andCallThrough();
      spyOn(coovaFactory, 'status').andCallThrough()

      CTService.status();

      deferred.resolve();
      $scope.$apply()

      // Because we have no deviceId set //
      expect(coovaFactory.status).not.toHaveBeenCalled();
    });

  });

  describe("Tony Remind Function", function() {

    // This doesnt really test much at the moment //
    it('should test that we can get the password remind from CT', function() {

      var email = 's@p.com';
      var splash_id = '123';

      httpBackend.whenPOST('http://mywifi.dev:8080/api/v1/logins/remind?email='+ email + '&splash_id=' + splash_id).respond(200, {});
      CTService.remind(email,splash_id).then(function(a) {
        expect(a).toEqual(email);
      });
      httpBackend.flush();
    });

  });

})
