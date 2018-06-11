'use strict';

var app = angular.module('ctLoginsApp.logins.directives', []);

app.directive('formCode', ['$q', '$sce', '$timeout', 'Client', '$routeParams', '$location', '$window', '$compile', '$localStorage', '$rootScope', 'CT', '$cookies',
  function($q, $sce, $timeout, Client, $routeParams, $location, $window, $compile, $localStorage, $rootScope, CT, $cookies) {

  var link = function(scope,element,attrs) {

    scope.otp = { cc: '+44' };
    scope.user = {};

    var otpEnabled = function() {
      var o = $cookies.get('mimo-otp');
      if (o) {
        scope.otp.active = true;
        scope.access.sms_access = true;
      }
    };

    var cleanUp = function() {
      $rootScope.bodylayout   = undefined;
      scope.state.hidden      = undefined;
      scope.state.status      = undefined;
      scope.password          = undefined;
      scope.username          = undefined;
      scope.logincode         = undefined;
      scope.error             = undefined;
    };

    function redirect() {
      $timeout(function() {
        redirectUser()
      },1500);
    }

    var redirectUser = function() {
      var redirectTo;
      if (attrs.redirects !== undefined && attrs.redirects !== '') {
        var redirects = JSON.parse(attrs.redirects);
        if (redirects.show_welcome ) {
          $location.path('/welcome');
        } else {
          if (redirects.success_url !== '' && redirects.success_url !== null) {
            redirectTo = redirects.success_url;
          } else {
            redirectTo = 'https://www.google.com/';
          }
          $window.location.href = redirectTo;
        }
      }
      redirectTo = 'https://www.google.com/';
      $window.location.href = redirectTo;
    };

    var finishLogin = function() {
      cleanUp();
      scope.success = true;
      redirectUser();
    };

    var loginRuckus = function(auth) {
      Client.details().then(function(client) {
        var openUrl = 'http://' + client.uamip + ':' + client.uamport +'/login?username='+ auth.username +'&password=' + auth.password;
        scope.detailFrame =  $sce.trustAsResourceUrl(openUrl);
        $timeout(function() {
          finishLogin();
        },2000);
      });
    };

    var doSocialLogin = function(response) {
      var deferred = $q.defer();
      var params = {
        token:          $routeParams.code,
        newsletter:     attrs.newsletter,
        email:          $routeParams.email,
        screen_name:    $routeParams.screen_name,
        type:           $routeParams.type
      };

      CT.login(params).then(function(a) {
        if (a !== undefined && a.type === 'ruckus') {
          loginRuckus(a).then(function(b) {
            deferred.resolve(1);
          });
        } else {
          deferred.resolve(1);
        }
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var finaliseSocial = function() {
      doSocialLogin().then(function(a) {
        redirect();
      }, function(err) {
        $rootScope.banneralert = 'banner-alert alert-box alert';
        $rootScope.error = err.msg || err || 'Unknown error logging in';
        scope.processing = undefined;
      });
    };

    var socialLoginMsg = function() {
      var template = '<div class=\'small-12 medium-centered columns alert-box success\'>Logging you in, hold tight...</div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
      cleanUp();
    };

    scope.access = {};

    scope.back = function() {
      scope.access.sms_access = undefined;
      scope.access.email_access = undefined;
      scope.access.password_access = undefined;
      scope.access.voucher_access = undefined;
      scope.access.code_access = undefined;
      scope.otp.active = undefined;
      $cookies.remove('mimo-otp');
    };

    scope.doCheckin = function(msg) {

      socialLoginMsg();

      if (!msg) {
        finaliseSocial();
        return;
      }

      var params = {};
      params.pageId = attrs.fbPageId;
      params.token = $routeParams.code;
      params.message = msg;
      CT.checkin(params).then(function() {
        finaliseSocial();
      }, function(err) {
        // Login, even if fail
        console.log(err);
        finaliseSocial();
      });
    };

    function addCheckinForm() {
      var user = {};
      var template =
        '<div class=\'small-12 medium-12 large-8 medium-centered columns\'>'+
        '<label for=\'checkin\'><b>Tell Your Friends You\'re Here!</b></label>'+
        '<textarea autofocus ng-model=\'message\' rows=4 placeholder=\'Post an update on your wall.\'></textarea>'+
        '<p>Leave blank if you just want to login.</p>'+
        '<p><button ng-disabled=\'checkin\' ng-click=\'doCheckin(message)\'><span ng-hide=\'checkin\'>Login Now</span> <span ng-if=\'checkin\'>Checking in <i class="fa fa-spinner fa-pulse"></i></span> </button></p>' +
        '</div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
      cleanUp();
    }

    var onSuccessOTP = function() {
      $rootScope.banneralert = undefined;
      $rootScope.error = undefined;

      var expireDate = new Date(new Date().getTime() + 5*60000);
      $cookies.put('mimo-otp', 1, { expires: expireDate });
      scope.otp.active = true;
    };

    var onFailOTP = function(resp) {
      var msg = 'Unknown SMS error, please try again or contact the location.';
      if (resp.error && resp.message && resp.message !== '' && resp.message !== undefined) {
        msg = resp.message;
      }
      $rootScope.banneralert = 'banner-alert alert-box alert';
      $rootScope.error = msg;
      scope.otp.number = undefined;
    };

    var onSuccess = function(auth) {
      scope.otp = { cc: '+44' };
      $cookies.remove('mimo-otp');

      if ( auth !== undefined && auth.type === 'ruckus' ) {
        loginRuckus(auth);
      } else {
        finishLogin();
      }
    };

    var onFail = function(err) {
      scope.loggingIn = undefined;
      cleanUp();
      $rootScope.banneralert = 'banner-alert alert-box alert';
      $rootScope.error = err;
      chooseForm();
    };

    var socialCheckin = function() {
      addCheckinForm();
    };

    var socialLogin = function() {
      socialLoginMsg();

      doSocialLogin().then(function(a) {
        redirect();
      }, function(err) {
        $rootScope.banneralert = 'banner-alert alert-box alert';
        $rootScope.error = err.msg || err || 'Unknown error logging in';
        scope.processing = undefined;
      });
    };

    var addSocialLogin = function() {
      if (attrs.fbCheckin === 'true' && $routeParams.type === 'fb') {
        socialCheckin();
        return;
      }

      if (attrs.twTweet === 'true') {
        // twitter message
        return;
      }

      socialLogin();
    };

    var chooseForm = function() {
      if ($location.path() === '/social') {
        addSocialLogin();
        return;
      }

      if (attrs.registration === 'true') {
        if (attrs.code) {
            try {
              scope.data = JSON.parse(attrs.code);
            } catch(e){
              scope.data = 'Nothing to be seen';
            }
        }
        addReg();
        return;
      }

      addForm();
    };

    var init = function() {
      CT.status().then(function(res) {
        chooseForm();
        scope.email_required  = (attrs.emailRequired === 'true');
        scope.newsletter      = (attrs.newsletter === 'true') || scope.email_required;
        scope.reqreg          = (attrs.reqreg === 'true');
        scope.btn_text        = (attrs.btntext || 'Submit');

        if (attrs.terms !== 'true') {
          scope.show_terms = true;
        }

        if (attrs.unified === 'true') {
          scope.show_unified = true;
        }

        otpEnabled();

      }, function(err) {
        scope.state.status = undefined;
        scope.state.hidden = undefined;
        scope.state.errors = err;
        $rootScope.bodylayout = 'login-error';
      });
    };

    var addReg = function() {
      var template =
        '<div ng-hide=\'login == true\'>'+
        '<div ng-show=\'reqreg == true && show_reg_login\'>'+
        '<form name=\'myForm\'>'+
        '<label>Email Address</label>'+
        '<input ng-model=\'username\' name=\'username\' type=\'email\' placeholder=\'Enter your registered email\' required></input>'+
        '<p ng-show=\'myForm.username.$error.required\'><small>Email is invalid.</small></p>'+
        '<label>Password</label>'+
        '<input ng-model=\'password\' name=\'password\' type=\'password\' placeholder=\'Enter your password\' required></input>'+
        '<p ng-show=\'myForm.password.$error.required\'><small>Password is required.</small></p>'+
        '<p><button ng-disabled="myForm.$invalid" ng-click="submit()">Login</button></br>' +
        '<a href=\'\' ng-click=\'show_reg_login = !show_reg_login\'>Sign-up Now.</a></p>'+
        '</form>'+
        '</div>'+
        '<div ng-hide=\'show_reg_login\'>'+
        '<h3>{{ data.message }}</h3>'+
        '<form name="loginForm" novalidate>'+
        '<div ng-form="sF_{{$index}}" ng-repeat="field in data.fields | orderBy: \'order\'" class=\'reg-fields\'>' +
        '<label class="ct-label" ng-hide="field.field_type == \'checkbox\' || field.label == \'hidden\'">{{ field.label }}</label>'+
        '<span ng-hide="field.field_type == \'radio\'">'+
        '<input ng-show=\'field.field_type != "textarea"\' type="{{ field.field_type }}" ng-model="field.value" name="input_{{$index}}_0" ng-required="field.required" ng-class="{ \'has-error\' : loginForm.sF_{{$index}}.input_{{$index}}_0.$invalid }" placeholder=\'Enter your {{ field.name == "username" ? "email" : field.name }}\'></input>' +
        '<label ng-show="field.field_type == \'checkbox\'">{{ field.label }}</label>'+
        '<textarea rows=\'5\' ng-show=\'field.field_type == "textarea"\' rows=\'3\' type="{{ field.field_type }}" ng-model="field.value" name="input_{{$index}}_0" ng-required="field.required" ng-class="{ \'has-error\' : loginForm.sF_{{$index}}.input_{{$index}}_0.$invalid }" placeholder=\'Enter your {{ field.name }}\'></textarea>' +
        '<p class="required"><span ng-show="loginForm.sF_{{$index}}.input_{{$index}}_0.$error.required">{{ field.name | sentenceCase }} is required</span></p>'+
        '</span>'+
        '<span ng-show="field.field_type == \'radio\'">'+
        '<span id="radio_container_{{$index}}" ng-repeat="attr in field.attrs">'+
        '<input type="radio" ng-model="field.value" value="{{attr}}" id="radio_inner_{{ attr }}_{{ $index }}">'+
        '<label for="radio_inner_{{ attr }}_{{$index}}" class="ct-label" ><span></span>{{attr}}</label>'+
        '</span>'+
        '</div>'+
        '<div class=\'break\'></div>'+
        '<button ng-disabled="loginForm.$invalid" class="btn" ng-click="submit(data)">{{ btn_text }}</button>' +
        '<p ng-show="reqreg == true"><a href=\'\' ng-click=\'show_reg_login = !show_reg_login\'>Already registered? Login now.</a></p>'+
        '</form>' +
        '</div>' +
        '</div>';

      var templateObj = $compile(template)(scope);
      element.html(templateObj);
      cleanUp();
    };

    var addForm = function() {
      scope.code = attrs.code;
      var template =
        '<iframe style="display: none;" width="0" height="0" ng-src="{{detailFrame}}"></iframe>'+
        '<div ng-show=\'preview\' class=\'alert-box\'><small>{{ preview }}</small></div>'+
        '<div ng-hide=\'disabled || success\'>'+
        '<div ng-hide=\'login == true\'>' + scope.code + '</div>'+
        '</div>';

      var templateObj = $compile(template)(scope);
      element.html(templateObj);
      cleanUp();
    };

    scope.create_otp = function(myForm) {
      if (myForm) {
        myForm.$setPristine();
      }

      var number = scope.otp.cc + scope.otp.number;
      CT.otp({
        data: { number: number },
        splash_id: $routeParams.splash_id || $rootScope.splash.splash_id
      }).then(onSuccessOTP, onFailOTP);
    };

    scope.submit = function(custom_data) {

      scope.loggingIn = true;
      if ($routeParams.preview === 'true') {
        scope.preview = 'This is just a preview, you cannot actually login.';
        return;
      }

      if (scope.otp.password) {
        scope.password = scope.otp.password;
        scope.otp_login = true;
      } else if (scope.user.password) {
        scope.password = scope.user.password;
        if (scope.user.username) {
          scope.username = scope.user.username;
        }
      }

      if (scope.access) {
        scope.email_consent = scope.access.email_consent;
      }

      scope.error = undefined;
      $rootScope.banneralert = undefined;
      $rootScope.error = undefined;
      scope.state.hidden = true;
      scope.state.status = 'login';
      if (custom_data && custom_data.fields) {
        scope.fields = custom_data.fields;
      }

      CT.login({
        email:      scope.email || scope.user.email,
        username:   scope.username,
        password:   scope.password,
        logincode:  scope.logincode,
        newsletter: scope.newsletter,
        splash_id:  $routeParams.splash_id || $rootScope.splash.splash_id,
        data:       scope.fields,
        otp:        scope.otp_login,
        email_consent: scope.email_consent
      }).then(onSuccess, onFail);
    };

    attrs.$observe('code', function(val){
      if (val !== '' ) {
        init();
      }
    });

  };

  return {
    link: link,
    scope: {
      code: '@',
      redirects: '@',
      state: '=',
      emailRequired: '@',
      newsletter: '@',
      registration: '@',
      reqreg: '@',
      terms: '@',
      btntext: '@',
      fbCheckin: '@',
      fbPageId: '@',
      gPageId: '@',
      twSendTweet: '@',
      twHandle: '@'
    },
  };

}]);

app.directive('welcome', ['$routeParams', '$rootScope', '$location', '$window', 'Login', '$timeout', 'Client', function($routeParams, $rootScope, $location, $window, Login, $timeout, Client) {

  var link = function(scope,element,attrs) {

    // scope.loading = true;

    function init() {
      Client.details().then(function(client) {
        Login.welcome({request_uri: client.requestUri, apMac: client.apMac, clientMac: client.clientMac}).$promise.then(function(results) {
          cleanUp();
          scope.welcome = results.welcome;
          if (results.timeout > 0) {
            var timeout = results.timeout * 1000;
            var redirectTo = results.success_url || 'https://google.com';
            $timeout(function() {
              $window.location.href = redirectTo;
            },timeout);
          }
        });
      });

    }

    var cleanUp = function() {

      $rootScope.bodylayout = undefined;
      scope.state.hidden = undefined;
      scope.state.status = undefined;
      scope.password = undefined;
      scope.username = undefined;
      scope.error = undefined;

    };

    scope.$watch('routeParams', function(newVal, oldVal) {
      init();
    });

  };

  return {
    link: link,
    replace: true,
    scope: false,
    template: '<div><p ng-bind-html="welcome"></p></div>'
  };

}]);

app.directive('forgotPassword', ['$timeout', '$location', '$compile', 'CT', function($timeout,$location,$compile,CT) {

  var link = function(scope,element,attrs) {

    scope.init = function() {
      scope.remind = undefined;
      scope.email  = undefined;
      var template = '<div><p><b><a href=\'\' ng-click=\'showForm()\'>Forgot your details?</a></b></p></div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    };

    scope.sendReminder = function(email, splash_id) {
      scope.reminding = true;
      CT.remind(email, splash_id).then(function(res) {
        scope.reminded = true;
        $timeout(function() {
          scope.reminding = undefined;
          scope.reminded  = undefined;
          scope.init();
        },2000);
      }, function() {
        scope.errors = true;
        scope.remind = undefined;
      });
    };

    scope.showForm = function() {
      scope.remind = true;
      scope.splash_id = attrs.splashId;
      var template =
        '<div class=\'row\'>'+
        '<div class=\'small-12 medium-8 columns medium-centered\'>'+
        '<div ng-show=\'reminded\'>'+
        '<div class=\'alert-box success\'>'+
        'Reminder email send. It shouldn\'t take long.'+
        '</div>'+
        '</div>'+
        '<div ng-show=\'errors\'>'+
        '<div class=\'alert-box alert\'>'+
        'There was an error, try again later.'+
        '</div>'+
        '</div>'+
        '<form name=\'myForm\' ng-submit=\'sendReminder(email,splash_id)\'>'+
        '<label>Enter the email you signed-up with</label>'+
        '<input type=\'email\' ng-model=\'email\' placeholder=\'Enter the email you signed-up with\' autofocus required></input>'+
        '<br>'+
        '<button ng-disabled=\'myForm.$invalid || myForm.$pristine\' class=\'button btn small default\'>Remind me <span ng-if=\'reminding\'><i class="fa fa-cog fa-spin"></i></span></button>'+
        '<p><a href=\'\' ng-click=\'init()\'>Cancel</a></p>'+
        '</form>'+
        '</div>'+
        '</div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    };

    attrs.$observe('active', function(val){
      if (val !== '' && val === 'true') {
        scope.init();
      }
    });
  };

  return {
    link: link,
    scope: {
      active: '@',
      splash_id: '@',
      remind: '='
    }
  };

}]);

app.directive('loginsPartial', ['$location', function($location) {
  var link = function(scope, element, attrs) {
    scope.partial = function() {
      if ($location.path() === '/shop') {
        return 'components/logins/_shop.html';
      }

      return 'components/logins/_form.html';
    };
  };

  return {
    link: link,
    scope: true,
    template: '<div ng-include="partial()" ng-hide=\'initialising\'></div>'
  };

}]);

app.directive('displayStore', ['CT', '$cookies', '$rootScope', '$location', '$window', 'Order', 'Client', '$localStorage', '$q', function(CT, $cookies, $rootScope, $location, $window, Order, Client, $localStorage, $q) {

  var link = function(scope, element, attrs) {

    scope.customer = {};

    attrs.$observe('id', function(val){
      if (val !== '' ) {
        loadShop();
        cleanUp();
        // scope.state.status = undefined;
      }
    });

    function loadShop() {
      scope.cartId = $cookies.get('cartId');
      if (scope.cartId === undefined) {
        scope.showcart = true;
      } else {
        scope.getCart();
      }
    }

    scope.getCart = function() {
      CT.getCart($cookies.get('cartId')).then(function(res) {
        scope.cart = res;
        scope.showcart = true;

        if (scope.cart.store.merchant_type === 'stripe') {
          loadStripe();
        }
        sliceProducts(scope.cart.products[0]._id);
      }, function() {
        scope.showcart = true;
      });
    };

    function sliceProducts(id) {
      for (var i = 0; i < scope.products.length; ++i) {
        if (scope.products[i]._id === id) {
          scope.products.splice(i, 1);
        }
      }
    }

    scope.addToCart = function(id) {
      scope.adding = id;
      CT.addToCart({store_id: attrs.id, product_ids: id}).then(function(res) {
        if (res && res.cart) {
          scope.cartId = true;
          addProductToCart(res);
          scope.cart = res;
          if (scope.cart.store.merchant_type === 'stripe' && !scope.stripe_loaded) {
            loadStripe();
          }
        } else {
          scope.cartId = undefined;
          wipeCart();
        }
      }, function(err) {
        $rootScope.banneralert = 'banner-alert alert-box alert';
        $rootScope.error = 'Something\'s gone wrong.';
        scope.cart = { errors: err };
        scope.adding = undefined;
      });
    };

    function addProductToCart(res) {
      $rootScope.banneralert = 'banner-alert alert-box success';
      $rootScope.error = 'Voucher added to cart.';
      if (scope.cart !== undefined && scope.cart.products !== null) {
        scope.products.push(scope.cart.products[0]);
      }
      scope.cart = { products: res.products, cart: { cart_id: res.cart.cart_id } };
      scope.showstore = undefined;
      scope.showcart = true;
      sliceProducts(scope.cart.products[0]._id);
    }

    function wipeCart() {
      $rootScope.banneralert = 'banner-alert alert-box success';
      $rootScope.error = 'That\'s gone well. We\'ve emptied your cart.';
      scope.cart = undefined;
      scope.showcart = true;
    }

    scope.emptyCart = function() {
      scope.products.push(scope.cart.products[0]);
      scope.addToCart();
    };

    scope.paypal = function() {
      Client.details().then(function(client) {
        $localStorage.searchParams = JSON.stringify(client);
        scope.redirecting = true;
        var return_url = $location.protocol() + '://' + $location.host() + '/confirm';
        Order.create({clientMac: client.clientMac, return_url: return_url, cart_id: scope.cart.cart.cart_id }).$promise.then(function(results) {
          $window.location.href = results.response;
        });
      });
    };

    var loadStripe = function() {
      if (scope.stripe_loaded === undefined) {
        var src = 'https://checkout.stripe.com/checkout.js';
        $.getScript( src, function( data, textStatus, jqxhr ) {
          scope.stripe_loaded = true;
          configureStripe();
        });
      }
    };

    var handler;
    var configureStripe = function() {
      handler = StripeCheckout.configure({
        key: scope.cart.store.token_stripe,
        locale: 'auto',
        token: function(token) {
          scope.stripe = true;
          scope.stripeProcess(token);
        },
        closed: function() {
          scope.cart.state = undefined;
          scope.showcart = true;
          scope.$digest();
        }
      });
      scope.$digest();
    };

    scope.stripeProcess = function(token) {
      createOrder(token);
    };

    var createOrder = function(token) {
      Client.details().then(function(client) {
        Order.create({clientMac: client.clientMac, cart_id: scope.cart.cart.cart_id, email: token.email, card: token.id }).$promise.then(function(results) {
          scope.showcart = undefined;
          scope.stripe = undefined;
          scope.vouchers = results.response;
          scope.cart.state = 'complete';
          $cookies.remove('cartId');
        }, function(err) {
          console.log('Order creation error:', err);
          scope.stripe = undefined;
          $rootScope.banneralert = 'banner-alert alert-box alert';
          $rootScope.error = 'There was a problem processing your order.';
          scope.cart.state = undefined;
          $cookies.remove('cartId');
        });
      });
    };

    scope.stripePayment = function() {
      $rootScope.banneralert = undefined;
      if (handler) {
        handler.open({
          name: 'WiFi Access',
          description: scope.cart.products.length + ' Internet voucher',
          currency: scope.cart.store.currency || 'gbp',
          amount: scope.cart.cart.total
        });
      }
      scope.cart.state = 'processing';
      scope.showcart = undefined;
    };

    scope.saveSage = function() {
      scope.redirecting = true;
      Client.details().then(function(client) {
        var return_url = $location.protocol() + '://' + $location.host() + '/confirm';
        $cookies.put('email', scope.customer.email);
        Order.create({clientMac: client.clientMac, return_url: return_url, cart_id: scope.cart.cart.cart_id, customer: scope.customer}).$promise.then(function(results) {
          $localStorage.searchParams = JSON.stringify(client);
          window.location.href = results.response;
        }, function(err) {
          console.log(err);
        });
      });
    };

    scope.loginNow = function() {
      scope.loggingIn = true;
      guestLogin().then(function(a) {
        $window.location.href = 'http://google.com';
      }, function(err) {
        $rootScope.banneralert = 'banner-alert alert-box alert';
        $rootScope.error = err;
      });
    };

    function guestLogin() {
      var deferred = $q.defer();
      var username, password;
      if (scope.vouchers !== undefined && scope.vouchers.length > 0) {
        username = scope.vouchers[0].username;
        password = scope.vouchers[0].password;
      }
      CT.login({username: username, password: password}).then(function(res) {
        deferred.resolve();
      }, function(err) {
        console.log(err);
        deferred.reject('We were unable to log you in, go back to the home page and try again.');
      });
      return deferred.promise;
    }


    var cleanUp = function() {
      $rootScope.bodylayout = undefined;
      scope.state.hidden = undefined;
      scope.state.status = undefined;
      scope.error = undefined;
    };

  };

  return {
    link: link,
    scope: false,
    templateUrl: 'components/logins/_display_store.html'
  };

}]);

app.directive('buildPage', ['$location', '$compile', '$window', '$rootScope', '$timeout', function($location, $compile, $window, $rootScope, $timeout) {

  var link = function(scope, element, attrs) {

    var buildPage = function(data) {

      var head = angular.element('head');
      var template;

      template =

        'html {' +
        '\tbackground: url({{ splash.background_image_name }}) no-repeat center center fixed;\n' +
        '\t-webkit-background-size: cover;\n' +
        '\t-moz-background-size: cover;\n' +
        '\t-o-background-size: cover;\n'+
        '\tbackground-size: cover;\n'+
        '\tbackground-color: {{splash.background_image_name ? \'transparent\' : splash.body_background_colour}}!important;\n'+
        '}\n\n'+

        'body {\n'+
        '\tmargin-top: 0px;\n'+
        '\tfont-family: {{ splash.font_family }}!important;\n' +
        '}\n\n'+

        'h1 {\n'+
        '\tfont-size: {{ splash.heading_text_size}};\n'+
        '\tcolor: {{ splash.heading_text_colour}};\n'+
        '}\n\n'+

        'h2 {\n'+
        '\tfont-size: {{ splash.heading_2_text_size}};\n'+
        '\tcolor: {{ splash.heading_2_text_colour}};\n'+
        '\tline-height: 1.3em;\n'+
        '\tmargin-bottom: 20px;\n'+
        '}\n\n'+

        'h3 {\n'+
        '\tfont-size: {{ splash.heading_3_text_size}};\n'+
        '\tcolor: {{ splash.heading_3_text_colour}};\n'+
        '\tline-height: 1.3em;\n'+
        '}\n\n'+

        'p {\n'+
        '\tfont-size: {{ splash.body_font_size }}!important;\n'+
        '\tcolor: {{ splash.body_text_colour }};\n'+
        '}\n\n'+

        'label {\n'+
        '\tfont-size: {{ splash.body_font_size }}!important;\n'+
        '\tcolor: {{ splash.body_text_colour }};\n'+
        // '\tmargin-bottom: 10px!important;\n'+
        '}\n\n'+

        'a {\n'+
        '\tcolor: {{splash.link_colour}};\n'+
        '}\n\n'+

        '.btn, button {\n'+
        '\tdisplay: inline-block;\n'+
        '\ttext-align: center;\n'+
        '\tvertical-align: middle;\n'+
        '\tcursor: pointer;\n'+
        '\tbackground-image: none;\n'+
        '\tborder: 1px solid transparent;\n'+
        '\twhite-space: nowrap;\n'+
        '\tline-height: 1.428571429;\n'+
        '\tborder-radius: 0px;\n'+
        '\t-webkit-user-select: none;\n'+
        '\t-moz-user-select: none;\n'+
        '\t-ms-user-select: none;\n'+
        '\t-o-user-select: none;\n'+
        '\tuser-select: none;\n'+
        '\tfont-size: {{ splash.btn_font_size }}!important;\n'+
        '\tcolor: {{splash.btn_font_colour}}!important;\n'+
        '\tmargin: 10px 0 15px 0;\n'+
        '\tpadding: {{ splash.button_padding }}!important;\n'+
        '\tline-height: {{ splash.button_height || "50px" }}!important;\n'+
        '\theight: {{ splash.button_height || "50px" }}!important;\n'+
        '\tborder-radius: {{ splash.button_radius }};\n'+
        '\tbackground-color: {{splash.button_colour}};\n'+
        '\tborder-color: {{ splash.button_border_colour }};\n'+
        '}\n\n'+

        'button.disabled, button[disabled], .button.disabled, .button[disabled] {\n'+
        '\tbackground-color: {{splash.button_colour}};\n'+
        '\tborder-color: {{ splash.button_border_colour }};\n'+
        '\topacity: 0.8;\n'+
        '}\n\n'+

        'button.disabled:hover, button.disabled:focus, button[disabled]:hover, button[disabled]:focus, .button.disabled:hover, .button.disabled:focus, .button[disabled]:hover, .button[disabled]:focus, button:hover, button:focus, .button:hover, .button:focus {\n'+
        '\tbackground-color: {{splash.button_colour}};\n'+
        '\tborder: 1px solid {{ splash.button_border_colour || \'#000\'}};\n'+
        '\topacity: 0.9;\n'+
        '}\n\n'+

        'small, .small {\n'+
        '\tfont-size: 11px;\n'+
        '}\n\n'+

        '.container {\n'+
        '\tfloat: {{ splash.container_float }}!important;\n'+
        '}\n\n'+

        '.splash-container {\n'+
        '\ttext-align: {{ splash.container_text_align }}!important;\n'+
        '\tpadding: 0px 0 0 0;\n'+
        '\tmargin: 0 auto;\n'+
        '\tmax-width: {{ splash.container_width }};\n'+
        '\twidth: 98%;\n'+
        '}\n\n'+

        '.inner_container {\n'+
        '\tborder-radius: {{ splash.container_inner_radius }};\n'+
        '\ttext-align: {{ splash.container_text_align }};\n'+
        '\tborder: 1px solid {{ splash.border_colour || \'#CCC\' }};\n'+
        '\tbackground-color: {{ splash.container_colour }}!important;\n'+
        '\topacity: {{ splash.container_transparency }};\n'+
        // '\tpadding: 20px 10px;\n'+
        '\twidth: {{splash.container_inner_width}};\n'+
        '\tmin-height: 100px;\n'+
        '\tdisplay: block;\n'+
        '\tpadding: {{ splash.container_inner_padding }};\n'+
        '\tbox-shadow: {{splash.container_shadow ? \'0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);\' : \'0 0px 0px rgba(0,0,0,0.0)\'}};\n'+
        '}\n\n'+

        '.footer {\n'+
        '\tdisplay: block;\n'+
        '\tpadding: 10px 0;\n'+
        '\tfont-size: 10px;\n'+
        '\tline-height: 18px;\n'+
        '\twidth: {{splash.container_inner_width}};\n'+
        '\tcolor: {{splash.footer_text_colour}};\n'+
        '}\n\n'+

        '.footer a {\n'+
        '\tcolor: {{splash.footer_text_colour}}!important;\n'+
        '}\n\n'+

        '.location_logo {\n'+
        '\ttext-align: {{ splash.logo_position }};\n'+
        '\tmargin: 0 0px 20px 0px;\n'+
        '}\n\n'+

        '.location_logo img {\n'+
        '\tmax-width: 220px;\n'+
        '}\n\n'+

        '.social {\n'+
        '\tmargin: 10px;\n'+
        '}\n\n'+

        '.social img {\n'+
        '\twidth: 32px;\n'+
        '\theight: 32px;\n'+
        '}\n\n'+

        '#container-c1 {\n'+
        '\tpadding: 0px 0px 0 0px;\n'+
        '}\n\n' +

        '.skinny-c1 {\n'+
        '\twidth: {{splash.container_inner_width}};\n'+
        '\tmargin: 0 auto;\n'+
        '}\n\n' +

        '#container-c2 {\n'+
        '\tdisplay: {{ splash.design_id === 2 ? \'block\' : \'none\' }};\n'+
        'float: left;\n' +
        '\tpadding-top: 15px;\n'+
        '}\n\n' +

        '.btn {\n' +
        '\tmargin-top: 10px!important;\n'+
        '}\n\n'+

        '.columns {\n' +
        // '\tpadding-left: 5px!important;\n'+
        // '\tpadding-right: 5px!important;\n'+
        '}\n\n'+

        'p.required {\n'+
        '\tmargin-top: -10px;\n'+
        '\tfont-size: {{ splash.input_required_size }}!important;\n'+
        '\tcolor: {{ splash.input_required_colour }};\n'+
        '}\n\n'+

        'input, textarea {\n'+
        '\tmax-width: {{ splash.input_max_width }}!important;\n' +
        '\tpadding: {{ splash.input_padding}}!important;\n' +
        '\tborder: {{ splash.input_border_width}} solid {{ splash.input_border_colour}}!important;\n' +
        '\tborder-radius: {{ splash.input_border_radius }}!important;\n' +
        '\tbox-shadow: inset 0 0px 0px rgb(255, 255, 255)!important;\n' +
        '\tbackground-color: {{ splash.input_background }}!important;\n'+
        '\tborder-width: {{ splash.input_border_width }}!important;\n'+
        '\tborder-color: {{ splash.input_border_colour }}!important;\n'+
        '\tmargin: 0 0 0.5rem 0px!important;\n'+
        '\tcolor: {{ splash.input_text_colour }}!important;\n'+
        '}\n\n' +

        'input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {\n'+
        '\tcolor: {{ splash.input_text_colour }}!important;\n'+
        '}\n\n' +

        'input::-moz-placeholder, textarea::-moz-placeholder {\n'+
        '\tcolor: {{ splash.input_text_colour }}!important;\n'+
        '}\n\n' +

        'input:-ms-input-placeholder, textarea:-ms-input-placeholder {\n'+
        '\tcolor: {{ splash.input_text_colour }}!important;\n'+
        '}\n\n' +

        'input[type=text], input[type=password], input[type=email], textarea {\n'+
        '\theight: {{ splash.input_height }}!important;\n'+
        '\tline-height: {{ splash.input_height }}!important;\n'+
        '}\n\n' +

        'textarea {\n'+
        '\tpadding: 10px!important;\n' +
        '\theight: auto!important;\n'+
        '\tresize: vertical!important;\n'+
        '\tline-height: 1em!important;\n'+
        '}\n\n' +

        'input[type="checkbox"], input[type=radio] {\n'+
        // '\tmargin: {{ splash.container_inner_padding }};\n'+
        // '\theight: 12px!important;\n'+
        // '\tline-height: 12px!important;\n'+
        '}\n\n'+

        '#popup_ad {\n'+
        '\tbackground: {{ splash.popup_background_colour }};\n'+
        '}\n\n'+

        '#popup_ad .button {\n'+
        '\tborder-radius: {{ splash.button_radius }};\n'+
        '}\n\n'+

        'a.social, a.button, .btn.btn-lg.btn-default {\n'+
        '\tborder-radius: {{splash.button_radius}}!important;\n'+
        '\tbox-shadow: {{splash.button_shadow ? \'0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);\' : \'0 0px 0px rgba(0,0,0,0.0)\'}};\n'+
        '}\n\n'+

        '.social.sms-access, .social.sms-access:hover, .social.sms-access:focus, .social.facebook, .social.facebook:hover,.social.facebook:focus, .social.google, .social.google:hover,.social.google:focus, .social.twitter, .social.twitter:hover,.social.twitter:focus, .button.social-access::after, .button.email-access::after, .button.voucher-access::after {\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px!important;\n'+
        '}\n\n'+

        '.social.voucher-access {\n'+
        '\tbackground-color: {{splash.voucher_button_colour}};\n'+
        '\tcolor: {{splash.voucher_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.voucher_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/Pqc5UMwtQ764Brl4a9A2\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/oefOuGVjSeqxT3o8JUZO\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '\tborder: 1px solid {{splash.voucher_button_border_colour}}!important;\n'+
        '}\n\n'+

        '.social.voucher-access:hover, .social.voucher-access:focus {\n'+
        '\tcolor: {{splash.voucher_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.voucher_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/Pqc5UMwtQ764Brl4a9A2\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/oefOuGVjSeqxT3o8JUZO\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '}\n\n'+

        '.social.password-access {\n'+
        '\tbackground-color: {{splash.password_button_colour}};\n'+
        '\tcolor: {{splash.password_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.password_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/UDXA7p6KRsC3eJ2Jx1ZN\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/anRrI4EmQJOCuq8F7aUe\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '\tborder: 1px solid {{splash.password_button_border_colour}}!important;\n'+
        '}\n\n'+

        '.social.password-access:hover, .social.password-access:focus {\n'+
        '\tcolor: {{splash.password_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.password_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/UDXA7p6KRsC3eJ2Jx1ZN\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/anRrI4EmQJOCuq8F7aUe\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '}\n\n'+

        '.social.code-access {\n'+
        '\tbackground-color: {{splash.codes_button_colour}};\n'+
        '\tcolor: {{splash.codes_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.codes_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/hsHgqCkWS2OIf8P2p23G\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/zbxXh1LkSiufAjkzyxai\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '\tborder: 1px solid {{splash.codes_button_border_colour}}!important;\n'+
        '}\n\n'+

        '.social.code-access:hover, .social.code-access:focus {\n'+
        '\tcolor: {{splash.codes_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.codes_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/hsHgqCkWS2OIf8P2p23G\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/zbxXh1LkSiufAjkzyxai\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '}\n\n'+

        '.social.email-access {\n'+
        '\tbackground-color: {{splash.email_button_colour}};\n'+
        '\tcolor: {{splash.email_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.email_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/Bo1KkVPRK6xu1otggMJg\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/J8r124irRIahUEwwkOrw\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '\tborder: 1px solid {{splash.email_button_border_colour}}!important;\n'+
        '}\n\n'+

        '.social.email-access:hover, .social.email-access:focus {\n'+
        '\tcolor: {{splash.email_btn_font_colour}};\n'+
        '\tbackground-image: url({{splash.email_button_icon ? \'https://d247kqobagyqjh.cloudfront.net/api/file/Bo1KkVPRK6xu1otggMJg\' : \'https://d247kqobagyqjh.cloudfront.net/api/file/J8r124irRIahUEwwkOrw\' }});\n'+
        '\tbackground-position: {{splash.button_radius === \'9001px\' ? \'20px\' : \'10px\'}} 10px;\n'+
        '}\n\n'+

        '{{ splash.custom_css }}';

      head.append($compile('<style>' + template + '</style>')(scope));
      head.append($compile('<link ng-href=\'{{splash.external_css}}\' rel=\'stylesheet\' />')(scope));
      // $window.document.title = scope.splash;

      addCopy(data);
    };

    var addCopy = function(data) {
      $timeout(function() {
        clearUp();
      },100);
    };

    var clearUp = function() {
    };

    buildPage();

  };

  return {
    link: link
  };

}]);


app.directive('popupAdvert', ['$location', '$compile', '$window', '$rootScope', '$timeout', function($location, $compile, $window, $rootScope, $timeout) {
  var link = function(scope, element, attrs) {
    var init = function(data) {
      var template =
        '<div id="popup_container">'+
        '<div id="popup_ad">'+
        '<div class="row">'+
        '<div class="small-12">'+
        '<img src="{{ splash.popup_image }}">'+
        '</div>'+
        '</div>'+
        '<div class="row">'+
        '<div class="small-12 text-center">'+
        '<span id="popupCounter">'+
        '<a class="btn button" id="countDown">5 sec</a>'+
        '</span>'+
        '<span>'+
        '<a class="btn button" id="popupBoxClose">Close</a>'+
        '</span>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    };
    init();
  };
  return {
    link: link,
  };
}]);

app.directive('googleAnalytics', ['$compile', function($compile) {

  var link = function(scope,element,attrs) {
    var init = function(id) {
      var template =
        '<script>'+
        '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){'+
        '  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),'+
        '    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)'+
        '})(window,document,"script","//www.google-analytics.com/analytics.js","ga");'+
        'ga("create", "' + id + '", "auto");'+
        'ga("send", "pageview");'+
        '</script>';

      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    };

    attrs.$observe('id', function(val){
      if (val !== '') {
        init(attrs.id);
      }
    });
  };

  return {
    link: link,
    scope: {
      id: '@'
    }
  };
}]);

app.factory('CONSENT', [function() {

  var a = {};

  return a;

}]);

app.directive('consentForm', ['CONSENT', '$location', '$compile', '$window', '$rootScope', '$timeout', '$cookies', function(CONSENT, $location, $compile, $window, $rootScope, $timeout, $cookies) {

  var link = function(scope, element, attrs) {
    var timer;
    var cookieName = 'gdpr-20180423';
    var getCookie = $cookies.get(cookieName);
    var gdprForm = scope.gdprForm;
    scope.consent = {};

    scope.gdprToggle = function() {
      $('.gdpr-slider').toggleClass('close');
    };

    scope.gdprSubmit = function() {
      var expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 1);
      var consent = {
        terms: true,
        email: scope.consent.email,
        sms: scope.consent.sms,
        timestamp: Date.now()
      };
      CONSENT.new = true;
      $cookies.put(cookieName, window.btoa(JSON.stringify(consent)), { expires: expireDate });

      $('.gdpr-slider').toggleClass('close');
      $('.gdpr-back').toggleClass('submitted');
    };

    var showGdpr = function(id) {
      var template =
        '<span ng-show="gdprForm == \'false\'">'+
        '<div class="gdpr-tab close">'+
        '<span ng-show="poweredBy == \'true\'">'+
        '<img ng-if="poweredByName == \'MIMO\'" src="https://d247kqobagyqjh.cloudfront.net/api/file/8Zw1a8xJQbCqGIjVOJF6"></img>'+
        '<img ng-if="poweredByName == \'Cucumber Tony\'" src="https://d247kqobagyqjh.cloudfront.net/api/file/KflR9VnS1KUuKOCOmFAo"></img>'+
        '</span>'+
        '</div>'+
        '</span>'+
        '<span ng-show="gdprForm == \'true\'">'+
        '<div class="gdpr-back submitted" ng-click="gdprToggle()"></div>'+
        '<div class="gdpr-slider close">'+
        '<div class="gdpr-tab" ng-click="gdprToggle()">'+
        '<span ng-show="poweredBy == \'true\'">'+
        '<img ng-if="poweredByName == \'MIMO\'" src="https://d247kqobagyqjh.cloudfront.net/api/file/8Zw1a8xJQbCqGIjVOJF6"></img>'+
        '<img ng-if="poweredByName == \'Cucumber Tony\'" src="https://d247kqobagyqjh.cloudfront.net/api/file/KflR9VnS1KUuKOCOmFAo"></img>'+
        '</span>'+
        '</div>'+
        '<div class="gdpr-body">'+
        '<div class="row align-center">'+
        '<div class="small-12">'+
        '<p><b>We need your consent before you can log in.</b></p>'+
        '<p>This service is provided by {{locationName}}<span ng-if="poweredBy == \'true\'"> and powered by {{poweredByName}}</span>.</p>'+
        '<form id="gdpr-form" ng-submit="gdprSubmit()">'+
        '<fieldset class="gdpr-fields">'+
        '<legend>You must accept the terms of service</legend>'+
        '<span ng-if="poweredByName == \'MIMO\'">'+
        '<p>Read MIMO\'s full terms of service <a href="https://www.oh-mimo.com/terms/users" target="_blank">here.</a></p>'+
        '<input id="mimo_terms" ng-model="consent.terms" type="checkbox" required><label for="mimo_terms">I agree to the terms of service</label><br>'+
        '</span>'+
        '<span ng-if="poweredByName == \'Cucumber Tony\'">'+
        '<p>Read CT\'s full terms of service <a href="https://www.ct-networks.io/terms/users" target="_blank">here.</a></p>'+
        '<input id="ct_terms" type="checkbox" required><label for="mimo_terms">I agree to the terms of service</label><br>'+
        '</span>'+
        '<span ng-if="poweredBy == \'false\'">'+
        '<p>Read {{locationName}}\'s full terms of service <a href="{{termsUrl}}" target="_blank">here.</a></p>'+
        '<input id="location_terms" type="checkbox" required><label for="location_terms">I agree to the terms of service</label><br>'+
        '</span>'+
        '</fieldset>'+
        '<div ng-if="isClickthrough == \'false\'">'+
        '<span ng-if="newsletterConsent == \'false\'">'+
        '<fieldset class="gdpr-fields">'+
        '<legend>How would you like to hear from us?</legend>'+
        '<p>{{gdprContactMessage}}</p>'+
        '<span ng-if="backupEmail"><input id="email_consent" ng-model="consent.email" type="checkbox"><label for="email_consent">{{gdprEmailField}}</label><br></span>'+
        '<span ng-if="backupSms"><input id="sms_consent" ng-model="consent.sms" type="checkbox"><label for="sms_consent">{{gdprSmsField}}</label><br></span>'+
        '</fieldset>'+
        '</span>'+
        '<span ng-if="newsletterConsent == \'true\'">'+
        '<fieldset class="gdpr-fields">'+
        '<legend>Confirm that you agree to be contacted via the below methods</legend>'+
        '<p>{{gdprContactMessage}}</p>'+
        '<span ng-if="backupEmail"><input id="email_consent" ng-model="consent.email" type="checkbox" required><label for="email_consent">{{gdprEmailField}}</label><br></span>'+
        '<span ng-if="backupSms"><input id="sms_consent" ng-model="consent.sms" type="checkbox" required><label for="sms_consent">{{gdprSmsField}}</label><br></span>'+
        '</fieldset>'+
        '</span>'+
        '</div>'+
        // '<p>You can change your preferences at a later date <a href="https://oh-mimo.com/self-service" target="_blank">here.</a></p>'+
        '<div>'+
        '<button class="gdpr-submit">Submit</button>'+
        '</div>'+
        '</form>'+
        '</div>'+
        '</div>'+
        '<div class="small-12">'+
        '<span ng-if="poweredByName == \'MIMO\'">'+
        '<small>To view your captured data, <a href="https://www.oh-mimo.com/gdpr-wifi-tools/request" target="_blank">click here.</a></small>'+
        '</span>';
        '<span ng-if="poweredByName == \'Cucumber Tony\'">'+
        '<small>To view your captured data, <a href="https://www.ct-networks.io/gdpr-wifi-tools/request" target="_blank">click here.</a></small>'+
        '</span>';
        '</div>'+
        '</div>'+
        '</div>'+
        '</span>';
      var templateObj = $compile(template)(scope);
      element.html(templateObj);
    };

    var init = function () {
      showGdpr();
      if ( getCookie === undefined || getCookie === '' || getCookie === null) {
        $('.gdpr-back').toggleClass('submitted');
        $timeout(function() {
          $('.gdpr-slider').toggleClass('close');
          $timeout.cancel(timer);
        },1000);
      }
    };

    init();

  };

  return {
    link: link,
    scope: {
      locationName: '@',
      isClickthrough: '@',
      hideTerms: '@',
      termsUrl: '@',
      poweredBy: '@',
      poweredByName: '@',
      backupSms: '@',
      backupEmail: '@',
      newsletterConsent: '@',
      gdprEmailField: '@',
      gdprSmsField: '@',
      gdprContactMessage: '@',
      gdprForm: '@'
    }
  };

}]);
