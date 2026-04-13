// BVMM Worker — bvmm-proxy
// Handles: GitHub deploy, KV storage, AI proxy (OpenAI GPT-4o)
// Secrets required: GITHUB_TOKEN, OPENAI_API_KEY, PEXELS_API_KEY
// KV binding: BVMM_DATA

export default {
  async fetch(request, env) {

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    let body;
    try { body = await request.json(); }
    catch (e) { return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { headers }); }

    const action = body.action;

    // ── AI PROXY ────────────────────────────────────────────────────
    if (action === 'ai') {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: body.messages || [],
            max_tokens: 1000,
            temperature: 0.1
          })
        });
        const data = await resp.json();
        if (!resp.ok) return new Response(JSON.stringify({ ok: false, error: data.error?.message || 'OpenAI error' }), { headers });
        const content = data.choices?.[0]?.message?.content || '';
        return new Response(JSON.stringify({ ok: true, content }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { headers });
      }
    }

    // ── GITHUB DEPLOY ───────────────────────────────────────────────
    if (action === 'deploy') {
      try {
        const { filename, content } = body;
        const token = env.GITHUB_TOKEN;
        const apiBase = 'https://api.github.com/repos/bvmm-droid/greencrk-site/contents/';
        const ghHeaders = {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'bvmm-proxy-worker'
        };

        // Get current SHA
        const getResp = await fetch(apiBase + filename, { headers: ghHeaders });
        const getData = await getResp.json();
        const sha = getData.sha || null;

        // Push file
        const putBody = {
          message: `Update ${filename} via BVMM Manager`,
          content: content
        };
        if (sha) putBody.sha = sha;

        const putResp = await fetch(apiBase + filename, {
          method: 'PUT',
          headers: ghHeaders,
          body: JSON.stringify(putBody)
        });
        const putData = await putResp.json();
        if (!putResp.ok) return new Response(JSON.stringify({ ok: false, error: putData.message || 'GitHub error' }), { headers });
        return new Response(JSON.stringify({ ok: true, commit: putData.commit?.sha?.substring(0, 7) || 'ok' }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { headers });
      }
    }

    // ── KV STORAGE ──────────────────────────────────────────────────
    if (action === 'kv-set') {
      try {
        await env.BVMM_DATA.put(body.key, body.value);
        return new Response(JSON.stringify({ ok: true }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { headers });
      }
    }

    if (action === 'kv-get') {
      try {
        const value = await env.BVMM_DATA.get(body.key);
        return new Response(JSON.stringify({ ok: true, value }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { headers });
      }
    }

    if (action === 'kv-list') {
      try {
        const prefix = body.prefix || undefined;
        const list = await env.BVMM_DATA.list({ prefix });
        return new Response(JSON.stringify({ ok: true, keys: list.keys }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { headers });
      }
    }

    return new Response(JSON.stringify({ ok: false, error: 'Unknown action: ' + action }), { headers });
  }
};
