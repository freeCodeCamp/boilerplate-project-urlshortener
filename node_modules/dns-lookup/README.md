# dns-lookup

**dns-lookup** resolves a domain (e.g. 'yandex.ru') into the first found AAAA (IPv6) record or, if not found, into the first found A (IPv4) record.

If you don't care about order, you may want to use method `lookup` from `dns` module.

## More info

* node.js v0.10.* automatically uses both IPv4 and IPv6 versions.
* node.js v0.11.* allows you to specify the protocol version in the request parameters (`http.request`) with `family` property.

## Testing your code

Starting from node.js v0.11.* you can run your script with `NODE_DEBUG=net` environment variable and it will output dns parameters into console.

You also may want to use tcpdump.

## Instalation

```
npm i dns-lookup
```

## Usage

```javascript
var lookup = require('dns-lookup');

lookup('www.yandex.ru', function (err, address, family) {
    // Action goes here!
});
```
