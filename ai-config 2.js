var ANTHROPIC_PROXY_URL = 'https://api.anthropic.com/v1/messages';
var GEMINI_API_KEY = 'AIzaSyAo66xt0-NLZTZ2G_fs7dy7jHunAIKHhuQ';

(function() {
  var origFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.indexOf('anthropic') > -1) {
      try {
        var body = JSON.parse(options.body);
        var msgs = [];

        if (body.system) {
          msgs.push({ role: 'user', parts: [{ text: body.system }] });
          msgs.push({ role: 'model', parts: [{ text: 'Understood.' }] });
        }

        (body.messages || []).forEach(function(m) {
          var text = typeof m.content === 'string' ? m.content :
            (m.content || []).map(function(c) { return c.text || ''; }).join(' ');
          msgs.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: text }]
          });
        });

        var geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

        return origFetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: msgs })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var text = '';
          try {
            text = d.candidates[0].content.parts[0].text;
          } catch(e) {
            text = 'Sorry, I could not get a response. Please try again.';
          }
          if (!text) text = 'Sorry, I could not get a response. Please try again.';
          return new Response(
            JSON.stringify({ content: [{ type: 'text', text: text }] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        });
      } catch(e) {
        return Promise.reject(e);
      }
    }
    return origFetch.apply(this, arguments);
  };
})();
