'use strict';

describe("Ruckus Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Ruckus;
  var routeParams;

  beforeEach(inject(function($injector, _Ruckus_, $routeParams) {

    routeParams = $routeParams;
    routeParams.uamip = '192.168.4.1';

    Ruckus = _Ruckus_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://192.168.4.1:3990/login?&password=passy&username=simon')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  xit('should have sent a GET request to ruckus status', function() {
    var result = Ruckus.login({uamip: '192.168.4.1', uamport: '3990', username: 'simon', password: 'passy'});
    $httpBackend.expectGET('http://192.168.4.1:3990/login?&password=passy&username=simon')
    $httpBackend.flush();
  });


})

