var ANTHROPIC_PROXY_URL = 'https://bvmm-proxy.babylonvillagemeatmarket.workers.dev';

(function() {
  var origFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.indexOf('anthropic') > -1) {
      return origFetch(ANTHROPIC_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: options.body
      });
    }
    return origFetch.apply(this, arguments);
  };
})();
