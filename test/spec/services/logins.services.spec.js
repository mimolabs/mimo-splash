'use strict';

describe("Login Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Login;

  beforeEach(inject(function($injector, _Login_) {

    Login = _Login_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('GET', 'http://mywifi.dev:8080/api/v1/logins?v=2&welcome=true')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should have sent a GET request to welcome show', function() {
    var result = Login.welcome({v: 2, welcome: true});
    $httpBackend.expectGET('http://mywifi.dev:8080/api/v1/logins?v=2&welcome=true')
    $httpBackend.flush();
  });


})

