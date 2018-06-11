'use strict';

describe("Aruba Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Aruba;
  var routeParams;

  beforeEach(inject(function($injector, _Aruba_, $routeParams) {

    routeParams = $routeParams;
    routeParams.uamip = '192.168.4.1';

    Aruba = _Aruba_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('JSONP', 'http://192.168.4.1:3990/json/status?&callback=JSON_CALLBACK')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  xit('should have sent a GET request to aruba status', function() {
    var result = Aruba.login({});
    $httpBackend.expectJSONP('http://192.168.4.1:3990/json/status?&callback=JSON_CALLBACK')
    $httpBackend.flush();
  });


})

