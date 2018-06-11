'use strict';

describe("Xirrus Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Xirrus;
  var routeParams;

  beforeEach(inject(function($injector, _Xirrus_, $routeParams) {

    routeParams = $routeParams;
    routeParams.uamip = '192.168.4.1';

    Xirrus = _Xirrus_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://192.168.4.1:3990/logon?&password=passy&username=simon')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  xit('should have sent a GET request to xirrus status', function() {
    var result = Xirrus.login({uamip: '192.168.4.1', uamport: '3990', username: 'simon', password: 'passy'});
    $httpBackend.expectGET('http://192.168.4.1:3990/logon?&password=passy&username=simon')
    $httpBackend.flush();
  });


})

