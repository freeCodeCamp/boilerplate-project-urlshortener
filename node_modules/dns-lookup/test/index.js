describe('index.js', function () {
  'use strict';

  var expect = require('expect.js');
  var lookup = require('..');

  describe('for the "yandex.ru" domain', function () {
    var ipAddress;
    var addressFamily;

    before(function (next) {
      var uri = 'www.yandex.ru';

      lookup(uri, function (err, address, family) {
        ipAddress = address;
        addressFamily = family;
        next();
      });
    });

    it('returns ip address', function () {
      expect(ipAddress).to.be.a('string');
    });

    it('returns ip address family', function () {
      expect(addressFamily).to.be.an('number');
    });
  });

  describe('for the "yandex.ru" domain using the third argument', function () {
    var ipAddress;
    var addressFamily;

    before(function (next) {
      var uri = 'www.yandex.ru';

      lookup(uri, null, function (err, address, family) {
        ipAddress = address;
        addressFamily = family;
        next();
      });
    });

    it('returns ip address', function () {
      expect(ipAddress).to.be.a('string');
    });

    it('returns ip address family', function () {
      expect(addressFamily).to.be.an('number');
    });
  });

  describe('for the unexisting domain', function () {
    var error;
    var ipAddress;

    before(function (next) {
      var uri = 'qwe.rty555';

      lookup(uri, function (err, address) {
        error = err;
        ipAddress = address;
        next();
      });
    });

    it('returns error with code ENOTFOUND', function () {
      expect(error).to.be.an('object');
      expect(error).to.have.property('code');
      expect(error.code).to.be.equal('ENOTFOUND');
    });

    it('returns null instead of ip address', function () {
      expect(ipAddress).to.be.equal(null);
    });
  });
});
