 define([
  './base64_url_decode'
],function(base64_url_decode) {
  'use strict';

  function InvalidTokenError(message) {
    this.message = message;
  }

  InvalidTokenError.prototype = new Error();
  InvalidTokenError.prototype.name = 'InvalidTokenError';

  return function (token,options) {
    if (typeof token !== 'string') {
      throw new InvalidTokenError('Invalid token specified');
    }

    options = options || {};
    var pos = options.header === true ? 0 : 1;
    try {
      return JSON.parse(base64_url_decode(token.split('.')[pos]));
    } catch (e) {
      throw new InvalidTokenError('Invalid token specified: ' + e.message);
    }
  };


});