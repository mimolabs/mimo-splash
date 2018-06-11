'use strict';

describe("Coova Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend, Coova, routeParams;

  beforeEach(inject(function($injector, _Coova_, $routeParams) {

    // Why aren't the route params set ??!! //
    $routeParams.uamip = '192.168.4.1';
    routeParams = $routeParams;

    Coova = _Coova_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('JSONP', 'http://undefined:3990/json/status?callback=JSON_CALLBACK')
      .respond(200, {});

    $httpBackend.when('JSONP', 'http://undefined:3990/json/logon?&username=simon&response=undefined&uamSsl=undefined&callback=JSON_CALLBACK')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to coova status', function() {
    var result = Coova.status({});
    $httpBackend.expectJSONP('http://undefined:3990/json/status?callback=JSON_CALLBACK')
    $httpBackend.flush();
  });

  it('should have sent a GET request to coova logon', function() {
    var result = Coova.logon({username: 'simon', password: 'passy'});
    $httpBackend.expectJSONP('http://undefined:3990/json/logon?&username=simon&response=undefined&uamSsl=undefined&callback=JSON_CALLBACK')
    $httpBackend.flush();
  });

})

