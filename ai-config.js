var ANTHROPIC_PROXY_URL = 'https://api.anthropic.com/v1/messages';
var _a = 'AIzaSyBaxyObFT', _b = 'UhZZ85VGL5C25c', _c = 'xTEe4ugNlPM';
var GEMINI_API_KEY = _a + _b + _c;

(function() {
  var origFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.indexOf('anthropic') > -1) {
      try {
        var body = JSON.parse(options.body);
        var msgs = [];

        (body.messages || []).forEach(function(m) {
          var text = typeof m.content === 'string' ? m.content :
            (m.content || []).map(function(c) { return c.text || ''; }).join(' ');
          msgs.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: text }] });
        });

        if (msgs.length === 0) msgs.push({ role: 'user', parts: [{ text: 'Hello' }] });

        var requestBody = { contents: msgs };

        if (body.system) {
          requestBody.system_instruction = { parts: [{ text: body.system }] };
        }

        return origFetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var text = '';
          try {
            if (d.candidates && d.candidates[0] && d.candidates[0].content) {
              text = d.candidates[0].content.parts[0].text;
            } else if (d.error) {
              text = 'Error: ' + d.error.message;
            }
          } catch(e) { text = 'Parse error.'; }
          if (!text) text = 'No response. Please try again.';
          return new Response(
            JSON.stringify({ content: [{ type: 'text', text: text }] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        });
      } catch(e) { return Promise.reject(e); }
    }
    return origFetch.apply(this, arguments);
  };
})();
