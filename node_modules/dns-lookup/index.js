'use strict';

var dns = require('dns');
var inherits = require('util').inherits;

var EventEmitter = require('events').EventEmitter;

/**
 * @param  {String}   host
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {Resolver}
 */
function Resolver(host, options, callback) {
  EventEmitter.call(this);

  var that = this;

  this.once('address', function (addr, family) {
    that.removeAllListeners();
    callback(null, addr, family);
  });

  this.on('error', function (err, family) {
    if (err.code === 'ENOTFOUND' && family === 6) {
      that._lookup(host, 4);
    } else {
      that.removeAllListeners();
      callback(err, null, family);
    }
  });

  this._lookup(host, 6);
}

inherits(Resolver, EventEmitter);

/**
 * @param  {String} host
 * @param  {Number} family 4|6.
 */
Resolver.prototype._lookup = function (host, family) {
  var that = this;

  dns.lookup(host, family, function (err, addr) {
    if (err) {
      that.emit('error', err, family);
    } else {
      that.emit('address', addr, family);
    }
  });
};

/**
 * @param  {String}   host
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {Resolver}
 */
module.exports = function (host, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (!options || typeof options !== 'object') {
    options = {};
  }

  return new Resolver(host, options, callback);
};
