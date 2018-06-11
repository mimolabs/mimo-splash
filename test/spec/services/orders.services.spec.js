'use strict';

describe("Order Unit Tests", function() {

  beforeEach(module('ctLoginsApp'));

  var $httpBackend;
  var Order;
  var routeParams;

  beforeEach(inject(function($injector, _Order_, $routeParams) {

    routeParams = $routeParams;
    routeParams.uamip = '192.168.4.1';

    Order = _Order_;
    $httpBackend = $injector.get('$httpBackend');

    $httpBackend.when('POST', 'http://mywifi.dev:8080/api/v1/orders?cart_id=123')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/orders/123?cart_id=123&guest_id=456')
      .respond(200, {});

    $httpBackend.when('PATCH', 'http://mywifi.dev:8080/api/v1/orders/123?cart_id=123')
      .respond(200, {});

   }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  it('should post to the orders create function', function() {
    var result = Order.create({cart_id: 123});
    $httpBackend.expectPOST('http://mywifi.dev:8080/api/v1/orders?cart_id=123')
    $httpBackend.flush();
  });

  it('should patch to the orders update function', function() {
    var result = Order.update({cart_id: 123, id: 123});
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/orders/123?cart_id=123')
    $httpBackend.flush();
  });

  it('should patch to the orders update finalise', function() {
    var result = Order.finalise({cart_id: 123, id: 123, guest_id: 456});
    $httpBackend.expectPATCH('http://mywifi.dev:8080/api/v1/orders/123?cart_id=123&guest_id=456')
    $httpBackend.flush();
  });

})

