'use strict';

var app = angular.module('ctLoginsApp.logins.filters', []);

app.filter('titleCase', function() {
  return function(input) {
    if ( typeof input === 'string' ) {
      input = input || '';
      return input.replace(/_/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    } else {
      return input;
    }
  };
});

app.filter('sentenceCase', function() {
  return function(input) {
    input = input || '';
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});


