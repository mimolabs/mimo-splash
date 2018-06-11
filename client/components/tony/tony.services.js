'use strict';

var app = angular.module('ctLoginsApp.tony.services', ['ngResource']);

app.factory('CT', ['$routeParams', '$timeout', '$cookies', '$http', '$q', '$rootScope', '$location', '$window', 'CONSENT', 'Coova', 'Client', 'Tony', 'Aruba', 'Xirrus', 'Ruckus', 'Microtik', 'Cisco', 'API_END_POINT', '$sce', '$compile',
  function($routeParams, $timeout, $cookies, $http, $q, $rootScope, $location, $window, CONSENT, Coova, Client, Tony, Aruba, Xirrus, Ruckus, Microtik, Cisco, API_END_POINT, $sce, $compile) {

    var auth, client, loginDetails = {};

    function init(params) {
      var deferred = $q.defer();
      params = params || {};
      params.splash_id = $routeParams.splash_id;
      getLogins(params).then(function(results) {
        if (results.error) {
          genericError(results);
          deferred.reject(results);
        } else {
          if (results.archived === true) {
            archivedLocation();
            deferred.reject(results);
          }
          else if ( results.error ) {
            var msg = results.error;
            genericError(msg);
            deferred.reject(results);
          } else {
            if ($location.path() === '/oh') {
              $location.path('');
            }
            deferred.resolve(results);
          }
        }
      }, function(err) {
        var generic =
            '<h2>Connection Error.</h2>'+
            '<p>Your device is unable to connect to the Internet.</p>' +
            '<p>This could be a browser issue or a problem with your connection. Try a different browser and check your firewall settings. Ensure you have the latest updates installed.</p>';
        var msg = err || generic;
        genericError(msg);
        deferred.reject(err);
      });

      return deferred.promise;

    }

    var archivedLocation = function() {
      var msg = '<p>This splash page has been archived and you can <b>no longer login</b>.</p><p>If you think this is an error, please contact the owner of the Wi-Fi Network</p>';
      genericError(msg);
    };

    var genericError = function(msg) {
      clearUp();
      var message = (msg.message === '' || msg.message === null || msg.message === undefined) ? msg : msg.message;
      $rootScope.state.errors = '<h1>' + message + '</h1>';
      $rootScope.splash = msg.splash;

      var head = angular.element('head');
      var template;

      template =

        'html {' +
        '\tbackground: url({{ splash.background_image_name }}) no-repeat center center fixed;\n' +
        '\t-webkit-background-size: cover;\n' +
        '\t-moz-background-size: cover;\n' +
        '\t-o-background-size: cover;\n'+
        '\tbackground-size: cover;\n'+
        '\tbackground-color: {{splash.background_image_name ? \'transparent\' : splash.body_background_colour || \'#32373A\'}}!important;\n'+
        '}\n\n'+

        'body {\n'+
        '\tmargin: 40px 0;\n'+
        '}\n\n' +

        'h1, h2, h3, p {\n'+
        '\tcolor: {{ splash.heading_text_colour || \'#F0F9FF\' }};\n'+
        '}\n\n' +

        '.splash-container {\n'+
        '\ttext-align: center!important;\n'+
        '\tpadding: 0px 0 0 0;\n'+
        '\tmargin: 0 auto;\n'+
        '\tmax-width: 600px;\n'+
        '\twidth: 98%;\n'+
        '}\n\n'+

        '.inner_container {\n'+
        '\ttext-align: {{ splash.container_text_align }};\n'+
        '\tborder: 1px solid {{ splash.border_colour || \'#32373A\' }};\n'+
        '\tbackground-color: {{ splash.container_colour || \'#32373A\' }}!important;\n'+
        '\topacity: {{ splash.container_transparency }};\n'+
        '\twidth: 100%!important;\n'+
        '\tmax-width: 600px!important;\n'+
        '\tmin-height: 100px;\n'+
        '\tdisplay: block;\n'+
        '\tpadding: 20px;\n'+
        '}\n\n';


      head.append($compile('<style>' + template + '</style>')($rootScope));

    };

    var clearUp = function() {
      $rootScope.bodylayout = undefined;
      $rootScope.hidden = undefined;

      $rootScope.state.hidden = undefined;
      $rootScope.state.status = undefined;
    };

    var getLogins = function(options) {
      options.v = 2;
      var deferred = $q.defer();
      options.callback = 'JSON_CALLBACK';
      $http({
        method: 'JSONP',
        url: API_END_POINT + '/logins',
        params: options
      }).
      success(function(msg) {
        deferred.resolve(msg);
      }).
      error(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    function otp(params) {
      var deferred = $q.defer();
      params = params || {};
      Client.details().then(function(resp) {
        client = resp;
        createOTP(params).then(function(response) {
          if (response.error) {
            deferred.reject(response);
          } else {
            deferred.resolve();
          }
        });
      });
      return deferred.promise;
    }

    function login(params) {
      var deferred = $q.defer();
      params = params || {};

      loginDetails.data               = params.data;
      loginDetails.username           = params.username;
      loginDetails.password           = params.password;
      loginDetails.otp                = params.otp;
      loginDetails.logincode          = params.logincode;
      loginDetails.email              = params.email;
      loginDetails.newsletter         = params.newsletter;
      loginDetails.token              = params.token;
      loginDetails.expires            = params.expires;
      loginDetails.guestId            = params.guestId;
      loginDetails.memberId           = params.memberId;
      loginDetails.splash_id          = params.splash_id;
      loginDetails.type               = params.type;
      loginDetails.screen_name        = params.screen_name;
      loginDetails.email_consent      = params.email_consent;

      Client.details().then(function(resp) {
        client = resp;
        status().then(function(coovaResp) {
          loginDetails.authResp = coovaResp;
          createLogin().then(function(response) {
            //////////////////////////////////////////////////
            // Meraki login if state is present in response /////////
            // Is now also for VSG users or other server side auth ///
            // ///////////////////////////////////////////////
            if (response.state !== undefined) {
              if (response.state === 1) {
                deferred.resolve();
              } else {
                deferred.reject(response);
              }
            } else {
              finaliseLogin(response).then(function() {
                deferred.resolve(auth);
              }, function(err) {
                deferred.reject(err);
              });
            }
          }, function(err) {
            deferred.reject(err);
          });
        });
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function logout() {

    }

    function me () {

    }

    function addToCart(params) {
      var deferred = $q.defer();
      Tony.addToCart({store_id: params.store_id, product_ids: params.product_ids}).$promise.then(function(res) {
        if (res !== undefined && res.cart !== undefined) {
          $cookies.put('cartId', res.cart.cart_id);
        } else {
          $cookies.remove('cartId');
        }
        deferred.resolve(res);
      }, function(err) {
        $cookies.remove('cartId');
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getCart(id) {
      var deferred = $q.defer();
      Tony.getCart({id: id}).$promise.then(function(res) {
        deferred.resolve(res);
      }, function(err) {
        $cookies.remove('cartId');
        deferred.reject(err);
      });
      return deferred.promise;
    }

    var fbCheckin = function(options) {
      var deferred = $q.defer();
      $http({
        method: 'post',
        url: 'https://graph.facebook.com/me/feed',
        params: options
      }).
        success(function(msg) {
          deferred.resolve(msg);
        }).
        error(function(err) {
          deferred.reject(err.error);
        });
      return deferred.promise;
    };

    function checkin(params) {
      var deferred = $q.defer();
      var options = {
        place:        params.pageId,
        access_token: params.token,
        message:      params.message
      };

      fbCheckin(options).then(function(msg) {
        deferred.resolve(msg);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function guestLogin(params) {
      var deferred = $q.defer();
      Client.details().then(function(client) {
        var data = {
          mac: client.clientMac,
          email: params.email,
          password: params.password
        };
        $http({
          method: 'post',
          url: API_END_POINT + '/guests/authenticate',
          params: data
        }).
        success(function(guest) {
          deferred.resolve(guest);
        }).
        error(function(err) {
          deferred.reject(err);
        });
      });
      return deferred.promise;
    }

    function guestCreate(params) {
      var deferred = $q.defer();
      Client.details().then(function(client) {
        var data = {
          guest: {
            mac: client.clientMac,
            email: params.email,
            password: params.password
          }
        };
        $http({
          method: 'post',
          url: API_END_POINT + '/guests',
          params: data
        }).
        success(function(guest) {
          deferred.resolve(guest);
        }).
        error(function(err) {
          deferred.reject(err);
        });
      });
      return deferred.promise;
    }

    function guestReset(params) {
      var deferred = $q.defer();
      Client.details().then(function(client) {
        var data = {
          guest: {
            mac: client.clientMac,
            email: params.email,
            host: $location.host()
          }
        };
        $http({
          method: 'post',
          url: API_END_POINT + '/guests/reset_password',
          params: data
        }).
        success(function(guest) {
          deferred.resolve(guest);
        }).
        error(function(err) {
          deferred.reject(err);
        });
      });
      return deferred.promise;
    }

    function guestUpdatePassword(params) {
      var deferred = $q.defer();
        var data = {
          token: params.token,
          password: params.password,
        };
        $http({
          method: 'post',
          url: API_END_POINT + '/logins/password',
          params: data
        }).
        success(function(guest) {
          deferred.resolve(guest);
        }).
        error(function(err) {
          deferred.reject(err);
        });
      // });
      return deferred.promise;
    }

    function reporter() {
      var deferred = $q.defer();
      Client.details().then(function(client) {
        var data = {
          request_uri: client.requestUri,
          mac: client.clientMac,
          ap_mac: client.apMmac,
          api_url: API_END_POINT
        };
        $http({
          method: 'post',
          url: '/api/v1/packer',
          params: data
        }).
        success(function() {
        });
      });
      deferred.resolve();
      return deferred.promise;
    }

    function status() {
      var deferred = $q.defer();
      if ($rootScope.deviceId === '1') {
        Coova.status().then(function(res) {
          if (res.clientState === 0) {
            deferred.resolve(res);
          } else {
            var msg = 'You\'re already logged in.';
            deferred.reject(msg);
          }
        }, function(err) {
          var msg = '<h1>Connection Error </h1><p>Ensure you\'re connected to a hotspot. Unable to communicate with access point.</p>';
          deferred.reject(msg);
        });
      } else {
        var msg = 'Are you in a hotspot?';
        deferred.resolve(msg);
      }
      return deferred.promise;
    }

    function remind(email, splash_id) {
      var deferred = $q.defer();
      var data = {
        email: email,
        splash_id: splash_id
      };
      $http({
        method: 'post',
        url: API_END_POINT + '/logins/remind',
        params: data
      }).
      success(function() {
        deferred.resolve(email);
      }).
      error(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    var createOTP = function(params) {
      var deferred = $q.defer();
      Tony.create({
        splash_id:          params.splash_id,
        clientMac:          client.clientMac,
        request_uri:        client.requestUri,
        apMac:              client.apMac,
        number:             params.data.number
      }).$promise.then(function(res) {
        deferred.resolve(res);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var createLogin = function() {

      var deferred = $q.defer();
      var challenge = (loginDetails.authResp && loginDetails.authResp.challenge ) ? loginDetails.authResp.challenge : client.challenge;
      var gid = $cookies.get('_ga');
      var consentObj = {};
      var cookieName = 'gdpr-20180423';
      var email;

      if (loginDetails.email_consent === true) {
        var expireDate = new Date();
        expireDate.setMonth(expireDate.getMonth() + 1);
        var consent = {
          email: loginDetails.email_consent,
          timestamp: Date.now()
        };
        CONSENT.new = true;
        $cookies.put(cookieName, window.btoa(JSON.stringify(consent)), { expires: expireDate });
      }

      var cookies = $cookies.get('gdpr-20180423');

      if (cookies) {
        try {
          cookies = JSON.parse(window.atob(cookies));
          if (cookies.email) {
            email = loginDetails.email;
          }
        } catch (err) {
          console.log(err);
          cookies = undefined;
        }
      }

      if (CONSENT.new) {
        consentObj = cookies;
      }

      Tony.create({
        username:                 loginDetails.username,
        password:                 loginDetails.password,
        otp:                      loginDetails.otp,
        logincode:                loginDetails.logincode,
        guestId:                  loginDetails.guestId,
        splash_id:                loginDetails.splash_id,
        challenge:                challenge,
        request_uri:              client.requestUri,
        clientMac:                client.clientMac,
        clientIp:                 client.clientIp,
        apMac:                    client.apMac,
        loginUri:                 client.loginUri,
        device:                   client.device,
        token:                    loginDetails.token,
        memberId:                 loginDetails.memberId,
        expires:                  loginDetails.expires,
        email:                    email,
        newsletter:               loginDetails.newsletter,
        uamip:                    client.uamip,
        gid:                      gid,
        terms:                    consentObj.terms,
        email_consent:            consentObj.email,
        sms_consent:              consentObj.sms,
        screen_name:              loginDetails.screen_name,
        social_type:              loginDetails.type,
        data:                     JSON.stringify(loginDetails.data)

      }).$promise.then(function(res) {
        if (res.error) {
          console.log('Auth rejected:', res);
          deferred.reject(res.message);
        } else {
          var options = {username: res.username, password: res.challengeResp, state: res.clientState};
          console.log('Auth OK for', res.username || 'unknown user');
          deferred.resolve(options);
        }
      }, function(err) {
        var msg = 'Unable to log you in';
        if (err.data && err.data.message) {
          msg = err.data.message;
        }
        deferred.reject(msg);
      });
      return deferred.promise;
    };

    var finaliseLogin = function(resp) {
      var deferred = $q.defer();
      auth = resp;
      if ($rootScope.deviceId === '1') {
        coovaLogin().then(function() {
          deferred.resolve();
        }, function(err) {
          deferred.reject(err);
        });
      } else if ($rootScope.deviceId === '2') {
        return arubaLogin();
      } else if ($rootScope.deviceId === '4') {
        return ruckusLogin();
      } else if ($rootScope.deviceId === '5') {
        return hiveLogin();
      } else if ($rootScope.deviceId === '6') {
        return xirrusLogin();
      } else if ($rootScope.deviceId === '7') {
        // Doesnt do anything since we return a 1 from ct //
        // return ruckusLogin();
      } else if ($rootScope.deviceId === '8') {
        return microtikLogin();
      } else if ($rootScope.deviceId === '9') {
        return ciscoLogin();
      } else if ($rootScope.deviceId === '10') {
        return unifiLogin();
      } else if ($rootScope.deviceId === '11') {
        cloudtraxLogin().then(function() {
          deferred.resolve();
        }, function(err) {
          deferred.reject(err);
        });
      }
      return deferred.promise;
    };

    var cloudtraxLogin = function() {
      var deferred = $q.defer();
      Coova.cloudtrax({
        username: auth.username,
        password: auth.password
      }).then(function(res) {
        deferred.resolve();
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var coovaLogin = function() {
      var deferred = $q.defer();
      Coova.logon({
        uamSsl: client.uamSsl,
        username: auth.username,
        response: auth.password
      }).then(function(res) {
        if (res.clientState === 1) {
          deferred.resolve();
        } else {
          var msg = res.message || 'Unable to log you in.';
          deferred.reject(msg); // {msg: msg, res: auth});
        }
      }, function(err) {
        var msg;
        if (err.status === 0 || err.status === -1) {
          msg = 'Connection failure, check your firewall settings. Ref: #9862';
        } else if (err.status === 404) {
          // Currently get this when the radius returns a response //
          // Chilli is formatting the JSON strangely and we get into the weirdness //
          msg = 'There was a problem logging you in. Please try again';
        } else {
          msg = err;
        }
        deferred.reject(msg);
      });
      return deferred.promise;
    };

    var microtikLogin = function() {
      var deferred = $q.defer();
      auth.type = 'microtik';
      deferred.resolve();
      return deferred.promise;
    };

    var hiveLogin = function() {
    };

    var ciscoLogin = function() {
      return Cisco.login({
        username: auth.username,
        password: auth.password,
        clientMac: client.clientMac,
        uamip: client.uamip
      }).then(function() {
      });
    };

    var arubaLogin = function() {
      return Aruba.login({
        username: auth.username,
        password: auth.password,
        clientMac: client.clientMac,
        uamip: client.uamip
      }).then(function() {
      });
    };

    var unifiLogin = function() {
      var deferred = $q.defer();
      auth.type = 'unifi';
      deferred.resolve();
      return deferred.promise;
    };

    var ruckusLogin = function() {
      var deferred = $q.defer();
      auth.type = 'ruckus';
      deferred.resolve();
      return deferred.promise;
    };

    var xirrusLogin = function() {
      return Xirrus.login({
        uamip: client.uamip,
        uamport: client.uamport,
        username: auth.username,
        response: auth.password
      }).then(function() {
      });
    };

    return {
      otp: otp,
      login: login,
      logout: logout,
      status: status,
      me: me,
      init: init,
      remind: remind,
      checkin: checkin,
      reporter: reporter,
      addToCart: addToCart,
      getCart: getCart,
      guestLogin: guestLogin,
      guestCreate: guestCreate,
      guestReset: guestReset,
      guestUpdatePassword: guestUpdatePassword,
    };

  }
])

app.factory('Client', ['$routeParams', '$q', '$rootScope', '$location', '$localStorage',

  function($routeParams, $q, $rootScope, $location, $localStorage) {

    var clientMac, clientIp, apMac, redirectUri, loginUri, apTags, requestUri, challenge, uamip, uamport, uamSsl, device, ssid, type, code;
    var obj;

    var details = function() {
      var deferred = $q.defer();
      if ($location.path() === '/social') {
        clientMac = $routeParams.clientMac;
        challenge = $routeParams.challenge;
        apMac = $routeParams.apMac;
        redirectUri = $routeParams.redirectUri;
        uamip = $routeParams.uamip;
        uamport = $routeParams.uamport;
        code = $routeParams.code;
      } else if ($rootScope.deviceId === '1') {
        clientMac = $routeParams.mac;
        apMac = $routeParams.called;
        redirectUri = $routeParams.userurl;
        uamip = $routeParams.uamip;
        uamport = $routeParams.uamport;
        uamSsl = $routeParams.ssl;
      } else if ($rootScope.deviceId === '2') {
        clientMac = $routeParams.mac;
        if ( $routeParams.apname !== undefined ) {
          apMac = $routeParams.apname.split(' ')[0];
        }
        redirectUri = $routeParams.url;
        apTags = $routeParams.essid;
        uamip = $routeParams.switchip;
      } else if ($rootScope.deviceId === '3') {
        clientMac = $routeParams.client_mac;
        apMac = $routeParams.ap_mac;
        redirectUri = $routeParams.continue_url;
        loginUri = $routeParams.login_url;
        apTags = $routeParams.ap_tags;
      } else if ($rootScope.deviceId === '4') {
        uamip = $routeParams.sip;
        uamport = 9997;
        clientMac = $routeParams.client_mac;
        clientIp = $routeParams.uip;
        apMac = $routeParams.mac;
        apTags = $routeParams.lid;
      } else if ($rootScope.deviceId === '5') {
        clientMac = $routeParams['Called-Station-Id'];
        apMac = $routeParams.mac;
        apTags = $routeParams.ssid;
        uamip = $routeParams['NAS-IP-Address'];
      } else if ($rootScope.deviceId === '6') {
        clientMac = $routeParams.mac;
        apMac = $routeParams.apmac;
        apTags = $routeParams.vlan;
        challenge = $routeParams.challenge;
        uamip = $routeParams.uamip;
        uamport = $routeParams.uamport;
      } else if ($rootScope.deviceId === '7') {
        uamip = $routeParams.nbiIP;
        clientMac = $routeParams.client_mac;
        clientIp = $routeParams.uip;
        apMac = $routeParams.mac;
        apTags = $routeParams.lid;
      } else if ($rootScope.deviceId === '8') {
        uamip = $routeParams['link-login-only'];
        clientMac = $routeParams.mac_client;
        clientIp = $routeParams.ip;
        apMac = $routeParams.mac;
        device = 'routerOS';
      } else if ($rootScope.deviceId === '9') {
        clientMac = $routeParams.client_mac;
        apMac = $routeParams.ap_mac;
        uamip = $routeParams.switch_url;
      } else if ($rootScope.deviceId === '10') {
        clientMac = $routeParams.id;
        apMac = $routeParams.ap;
        ssid = $routeParams.ssid;
      } else if ($rootScope.deviceId === '11') {
        clientMac = $routeParams.mac;
        challenge = $routeParams.challenge;
        apMac = $routeParams.called;
        redirectUri = $routeParams.userurl;
        uamip = $routeParams.uamip;
        uamport = $routeParams.uamport;
        uamSsl = $routeParams.ssl;
        type = 'ctx';
      }

      obj = {
        clientMac: clientMac,
        clientIp: clientIp,
        apMac: apMac,
        redirectUri: redirectUri,
        deviceId: $rootScope.deviceId,
        loginUri: loginUri,
        uamport: uamport,
        uamip: uamip,
        apTags: apTags,
        requestUri: $location.host(),
        challenge: challenge,
        uamSsl: uamSsl,
        device: device,
        ssid: ssid,
      };

      if (obj.clientMac === undefined) {
        var client = $localStorage.searchParams;
        if ( client !== undefined ) {
          obj = JSON.parse($localStorage.searchParams);
          $rootScope.deviceId = obj.deviceId;
        }
      }

      deferred.resolve(obj);
      return deferred.promise;
    };

    return {
      details: details
    };

  }

]);


app.factory('Tony', ['$resource', 'API_END_POINT',

  function($resource, API_END_POINT){

    return $resource(API_END_POINT + '/:action/:id',
      {},
      {
      create: {
        method: 'JSONP',
        isArray: false,
        params: {
          callback: 'JSON_CALLBACK',
          username: '@username',
          password: '@password',
          splash_id: '@splash_id',
          clientMac: '@clientMac',
          challenge: '@challenge',
          request_uri: '@request_uri',
          login_uri: '@loginUri',
          type: 'create', // important for CT and JSONP
          action: 'logins',
          terms: '@terms',
          email_consent: '@email_consent',
          sms_consent: '@sms_consent',
        }
      },
      addToCart: {
        method: 'POST',
        isArray: false,
        params: {
          login_uri: '@loginUri',
          action: 'store_carts',
          product_ids: '@product_ids',
          store_id: '@store_id'
        }
      },
      getCart: {
        method: 'GET',
        isArray: false,
        params: {
          login_uri: '@loginUri',
          action: 'store_carts',
          id: '@id'
        }
      }

  });

}]);

app.factory('Ping', ['$http', '$q',

  function($http, $q){

    var ct = function(params) {

      $http.defaults.headers.common = {};
      $http.defaults.headers.post = {};

      var d = Date.now();

      var request = $http({
        method: 'GET',
        timeout: 3000,
        url: 'https://api.ctapp.io/api/v1/ping.json',
        params: {
          q: d
        }
      });

      return( request.then( handleSuccess, handleError ) );
    };

    var handleError = function(err) {
      return( err );
    };

    var handleSuccess = function(response) {
      return( response );
    };

    return {
      ct: ct
    };

}]);

app.factory('CTDebug', [function() {
  return { active: false, messages: [], count: 0 };
}]);

app.factory('DebugMe', ['$routeParams', function($routeParams) {

  var active = function() {
    if ($routeParams.debug  === 'true' || window.location.hostname === 'debug.my-wifi.co' || window.location.hostname === 'debug.my-wifi.dev') {
      return true;
    }
  };

  return { active: active() };
}]);

app.factory('CTDebugger', ['CTDebug', '$rootScope', '$routeParams', '$cookies', function(CTDebug, $scope, $routeParams, $cookies) {

  var debugging = function () {

    var methods, generateNewMethod, i, j, cur, old, addEvent;

    if ('console' in window) {
      methods = [
        'log', 'assert', 'clear', 'count"',
        'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed',
        'groupEnd', 'info', 'profile', 'profileEnd',
        'table', 'time', 'timeEnd', 'timeStamp',
        'trace', 'warn'
      ];

      generateNewMethod = function (oldCallback, methodName) {
        return function () {
          var c = $scope.debug.count++;
          var args = JSON.stringify(arguments[0]);
          if ( args !== JSON.stringify({}) ) {
            var msg = Date.now() + '-' + c + ': ' + args;
            $scope.debug.messages.push(msg);
            if(!$scope.$$phase) {
              $scope.$digest();
            }
          }
        };
      };

      for (i = 0, j = methods.length; i < j; i++) {
        cur = methods[i];
        if (cur in console) {
          old = console[cur];
          console[cur] = generateNewMethod(old, cur);
        }
      }
    }
  };

  var debug = function() {

    $scope.debug = CTDebug;
    if ($scope.debug.active !== true) {
      $scope.debug.active = true;
      debugging($scope.debug);
      console.log(navigator.platform + ' ' + navigator.userAgent);
      console.log($routeParams);
      console.log($cookies.getAll());
    }
  };

  return {
    debug: debug
  };

}]);
