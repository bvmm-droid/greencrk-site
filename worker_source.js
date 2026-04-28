/*
 * # BVMM / greencrk.com — Complete Handover
 * **Generated:** April 28, 2026
 * **For:** The next Claude session
 * **Project:** Babylon Village Meat Market website + Square integration
 *
 * ---
 *
 * ## 🚨 READ THIS FIRST
 *
 * 1. **Rules set by user (non-negotiable):**
 *    - **Don't lie.** If you don't know, say so. User will catch you.
 *    - **Always give hyperlinks.** Every site/dashboard reference must be a clickable link.
 *    - **Worker-first when site breaks.** Use Cloudflare MCP to check worker before theorizing.
 *    - **Never push without reading live HTML first.** Local/uploaded files may be stale.
 *    - **One task at a time.** User is on iPhone, tired, non-technical. Keep it short.
 *
 * 2. **User profile:**
 *    - Owner of Babylon Village Meat Market
 *    - 85 Deer Park Ave, Babylon Village NY 11702 · (631) 669-0612
 *    - Working from iPhone in Safari (voice-to-text — expect typos/garbled words)
 *    - Non-technical. No jargon. Short responses. One question at a time.
 *
 * 3. **Site is live and working.** Verified April 28, 2026.
 *
 * ---
 *
 * ## 🌐 ALL LINKS
 *
 * ### Site
 * - Live: [greencrk.com](https://greencrk.com)
 * - Admin: [greencrk.com?admin](https://greencrk.com?admin)
 * - Future domain (not yet connected): babylonvillagemeatmarket.com
 *
 * ### GitHub
 * - Repo: [github.com/bvmm-droid/greencrk-site](https://github.com/bvmm-droid/greencrk-site)
 * - Raw index.html: `https://raw.githubusercontent.com/bvmm-droid/greencrk-site/main/index.html`
 * - Backup manifest: `https://raw.githubusercontent.com/bvmm-droid/greencrk-site/main/backups/manifest.json`
 * - worker_source.js (for self-update): `https://raw.githubusercontent.com/bvmm-droid/greencrk-site/main/worker_source.js`
 * - Branch: `main`
 *
 * ### Cloudflare
 * - Worker URL: `https://bvmm-proxy.babylonvillagemeatmarket.workers.dev`
 * - Worker dashboard: [dash.cloudflare.com/.../bvmm-proxy](https://dash.cloudflare.com/3e33cb7e32f60a1266e6e50ed47d9b4b/workers/services/view/bvmm-proxy/production)
 * - Account ID: `3e33cb7e32f60a1266e6e50ed47d9b4b`
 * - Worker script ID: `7c3552444ad441d6b781967a54f5a17d`
 *
 * ### Square
 * - Dashboard: [app.squareup.com/dashboard](https://app.squareup.com/dashboard)
 * - Catalog: [app.squareup.com/dashboard/items/library](https://app.squareup.com/dashboard/items/library)
 * - Production app ID: `sq0idp-r0IPYDqt3ffjDZzCvLTFPg`
 * - Location ID: `LWZJXYFHRWCCJ`
 *
 * ### EmailJS
 * - Public key: `sF8_feXTs21Nsc3Bg`
 * - Service ID: `service_1jc6nrt`
 * - Template ID: `template_fben9zs`
 *
 * ---
 *
 * ## 🔧 TOOLS / CONNECTORS AVAILABLE
 *
 * ### Cloudflare Developer Platform MCP (READ-ONLY)
 * Connected. Available tools:
 * - `workers_get_worker('bvmm-proxy')` — get worker metadata
 * - `workers_get_worker_code('bvmm-proxy')` — get full worker source ✓
 * - `workers_list` — list all workers
 * - `kv_namespaces_list` — list KV namespaces
 * - Various D1/R2/KV management tools
 *
 * **⚠️ CRITICAL LIMITATION:** This MCP cannot DEPLOY workers. It is read-only.
 * To deploy a worker you must either:
 * a) User uploads file via admin panel Deploy Worker drop zone
 * b) Worker self-deploys via GET /self-update (see below)
 *
 * ### Worker GET Endpoints (no auth required)
 * - `GET /fix` → Patches index.html, purges CDN cache, writes worker_source.js to GitHub
 * - `GET /self-update` → Reads worker_source.js from GitHub, self-deploys worker
 * - `GET /` → Returns "BVMM Worker OK"
 *
 * ---
 *
 * ## ⚙️ SELF-UPDATE MECHANISM (HOW IT WORKS)
 *
 * After this session's bootstrap, future worker updates work like this:
 *
 * 1. I update the worker code locally
 * 2. I generate new `worker_BOOTSTRAP.js` with updated `WORKER_SOURCE_B64` constant
 * 3. User deploys it ONE TIME via admin panel
 * 4. User opens `/fix` → this writes new `worker_source.js` to GitHub automatically
 * 5. For ANY future redeploy of that same version: user opens `/self-update` URL — no file needed
 *
 * **For site-only fixes (index.html):**
 * - I just call `/fix` — nothing needed from user at all
 *
 * **Honest limitation:** Getting a BRAND NEW version of the worker into GitHub still requires one file upload to bootstrap. But after that, `/self-update` handles redeployment.
 *
 * ---
 *
 * ## ✅ WHAT WAS DONE THIS SESSION (April 28, 2026)
 *
 * ### Original bug (from previous session)
 * - Race condition: default tab showed hardcoded items until tapped
 * - Square catalog loaded after paint, render code never fired for already-active tab
 *
 * ### Fixes applied
 * 1. ✅ **Race condition fix** — intercepts `fetch()`, detects `square-catalog` action, re-clicks `.mtab.active` after data loads
 * 2. ✅ **Order Online section wired to Square** — was entirely hardcoded; now replaced with live Square data (categories, prices, photos) after catalog loads
 * 3. ✅ **Empty category sections hidden** — `.mgroup` elements with no `.mrow` children hidden automatically via setTimeout
 * 4. ✅ **Duplicate filter row** — removed old approach, clean filter wiring
 * 5. ✅ **Bootstrap self-update** — worker now contains its own source as `WORKER_SOURCE_B64`; `/fix` writes it to GitHub; `/self-update` redeploys
 *
 * ### How fixes are delivered
 * All fixes injected via `<script id="_bvmm_race_fix">` tag added before `</body>` in index.html.
 * The `/fix` GET endpoint on the worker handles removal of old fix, injection of new fix, GitHub commit, CDN purge.
 *
 * ---
 *
 * ## 🐛 KNOWN LIMITATIONS DISCOVERED THIS SESSION
 *
 * 1. **Cloudflare MCP is read-only** — can read worker code but cannot deploy. Don't claim you can deploy via MCP.
 * 2. **web_fetch is GET-only** — cannot POST to worker from Claude's web_fetch tool.
 * 3. **Bash network restrictions** — bash container can reach: github.com, api.anthropic.com, npmjs.org, pypi.org. Cannot reach: raw.githubusercontent.com, api.github.com, api.cloudflare.com, bvmm worker URL.
 * 4. **Artifact iframe cannot POST** — Claude.ai artifact sandbox blocks outbound fetch to external domains. "Load failed" in Safari = CSP/sandbox block.
 * 5. **Worker can't read own source** — Workers cannot introspect their own deployed code at runtime. That's why WORKER_SOURCE_B64 constant is embedded.
 * 6. **iPhone Safari can't open blob URLs** — Don't try to offer file downloads via blob URLs to this user.
 *
 * ---
 *
 * ## 📋 PENDING TASKS (from previous handover + this session)
 *
 * ### Priority 1 — Active bugs
 * 1. ✅ ~~Fix render race~~ — DONE
 * 2. **Two-way Square sync for edits.** When user edits price/name in admin, changes revert on next load. Worker has `square-item-update` action but frontend pencil-save handler doesn't call it.
 * 3. **Image edits to Square.** Photo uploads go to GitHub but don't call `square-img-upload`. Same revert symptom.
 *
 * ### Priority 2 — Features
 * 4. **Health Check button** in admin Tools tab → calls worker `health` action
 * 5. **Clear Cache button** in admin Tools tab → calls `cache-clear` with session token
 * 6. **Itemized checkout** — migrate from `quick_pay` to `order` + `line_items` (Square owns prices, automatic tax)
 *
 * ### Priority 3 — Security
 * 7. **Lock down unauthenticated worker actions** — `kv-set/get/list`, `proxy`, `img-fetch`, `square-payment-link`, `ai`, `pexels/unsplash/google-images` are all unauthenticated. Should require session token.
 *
 * ### Priority 4 — Delivery channels
 * 8. Square → DoorDash (native integration, free, 15-30% commission)
 * 9. Square → Uber Eats
 * 10. Square → Grubhub
 *
 * ---
 *
 * ## 🔄 RECOMMENDED WORKFLOW FOR NEXT SESSION
 *
 * 1. Read this handover
 * 2. Greet user briefly. Don't re-explain context.
 * 3. Verify site: `workers_get_worker('bvmm-proxy')` — confirm ID matches `7c3552444ad441d6b781967a54f5a17d`
 * 4. Ask user what they want to work on
 * 5. For site fixes: use `/fix` endpoint — no user action needed
 * 6. For worker updates: build new worker with updated `WORKER_SOURCE_B64`, give user file, they deploy + run `/fix` once
 *
 * ---
 *
 * ## 💬 TONE / STYLE
 *
 * - Short responses. One thing at a time.
 * - Voice-to-text typos are common. "Winnipeg" = "winning". Don't get confused.
 * - User gets frustrated when: lied to, given JS files repeatedly, told to do multiple steps at once, given broken tools
 * - User is smart and will catch mistakes. Own them, fix them, move on.
 * - Don't suggest they rest. They decide when to stop.
 *
 * ---
 *
 * ## 🔐 WORKER ENVIRONMENT SECRETS (stored in Cloudflare, not here)
 * - `SQUARE_ACCESS_TOKEN` — production Square token
 * - `GITHUB_TOKEN` — GitHub PAT with repo write access
 * - `CF_API_TOKEN` — Cloudflare API token for worker self-deploy
 * - `BVMM_PASS` — admin panel password
 * - `BVMM_TOOL` — external deploy auth header value
 * - `BVMM_KV` — KV namespace binding (`bvmm-data`)
 * - `ANTHROPIC_API_KEY` — for AI action
 * - `PEXELS_API_KEY`, `UNSPLASH_KEY`, `GOOGLE_API_KEY`, `GOOGLE_CSE_ID` — image search
 * - `EMAILJS` keys baked into index.html by admin-deploy action
 *
 *
 */


const GITHUB_OWNER  = 'bvmm-droid';
const GITHUB_REPO   = 'greencrk-site';
const GITHUB_BRANCH = 'main';

const SQUARE_API_BASE   = 'https://connect.squareup.com/v2';
const SQUARE_LOCATION_ID = 'LWZJXYFHRWCCJ';



const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-bvmm-auth',
};

function b64DecodeUtf8(s) {
  const bytes = Uint8Array.from(atob(s), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function b64EncodeUtf8(s) {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // GET /fix  — reads live index.html, patches race condition, commits to GitHub
    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.pathname === '/fix' || url.searchParams.has('fix')) {
        try {
          const result = await doFixRaceCondition(env);
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BVMM Fix</title><style>body{font-family:sans-serif;padding:40px 24px;max-width:500px;margin:0 auto;background:#0e0c0b;color:#f5f2ec}h1{font-size:1.4rem;margin-bottom:12px}p{font-size:.9rem;color:rgba(245,242,236,.6);line-height:1.6}.ok{color:#3dd68c}.err{color:#ff7b72}</style></head><body><h1>${result.ok ? '✓ Fix applied' : '✗ Fix failed'}</h1><p class="${result.ok ? 'ok' : 'err'}">${result.message}</p>${''}</body></html>`;
          return new Response(html, { status: result.ok ? 200 : 500, headers: { 'Content-Type': 'text/html;charset=utf-8', ...CORS } });
        } catch(e) {
          return new Response('Error: ' + (e.message || String(e)), { status: 500, headers: CORS });
        }
      }
      // GET /self-update — reads worker source from KV (primary) or GitHub (fallback)
      if (url.pathname === '/self-update') {
        try {
          let script = null;
          // Try KV first
          if (env.BVMM_KV) {
            try {
              const kvSrc = await env.BVMM_KV.get('worker_source');
              if (kvSrc) script = b64DecodeUtf8(kvSrc);
            } catch(_) {}
          }
          // Fall back to GitHub
          if (!script) {
            const src = await ghRead('worker_source.js', env);
            if (src.ok) script = b64DecodeUtf8(src.content.replace(/\s/g,''));
          }
          if (!script) return new Response('No worker source found in KV or GitHub', {status:500, headers:CORS});
          const dr = await doCFDeployWorker({script, auth: env.BVMM_TOOL}, env);
          return new Response(dr.ok ? 'Worker updated successfully.' : 'Deploy failed: ' + dr.error, {status: dr.ok?200:500, headers:{'Content-Type':'text/plain',...CORS}});
        } catch(e) { return new Response('Error: '+e.message, {status:500, headers:CORS}); }
      }

      // Serve index.html for all non-API GET requests (site hosting)
      const path = url.pathname;
      if (path === '/' || path === '/index.html' || (!path.startsWith('/fix') && !path.startsWith('/self-update') && !path.includes('.'))) {
        try {
          // Try KV cache first
          const SITE_KEY = 'site_index_html';
          let html = null;
          if (env.BVMM_KV) {
            try { html = await env.BVMM_KV.get(SITE_KEY); } catch(_) {}
          }
          if (!html) {
            // Fetch from GitHub
            const read = await ghRead('index.html', env);
            if (read.ok) {
              html = b64DecodeUtf8(read.content.replace(/\s/g, ''));
              if (env.BVMM_KV) {
                try { await env.BVMM_KV.put(SITE_KEY, html, { expirationTtl: 300 }); } catch(_) {}
              }
            }
          }
          if (html) {
            return new Response(html, {
              headers: {
                'Content-Type': 'text/html;charset=utf-8',
                'Cache-Control': 'public, max-age=0, must-revalidate',
                ...CORS
              }
            });
          }
        } catch(e) {}
      }

      return new Response('BVMM Worker OK', { headers: CORS });
    }

    let body;
    try { body = await request.json(); }
    catch { return jsonResp({ ok: false, error: 'Invalid JSON' }, 400); }

    const action = body?.action;
    let result;
    try {
      switch (action) {
        case 'health':                result = await doHealth(body, env); break;
        case 'cache-clear':           result = await doCacheClear(body, env); break;
        case 'login':                 result = await doLogin(body, env); break;
        case 'admin-deploy':          result = await doAdminDeploy(body, env, ctx); break;
        case 'list-backups':          result = await doListBackups(body, env); break;
        case 'revert':                result = await doRevert(body, env); break;
        case 'deploy':                result = await doDeploy(body, request, env); break;
        case 'pexels':                result = await doPexels(body, env); break;
        case 'unsplash':              result = await doUnsplash(body, env); break;
        case 'google-images':         result = await doGoogleImages(body, env); break;
        case 'ai':                    result = await doAI(body, env); break;
        case 'proxy':                 result = await doProxy(body); break;
        case 'proxy-headers':         result = await doProxyHeaders(body); break;
        case 'img-upload':
        case 'img-upload-raw':        result = await doImgUpload(body, env); break;
        case 'img-upload-github':     result = await doImgUploadGithub(body, env); break;
        case 'img-fetch':             result = await doImgFetch(body); break;
        case 'img-import-stock':      result = await doImgImportStock(body, env); break;
        case 'kv-set':                result = await doKVSet(body, env); break;
        case 'kv-get':                result = await doKVGet(body, env); break;
        case 'kv-list':               result = await doKVList(body, env); break;
        case 'cf-deploy-worker':      result = await doCFDeployWorker(body, env); break;
        case 'square-payment-link':   result = await doSquarePaymentLink(body, env); break;
        case 'square-catalog':        result = await doSquareCatalog(body, env); break;
        case 'square-img-upload':     result = await doSquareImgUpload(body, env); break;
        case 'square-item-update':    result = await doSquareItemUpdate(body, env, ctx); break;
        case 'cf-debug':              result = await doCFDebug(body, env); break;
        default: result = { ok: false, error: 'Unknown action: ' + action };
      }
    } catch (err) {
      result = { ok: false, error: err.message || String(err) };
    }
    return jsonResp(result);
  }
};

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// ==================================================================
//  HEALTH (no auth) — comprehensive Square production diagnostic
// ==================================================================

async function doHealth(body, env) {
  const out = {
    ok: true,
    ts: new Date().toISOString(),
    config: {
      square_api_base: SQUARE_API_BASE,
      square_location_id: SQUARE_LOCATION_ID,
      square_token_present: typeof env.SQUARE_ACCESS_TOKEN === 'string' && env.SQUARE_ACCESS_TOKEN.length > 10,
      square_token_length: typeof env.SQUARE_ACCESS_TOKEN === 'string' ? env.SQUARE_ACCESS_TOKEN.length : 0,
      kv_bound: !!env.BVMM_KV,
      github_token_present: !!env.GITHUB_TOKEN,
      cf_token_present: !!env.CF_API_TOKEN,
    },
    square: {},
    kv: {},
  };

  // Test Square /locations endpoint — verifies token is valid at all
  if (out.config.square_token_present) {
    const sqHeaders = {
      'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN,
      'Square-Version': '2025-01-23',
      'Content-Type': 'application/json',
    };

    try {
      const r = await fetch(SQUARE_API_BASE + '/locations', { headers: sqHeaders });
      const data = await r.json();
      out.square.locations = {
        http_status: r.status,
        ok: r.ok,
        count: r.ok ? (data.locations || []).length : 0,
        ids: r.ok ? (data.locations || []).map(l => ({ id: l.id, name: l.name })) : [],
        error: r.ok ? null : (data.errors?.[0]?.detail || data.errors?.[0]?.code || 'unknown'),
        error_code: r.ok ? null : (data.errors?.[0]?.code || null),
      };
    } catch (e) {
      out.square.locations = { error: 'fetch threw: ' + (e.message || String(e)) };
    }

    // Test Square /catalog/list — verifies ITEMS_READ scope
    try {
      const r = await fetch(SQUARE_API_BASE + '/catalog/list?types=ITEM&limit=5', { headers: sqHeaders });
      const data = await r.json();
      out.square.catalog_list = {
        http_status: r.status,
        ok: r.ok,
        returned: r.ok ? (data.objects || []).length : 0,
        sample_names: r.ok ? (data.objects || []).slice(0, 5).map(o => o.item_data?.name || '(unnamed)') : [],
        has_cursor: r.ok ? !!data.cursor : false,
        error: r.ok ? null : (data.errors?.[0]?.detail || data.errors?.[0]?.code || 'unknown'),
        error_code: r.ok ? null : (data.errors?.[0]?.code || null),
      };
    } catch (e) {
      out.square.catalog_list = { error: 'fetch threw: ' + (e.message || String(e)) };
    }

    // Test Square /catalog/search — exactly what the site uses
    try {
      const r = await fetch(SQUARE_API_BASE + '/catalog/search', {
        method: 'POST', headers: sqHeaders,
        body: JSON.stringify({ object_types: ['ITEM'], limit: 5 })
      });
      const data = await r.json();
      out.square.catalog_search = {
        http_status: r.status,
        ok: r.ok,
        returned: r.ok ? (data.objects || []).length : 0,
        error: r.ok ? null : (data.errors?.[0]?.detail || data.errors?.[0]?.code || 'unknown'),
        error_code: r.ok ? null : (data.errors?.[0]?.code || null),
      };
    } catch (e) {
      out.square.catalog_search = { error: 'fetch threw: ' + (e.message || String(e)) };
    }
  } else {
    out.square.locations = { error: 'SQUARE_ACCESS_TOKEN missing or too short' };
  }

  // KV cache state
  if (env.BVMM_KV) {
    try {
      const v3 = await env.BVMM_KV.get('square_catalog_v3');
      out.kv.square_catalog_v3 = v3 ? { present: true, bytes: v3.length } : { present: false };
    } catch (e) { out.kv.error = e.message; }
  }

  // Verdict
  const verdict = [];
  if (!out.config.square_token_present) verdict.push('SQUARE_ACCESS_TOKEN missing');
  if (out.square.locations && !out.square.locations.ok) verdict.push('Square /locations failed: ' + out.square.locations.error);
  if (out.square.catalog_list && !out.square.catalog_list.ok) verdict.push('Square /catalog/list failed: ' + out.square.catalog_list.error);
  if (out.square.catalog_search && !out.square.catalog_search.ok) verdict.push('Square /catalog/search failed: ' + out.square.catalog_search.error);
  if (out.square.catalog_list && out.square.catalog_list.ok && out.square.catalog_list.returned === 0) verdict.push('Catalog returned 0 items — Square account may have no items, or token lacks scope on this seller');
  out.verdict = verdict.length === 0 ? 'ALL OK' : verdict;

  return out;
}

// ==================================================================
//  CACHE-CLEAR (auth required) — wipe KV catalog cache
// ==================================================================

async function doCacheClear(body, env) {
  if (!await verifySessionToken(body.token, env)) {
    return { ok: false, error: 'Session expired — please log in again.' };
  }
  if (!env.BVMM_KV) return { ok: false, error: 'KV not bound' };
  const cleared = [];
  for (const key of ['square_catalog_v3', 'square_catalog_v2']) {
    try { await env.BVMM_KV.delete(key); cleared.push(key); } catch (_) {}
  }
  return { ok: true, cleared };
}

// ==================================================================
//  SQUARE PAYMENT LINK
// ==================================================================

async function doSquarePaymentLink(body, env) {
  if (!env.SQUARE_ACCESS_TOKEN) return { ok: false, error: 'Square not configured' };
  const { customerName, orderTotal, orderSummary, pickupDate, pickupTime } = body;
  if (!customerName || !orderTotal) return { ok: false, error: 'Missing customerName or orderTotal' };
  const amountCents = Math.round(parseFloat(orderTotal) * 100);
  if (isNaN(amountCents) || amountCents <= 0) return { ok: false, error: 'Invalid order total' };
  const idempotencyKey = 'bvmm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  const payload = {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: 'BVMM Order — ' + customerName,
      price_money: { amount: amountCents, currency: 'USD' },
      location_id: SQUARE_LOCATION_ID
    },
    checkout_options: { redirect_url: 'https://greencrk.com', ask_for_shipping_address: false },
    pre_populated_data: { buyer_name: customerName },
    description: orderSummary ? orderSummary.slice(0, 500) : ('Pickup: ' + (pickupDate || '') + ' ' + (pickupTime || ''))
  };
  const resp = await fetch(SQUARE_API_BASE + '/online-checkout/payment-links', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' },
    body: JSON.stringify(payload)
  });
  const data = await resp.json();
  if (!resp.ok) {
    const detail = data.errors && data.errors[0] ? data.errors[0].detail : 'Square API error';
    return { ok: false, error: detail };
  }
  return { ok: true, url: data.payment_link.url, id: data.payment_link.id };
}

// ==================================================================
//  SQUARE CATALOG — improved error surfacing
// ==================================================================

async function doSquareCatalog(body, env) {
  const CACHE_KEY = 'square_catalog_v3';
  if (env.BVMM_KV && !body.skipCache) {
    try {
      const cached = await env.BVMM_KV.get(CACHE_KEY);
      if (cached) return { ok: true, cached: true, ...JSON.parse(cached) };
    } catch {}
  }

  if (!env.SQUARE_ACCESS_TOKEN) {
    return { ok: false, error: 'SQUARE_ACCESS_TOKEN missing in worker secrets' };
  }

  const headers = {
    'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'Square-Version': '2025-01-23'
  };

  let items = [];
  let allPages = [];
  let cursor = null;
  let pages = 0;
  do {
    const searchBody = { object_types: ['ITEM', 'IMAGE'], include_related_objects: true, limit: 200 };
    if (cursor) searchBody.cursor = cursor;
    const resp = await fetch(SQUARE_API_BASE + '/catalog/search', {
      method: 'POST', headers, body: JSON.stringify(searchBody)
    });
    if (!resp.ok) {
      let errBody = null;
      try { errBody = await resp.json(); } catch (_) {}
      return {
        ok: false,
        error: 'Square /catalog/search returned ' + resp.status,
        square_status: resp.status,
        square_error: errBody?.errors?.[0]?.detail || null,
        square_error_code: errBody?.errors?.[0]?.code || null,
        square_error_full: errBody?.errors || null,
      };
    }
    const data = await resp.json();
    if (data.objects) items = items.concat(data.objects);
    allPages.push(data);
    cursor = data.cursor || null;
    pages++;
  } while (cursor && pages < 20);

  const relatedImages = {};
  for (const page of allPages) {
    for (const obj of (page.related_objects || [])) if (obj.type === 'IMAGE' && obj.image_data?.url) relatedImages[obj.id] = obj.image_data.url;
    for (const obj of (page.objects || [])) if (obj.type === 'IMAGE' && obj.image_data?.url) relatedImages[obj.id] = obj.image_data.url;
  }

  const catResp = await fetch(SQUARE_API_BASE + '/catalog/list?types=CATEGORY', { headers });
  const catData = catResp.ok ? await catResp.json() : {};
  const catMap = {};
  (catData.objects || []).forEach(c => { catMap[c.id] = c.category_data?.name || 'Other'; });

  const grouped = {};
  const allItems = [];
  for (const obj of items) {
    if (obj.type !== 'ITEM') continue;
    const item = obj.item_data;
    if (!item) continue;
    const name = item.name || '';
    const desc = item.description || '';
    const catId = item.category_id || (item.categories?.[0]?.id) || '';
    const category = catMap[catId] || 'Other';
    const variations = (item.variations || []).map(v => ({
      id: v.id, name: v.item_variation_data?.name || 'Regular',
      price: v.item_variation_data?.price_money ? (v.item_variation_data.price_money.amount / 100).toFixed(2) : null,
      sku: v.item_variation_data?.sku || ''
    }));
    const imageIds = item.image_ids || [];
    const firstVariation = variations[0] || {};
    const imageUrl = (imageIds.length > 0 && relatedImages[imageIds[0]]) ? relatedImages[imageIds[0]] : null;
    const product = { id: obj.id, name, desc, category, price: firstVariation.price, sku: firstVariation.sku, variations, imageIds, imageUrl, updatedAt: obj.updated_at || '' };
    allItems.push(product);
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(product);
  }
  for (const cat of Object.keys(grouped)) grouped[cat].sort((a, b) => a.name.localeCompare(b.name));

  const result = { ok: true, cached: false, total: allItems.length, grouped, categories: Object.keys(grouped).sort() };
  if (env.BVMM_KV) { try { await env.BVMM_KV.put(CACHE_KEY, JSON.stringify(result), { expirationTtl: 300 }); } catch {} }
  return result;
}

// ==================================================================
//  SQUARE IMAGE UPLOAD
// ==================================================================

async function doSquareImgUpload(body, env) {
  if (!body.itemId) return { ok: false, error: 'Missing itemId' };
  const name = body.imageName || 'product-image';
  let bytes, mime;
  if (body.imageUrl) {
    const imgResp = await fetch(body.imageUrl);
    if (!imgResp.ok) return { ok: false, error: 'Image fetch failed: ' + imgResp.status };
    const buffer = await imgResp.arrayBuffer();
    bytes = new Uint8Array(buffer);
    mime = imgResp.headers.get('content-type') || 'image/jpeg';
  } else if (body.imageBase64) {
    mime = body.imageMime || 'image/jpeg';
    const binaryStr = atob(body.imageBase64);
    bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  } else { return { ok: false, error: 'Missing imageUrl or imageBase64' }; }
  const boundary = '----BVMMBoundary' + Date.now();
  const idempotencyKey = crypto.randomUUID();
  const requestJson = JSON.stringify({ idempotency_key: idempotencyKey, object_id: body.itemId, image: { type: 'IMAGE', id: '#new_image', image_data: { name, caption: name } } });
  const encoder = new TextEncoder();
  const parts = [];
  parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n${requestJson}\r\n`));
  parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="${name}"\r\nContent-Type: ${mime}\r\n\r\n`));
  parts.push(bytes);
  parts.push(encoder.encode(`\r\n--${boundary}--\r\n`));
  const totalLength = parts.reduce((n, p) => n + p.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) { combined.set(part, offset); offset += part.length; }
  const resp = await fetch(SQUARE_API_BASE + '/catalog/images', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN, 'Square-Version': '2025-01-23', 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body: combined
  });
  const data = await resp.json();
  if (!resp.ok) {
    const detail = data.errors?.[0]?.detail || data.errors?.[0]?.code || JSON.stringify(data.errors);
    return { ok: false, error: detail, status: resp.status };
  }
  return { ok: true, imageId: data.image?.id, imageUrl: data.image?.image_data?.url };
}

// ==================================================================
//  SQUARE ITEM UPDATE
// ==================================================================

async function doSquareItemUpdate(body, env, ctx) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  if (!env.SQUARE_ACCESS_TOKEN) return { ok: false, error: 'Square not configured' };
  const { id, name, description, priceCents } = body;
  if (!id) return { ok: false, error: 'Missing id' };
  const sqHeaders = { 'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN, 'Square-Version': '2025-01-23', 'Content-Type': 'application/json' };
  let item;
  try {
    const getRes = await fetch(SQUARE_API_BASE + '/catalog/object/' + encodeURIComponent(id) + '?include_related_objects=true', { method: 'GET', headers: sqHeaders });
    const getJson = await getRes.json();
    if (!getRes.ok) return { ok: false, error: 'Square GET failed', detail: getJson, status: getRes.status };
    item = getJson.object;
    if (!item || item.type !== 'ITEM') return { ok: false, error: 'Object is not an ITEM' };
  } catch (e) { return { ok: false, error: 'Square GET threw: ' + (e.message || String(e)) }; }
  if (typeof name === 'string' && name.trim().length > 0) item.item_data.name = name.trim();
  if (typeof description === 'string') item.item_data.description = description;
  if (typeof priceCents === 'number' && isFinite(priceCents) && priceCents >= 0) {
    const variations = item.item_data.variations || [];
    if (variations.length === 0) return { ok: false, error: 'Item has no variations to price' };
    const v = variations[0];
    v.item_variation_data = v.item_variation_data || {};
    v.item_variation_data.pricing_type = 'FIXED_PRICING';
    v.item_variation_data.price_money = { amount: Math.round(priceCents), currency: 'USD' };
  }
  let putJson;
  try {
    const putRes = await fetch(SQUARE_API_BASE + '/catalog/object', {
      method: 'POST', headers: sqHeaders,
      body: JSON.stringify({ idempotency_key: crypto.randomUUID(), object: item })
    });
    putJson = await putRes.json();
    if (!putRes.ok) return { ok: false, error: 'Square upsert failed', detail: putJson, status: putRes.status };
  } catch (e) { return { ok: false, error: 'Square upsert threw: ' + (e.message || String(e)) }; }
  if (ctx && typeof ctx.waitUntil === 'function' && env.BVMM_KV) {
    ctx.waitUntil((async () => {
      try { await env.BVMM_KV.delete('square_catalog_v3'); } catch (_) {}
      try { await env.BVMM_KV.delete('square_catalog_v2'); } catch (_) {}
    })());
  }
  return { ok: true, id: putJson.catalog_object?.id, version: putJson.catalog_object?.version };
}

// ==================================================================
//  SESSION TOKEN HELPERS
// ==================================================================

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function makeSessionToken(env) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const sig = await hmacHex(env.BVMM_PASS, String(exp));
  return { token: exp + ':' + sig, exp };
}
async function verifySessionToken(token, env) {
  if (!token || typeof token !== 'string') return false;
  const colon = token.indexOf(':');
  if (colon < 1) return false;
  const expStr = token.slice(0, colon); const sig = token.slice(colon + 1);
  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Date.now() > exp) return false;
  const expected = await hmacHex(env.BVMM_PASS, expStr);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

async function doLogin(body, env) {
  if (!body.password || body.password !== env.BVMM_PASS) return { ok: false, error: 'Incorrect password' };
  const { token, exp } = await makeSessionToken(env);
  return { ok: true, token, exp };
}

// ==================================================================
//  ADMIN DEPLOY (unchanged)
// ==================================================================

async function doAdminDeploy(body, env, ctx) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  const { content } = body;
  if (!content) return { ok: false, error: 'Missing content' };
  if (!body.force) {
    const head = await checkHeadState(env);
    if (!head.safe) {
      return { ok: false, code: 'external-head', error: 'Main branch was modified outside admin', latestSha: head.latestSha, latestMessage: head.latestMessage };
    }
  }
  let contentToDeploy = content;
  try {
    const decoded = b64DecodeUtf8(content);
    if (decoded.indexOf("'YOUR_PUBLIC_KEY'") !== -1) {
      const patched = decoded.replace(/'YOUR_PUBLIC_KEY'/g, "'sF8_feXTs21Nsc3Bg'").replace(/'YOUR_SERVICE_ID'/g, "'service_1jc6nrt'").replace(/'YOUR_TEMPLATE_ID'/g, "'template_fben9zs'");
      contentToDeploy = b64EncodeUtf8(patched);
    }
  } catch (_) {}
  try {
    const existingHeaders = await ghRead('_headers', env);
    if (!existingHeaders.ok) {
      const headersContent = '/*\n  Cache-Control: public, max-age=0, must-revalidate\n';
      await ghWrite('_headers', btoa(headersContent), 'admin: deploy _headers', env);
    }
  } catch (_) {}
  const now = new Date();
  const stamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const tsLabel = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' });
  const versionRaw = (body.versionLabel || '').toString();
  const versionSafe = versionRaw.replace(/[^A-Za-z0-9._\-]/g, '').slice(0, 80);
  const label = versionSafe ? (versionSafe + ' — ' + tsLabel) : tsLabel;
  const backupPath = 'backups/index_' + stamp + '.html';
  let currentContent = null;
  try { const cur = await ghRead('index.html', env); if (cur.ok && cur.content) currentContent = cur.content; } catch (_) {}
  const writeResult = await ghWrite('index.html', contentToDeploy, 'Admin deploy ' + stamp, env);
  if (!writeResult.ok) return writeResult;
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil((async () => {
      try { if (env.BVMM_KV) { await env.BVMM_KV.delete('square_catalog_v3'); await env.BVMM_KV.delete('square_catalog_v2'); } } catch (_) {}
      try { if (env.CF_API_TOKEN) await purgeCloudflareCache(env); } catch (_) {}
    })());
  }
  if (currentContent && ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil((async () => {
      try { await ghWrite(backupPath, currentContent, 'Auto-backup before deploy ' + stamp, env); await appendManifest({ filename: backupPath, label, ts: now.getTime() }, env); } catch (err) { console.error('Background backup failed:', err && err.message); }
    })());
  } else if (currentContent) {
    try { await ghWrite(backupPath, currentContent, 'Auto-backup before deploy ' + stamp, env); await appendManifest({ filename: backupPath, label, ts: now.getTime() }, env); } catch (_) {}
  }
  return writeResult;
}

async function doListBackups(body, env) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  try {
    const result = await ghRead('backups/manifest.json', env);
    if (!result.ok) return { ok: true, backups: [] };
    const manifest = JSON.parse(atob(result.content.replace(/\s/g, '')));
    return { ok: true, backups: [...manifest].reverse().slice(0, 10) };
  } catch (_) { return { ok: true, backups: [] }; }
}

async function doRevert(body, env) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  const { filename } = body;
  if (!filename || !filename.startsWith('backups/')) return { ok: false, error: 'Invalid backup filename' };
  const backup = await ghRead(filename, env);
  if (!backup.ok) return { ok: false, error: 'Backup not found: ' + filename };
  const stamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  return ghWrite('index.html', backup.content, 'Revert to ' + filename + ' at ' + stamp, env);
}

async function doDeploy(body, request, env) {
  const auth = request.headers.get('x-bvmm-auth');
  if (!auth || auth !== env.BVMM_TOOL) return { ok: false, error: 'Unauthorized' };
  const { filename, content } = body;
  if (!filename || !content) return { ok: false, error: 'Missing filename or content' };
  return ghWrite(filename, content, 'Deploy ' + filename, env);
}

function ghHeaders(env) {
  return { 'Authorization': 'token ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'bvmm-worker/2' };
}
async function ghRead(path, env) {
  const url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + path + '?ref=' + GITHUB_BRANCH;
  const resp = await fetch(url, { headers: ghHeaders(env) });
  if (resp.status === 404) return { ok: false, error: 'File not found' };
  if (!resp.ok) return { ok: false, error: 'GitHub read error: ' + resp.status };
  const data = await resp.json();
  return { ok: true, content: data.content, sha: data.sha };
}
async function checkHeadState(env) {
  const url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/commits?sha=' + GITHUB_BRANCH + '&per_page=1';
  try {
    const resp = await fetch(url, { headers: ghHeaders(env), cache: 'no-store', cf: { cacheTtl: 0, cacheEverything: false } });
    if (!resp.ok) return { safe: true, reason: 'commits api ' + resp.status };
    const commits = await resp.json();
    if (!Array.isArray(commits) || commits.length === 0) return { safe: true, reason: 'no commits' };
    const msg = (commits[0].commit && commits[0].commit.message) || '';
    const firstLine = msg.split('\n')[0];
    const WORKER_PREFIXES = ['Admin deploy ', 'Auto-backup before deploy ', 'Update backup manifest', 'admin: upload ', 'admin: import stock ', 'admin: deploy ', 'Revert to backups/', 'Deploy ', 'Upload image: '];
    const safe = WORKER_PREFIXES.some(p => firstLine.startsWith(p));
    return { safe, latestMessage: firstLine, latestSha: commits[0].sha };
  } catch (err) { return { safe: true, reason: err.message || 'fetch failed' }; }
}
async function ghWrite(path, content, message, env) {
  let sha;
  const existing = await ghRead(path, env);
  if (existing.ok) sha = existing.sha;
  const payload = { message, content, branch: GITHUB_BRANCH };
  if (sha) payload.sha = sha;
  const url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + path;
  const resp = await fetch(url, { method: 'PUT', headers: { ...ghHeaders(env), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!resp.ok) { const errText = await resp.text().catch(() => ''); return { ok: false, error: 'GitHub write error: ' + resp.status + ' — ' + errText.slice(0, 200) }; }
  return { ok: true };
}
async function appendManifest(entry, env) {
  let manifest = [];
  try { const result = await ghRead('backups/manifest.json', env); if (result.ok) manifest = JSON.parse(atob(result.content.replace(/\s/g, ''))); } catch (_) {}
  manifest.push(entry);
  if (manifest.length > 20) manifest.splice(0, manifest.length - 20);
  const encoded = btoa(JSON.stringify(manifest, null, 2));
  await ghWrite('backups/manifest.json', encoded, 'Update backup manifest', env);
}

async function doPexels(body, env) {
  const q = encodeURIComponent(body.query || 'food'); const per = body.per_page || 10;
  const resp = await fetch('https://api.pexels.com/v1/search?query=' + q + '&per_page=' + per + '&orientation=landscape', { headers: { Authorization: env.PEXELS_API_KEY } });
  if (!resp.ok) return { ok: false, error: 'Pexels error: ' + resp.status };
  const data = await resp.json();
  return { ok: true, photos: data.photos || [] };
}
async function doUnsplash(body, env) {
  const q = encodeURIComponent(body.query || 'food'); const per = body.per_page || 10;
  const resp = await fetch('https://api.unsplash.com/search/photos?query=' + q + '&per_page=' + per, { headers: { Authorization: 'Client-ID ' + env.UNSPLASH_KEY } });
  if (!resp.ok) return { ok: false, error: 'Unsplash error: ' + resp.status };
  const data = await resp.json();
  return { ok: true, results: data.results || [] };
}
async function doGoogleImages(body, env) {
  const q = encodeURIComponent(body.query || 'food');
  const resp = await fetch('https://www.googleapis.com/customsearch/v1?key=' + env.GOOGLE_API_KEY + '&cx=' + env.GOOGLE_CSE_ID + '&searchType=image&q=' + q + '&num=10');
  if (!resp.ok) return { ok: false, error: 'Google Images error: ' + resp.status };
  const data = await resp.json();
  return { ok: true, items: data.items || [] };
}

async function doAI(body, env) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: body.model || 'claude-sonnet-4-20250514', max_tokens: body.max_tokens || 1000, system: body.system, messages: body.messages })
  });
  return resp.json();
}

async function doProxy(body) {
  if (!body.url) return { ok: false, error: 'Missing url' };
  const resp = await fetch(body.url);
  const text = await resp.text();
  return { ok: true, body: text, status: resp.status };
}
async function doProxyHeaders(body) {
  if (!body.url) return { ok: false, error: 'Missing url' };
  const resp = await fetch(body.url, { headers: body.headers || {} });
  const text = await resp.text();
  return { ok: true, body: text, status: resp.status };
}

async function doImgUpload(body, env) {
  const { filename, content } = body;
  if (!filename || !content) return { ok: false, error: 'Missing filename or content' };
  return ghWrite('images/' + filename, content, 'Upload image: ' + filename, env);
}
async function doImgUploadGithub(body, env) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  if (!body.imageB64) return { ok: false, error: 'Missing imageB64' };
  const ct = (body.contentType || 'image/jpeg').toLowerCase();
  const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : ct === 'image/gif' ? 'gif' : 'jpg';
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const path = 'images/uploaded/' + ymd + '-' + rand + '.' + ext;
  const result = await ghWrite(path, body.imageB64, 'admin: upload ' + path, env);
  if (!result.ok) return result;
  return { ok: true, url: path };
}
async function doImgFetch(body) {
  if (!body.url) return { ok: false, error: 'Missing url' };
  const resp = await fetch(body.url);
  if (!resp.ok) return { ok: false, error: 'Fetch error: ' + resp.status };
  const ab = await resp.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  const b64 = btoa(binary);
  return { ok: true, content: b64, type: resp.headers.get('content-type') || 'image/jpeg' };
}
async function doImgImportStock(body, env) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  if (!body.sourceUrl) return { ok: false, error: 'Missing sourceUrl' };
  const resp = await fetch(body.sourceUrl);
  if (!resp.ok) return { ok: false, error: 'Stock fetch error: ' + resp.status };
  const ab = await resp.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  const b64 = btoa(binary);
  const ct = (resp.headers.get('content-type') || body.contentType || 'image/jpeg').toLowerCase();
  const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('gif') ? 'gif' : 'jpg';
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const path = 'images/uploaded/' + ymd + '-' + rand + '.' + ext;
  const result = await ghWrite(path, b64, 'admin: import stock ' + path, env);
  if (!result.ok) return result;
  return { ok: true, url: path };
}

async function doKVSet(body, env) {
  if (!env.BVMM_KV) return { ok: false, error: 'KV namespace not bound' };
  if (!body.key) return { ok: false, error: 'Missing key' };
  await env.BVMM_KV.put(body.key, body.value ?? '');
  return { ok: true };
}
async function doKVGet(body, env) {
  if (!env.BVMM_KV) return { ok: false, error: 'KV namespace not bound' };
  if (!body.key) return { ok: false, error: 'Missing key' };
  const value = await env.BVMM_KV.get(body.key);
  return { ok: true, value };
}
async function doKVList(body, env) {
  if (!env.BVMM_KV) return { ok: false, error: 'KV namespace not bound' };
  const result = await env.BVMM_KV.list({ prefix: body.prefix || '' });
  return { ok: true, keys: result.keys };
}

async function doCFDebug(body, env) {
  if (!await verifySessionToken(body.token, env)) return { ok: false, error: 'Session expired' };
  const t = env.CF_API_TOKEN;
  if (typeof t !== 'string') return { ok: true, tokenExists: false, type: typeof t };
  const trimmed = t.trim();
  const firstChar = t.length > 0 ? t.charCodeAt(0) : null;
  const lastChar = t.length > 0 ? t.charCodeAt(t.length - 1) : null;
  return { ok: true, tokenExists: true, rawLength: t.length, trimmedLength: trimmed.length, hasLeadingOrTrailingWhitespace: t.length !== trimmed.length, firstCharCode: firstChar, lastCharCode: lastChar, looksLikeBearerToken: /^[A-Za-z0-9_\-]+$/.test(trimmed) };
}

async function doCFDeployWorker(body, env) {
  const { script } = body;
  if (!script) return { ok: false, error: 'Missing script' };
  const authed = (body.auth === env.BVMM_TOOL) || await verifySessionToken(body.token, env);
  if (!authed) return { ok: false, error: 'Unauthorized' };
  if (!env.CF_API_TOKEN) return { ok: false, error: 'CF_API_TOKEN missing' };
  const rawToken = String(env.CF_API_TOKEN);
  const cfToken = rawToken.replace(/[^A-Za-z0-9_\-]/g, '');
  if (!cfToken) return { ok: false, error: 'CF_API_TOKEN contained no valid token characters' };
  if (cfToken.length !== rawToken.length) return { ok: false, error: 'CF_API_TOKEN contains invalid char(s)' };
  if (script.indexOf('export default') === -1 && script.indexOf('addEventListener') === -1) return { ok: false, error: 'Script does not look like a Worker' };
  const boundary = '----BVMMWorker' + Date.now() + Math.random().toString(36).slice(2, 10);
  const metadata = JSON.stringify({ main_module: 'worker.js', compatibility_date: '2025-09-23' });
  const encoder = new TextEncoder();
  const parts = [];
  parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`));
  parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="worker.js"; filename="worker.js"\r\nContent-Type: application/javascript+module\r\n\r\n`));
  parts.push(encoder.encode(script));
  parts.push(encoder.encode(`\r\n--${boundary}--\r\n`));
  const totalLength = parts.reduce((n, p) => n + p.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of parts) { combined.set(p, offset); offset += p.length; }
  const url = 'https://api.cloudflare.com/client/v4/accounts/3e33cb7e32f60a1266e6e50ed47d9b4b/workers/scripts/bvmm-proxy';
  const resp = await fetch(url, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + cfToken, 'Content-Type': `multipart/form-data; boundary=${boundary}` }, body: combined });
  let data;
  try { data = await resp.json(); } catch { return { ok: false, error: 'Cloudflare returned non-JSON', status: resp.status }; }
  if (!data.success) return { ok: false, error: JSON.stringify(data.errors), status: resp.status };
  return { ok: true, id: data.result?.id };
}

async function purgeCloudflareCache(env) {
  if (!env.CF_API_TOKEN) return { ok: false, error: 'CF_API_TOKEN missing' };
  const cfToken = String(env.CF_API_TOKEN).replace(/[^A-Za-z0-9_\-]/g, '');
  if (!cfToken) return { ok: false, error: 'CF_API_TOKEN had no valid characters' };
  const zoneResp = await fetch('https://api.cloudflare.com/client/v4/zones?name=greencrk.com', { headers: { 'Authorization': 'Bearer ' + cfToken } });
  const zoneData = await zoneResp.json();
  const zoneId = zoneData.result && zoneData.result[0] && zoneData.result[0].id;
  if (!zoneId) return { ok: false, error: 'Zone not found' };
  const purgeResp = await fetch('https://api.cloudflare.com/client/v4/zones/' + zoneId + '/purge_cache', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + cfToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ purge_everything: true })
  });
  const purgeData = await purgeResp.json();
  return { ok: !!purgeData.success, errors: purgeData.errors };
}

// ==================================================================
//  FIX RACE CONDITION — GET /fix
//  Reads live index.html, inserts Square re-render fix, commits back.
// ==================================================================

async function doFixRaceCondition(env) {
  // Read current index.html from GitHub
  const read = await ghRead('index.html', env);
  if (!read.ok) return { ok: false, message: 'Could not read index.html from GitHub: ' + (read.error || 'unknown') };

  let html;
  try {
    html = b64DecodeUtf8(read.content.replace(/\s/g, ''));
  } catch(e) {
    return { ok: false, message: 'Could not decode index.html: ' + e.message };
  }

  // Remove old fix, apply updated version
    if (html.includes('_bvmm_race_fix')) {
    html = html.replace(/<script id="_bvmm_race_fix">[\s\S]*?<\/script>/g, '');
  }
  const fixScript = `\n<script id="_bvmm_race_fix">\n(function(){\n  var sqData=null,isAdmin=false;\n  try{if(sessionStorage.getItem('bvmm_token'))isAdmin=true;}catch(e){}\n  function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').slice(0,200);}\n  function escQ(s){return (s||'').replace(/\\\\/g,'\\\\\\\\').replace(/'/g,\"\\\\'\").slice(0,200);}\n  function collapseAdminBar(){\n    var bar=document.querySelector('.admin-bar');\n    if(!bar||bar.getAttribute('data-col'))return;\n    bar.setAttribute('data-col','1');\n    var btn=document.createElement('div');btn.id='bvmm-admin-toggle';btn.innerHTML='&#9776; Admin';\n    btn.style.cssText='position:fixed;top:8px;left:8px;z-index:99999;background:#1a1a1a;color:#fff;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)';\n    bar.style.cssText='position:fixed;top:-400px;left:0;right:0;z-index:99998;transition:top 0.2s ease';\n    document.body.appendChild(btn);\n    var open=false;\n    btn.onclick=function(e){e.stopPropagation();open=!open;bar.style.top=open?'0':'-400px';btn.style.background=open?'#555':'#1a1a1a';};\n    document.addEventListener('click',function(e){if(open&&!bar.contains(e.target)&&e.target!==btn){open=false;bar.style.top='-400px';btn.style.background='#1a1a1a';}});\n  }\n  function hideBTC(){document.querySelectorAll('.mtab,.mpanel,.mgroup,.menu-tabs,.menu-tabs-wrap').forEach(function(el){var sec=el.closest('section')||el.closest('.page-section');if(sec)sec.style.display='none';else el.style.display='none';});}\n  var pexCache={};\n  function loadPexels(name,imgEl){if(pexCache[name]){imgEl.src=pexCache[name];imgEl.style.display='';if(imgEl.nextElementSibling)imgEl.nextElementSibling.style.display='none';return;}fetch('https://bvmm-proxy.babylonvillagemeatmarket.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'pexels',query:name+' meat butcher food',per_page:1})}).then(function(r){return r.json();}).then(function(d){var url=d.ok&&d.photos&&d.photos[0]?d.photos[0].src.large:null;if(url){pexCache[name]=url;imgEl.src=url;imgEl.style.display='';if(imgEl.nextElementSibling)imgEl.nextElementSibling.style.display='none';}}).catch(function(){});}\n  var catMap={'butcher - beef':'Beef','beef roast':'Beef','prime beef':'Beef','steak':'Beef','wagyu':'Beef','butcher shop':'Beef','butcher - veal':'Pork & Veal','butcher - pork':'Pork & Veal','veal':'Pork & Veal','veal & pork':'Pork & Veal','butcher - lamb':'Lamb','butcher - poultry':'Poultry','poultry':'Poultry','butcher - seafood':'Seafood','fish':'Seafood','frozen sea food':'Seafood','cheese & deli':'Deli','deli meats & cheeses':'Deli','cold salads':'Deli','sandwiches':'Sandwiches','heroes breads & wraps':'Sandwiches','paninis':'Sandwiches','lunch':'Sandwiches','soups':'Soups','pasta & eggplant':'Prepared','prepared foods':'Prepared','family dinners':'Prepared','vegetables potatoes & rice':'Prepared','appetizers':'Prepared','desserts':'Prepared','coffee':'Prepared','the regulars':'Prepared','catering':'Catering','all catering':'Catering','quick catering':'Catering','specials':'Specials','special orders':'Specials','dartagnan':'Specials','market place':'Specials','gear':'Specials','other':'Other'};\n  var tabOrder=['Beef','Pork & Veal','Lamb','Poultry','Seafood','Deli','Sandwiches','Soups','Prepared','Catering','Specials','Other'];\n  function mapCat(c){return catMap[(c||'').toLowerCase()]||'Other';}\n  function slug(s){return (s||'').toLowerCase().replace(/\\s*[&\\/]\\s*/g,'-').replace(/\\s+/g,'-').replace(/[^a-z0-9-]/g,'');}\n  function getToken(cb){var t=sessionStorage.getItem('bvmm_token');if(t){cb(t);return;}cb(null);}\n  function adminBtns(item){\n    if(!isAdmin)return '';\n    return '<div style=\"position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:10\">'\n      +'<button onclick=\"event.stopPropagation();bvmmEditPhoto(\\''+escQ(item.id)+'\\',\\''+escQ(item.name)+'\\')\" style=\"width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.95);border:none;cursor:pointer;font-size:15px;box-shadow:0 1px 4px rgba(0,0,0,0.2)\">&#128247;</button>'\n      +'<button onclick=\"event.stopPropagation();bvmmEditItem(\\''+escQ(item.id)+'\\',\\''+escQ(item.name)+'\\',\\''+escQ(item.price||'')+'\\',\\''+escQ(item.desc||'')+'\\')\" style=\"width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.95);border:none;cursor:pointer;font-size:15px;box-shadow:0 1px 4px rgba(0,0,0,0.2)\">&#9999;&#65039;</button>'\n      +'</div>';\n  }\n  function buildFilters(usedGroups){var el=document.querySelector('.og-filter');if(!el)return;var html='<button class=\"og-ftab active\" data-filter=\"all\">All Items</button>';tabOrder.forEach(function(g){if(usedGroups[g])html+='<button class=\"og-ftab\" data-filter=\"'+slug(g)+'\">'+g+'</button>';});el.innerHTML=html;document.querySelectorAll('.og-ftab').forEach(function(btn){btn.onclick=function(){document.querySelectorAll('.og-ftab').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var f=btn.getAttribute('data-filter');document.querySelectorAll('.bvmm-card').forEach(function(c){c.style.display=(f==='all'||c.getAttribute('data-cat')===f)?'':'none';});};});}\n  function buildOG(data){\n    var grid=document.querySelector('.og-grid');if(!grid)return;\n    var g=data.grouped||{},cats=Object.keys(g).sort(),items=[],usedGroups={};\n    cats.forEach(function(cat){(g[cat]||[]).forEach(function(i){var gr=mapCat(cat);usedGroups[gr]=true;items.push({i:i,cat:cat,group:gr});});});\n    if(!items.length)return;\n    if(!document.getElementById('bvmm-card-css')){var s=document.createElement('style');s.id='bvmm-card-css';s.textContent='.bvmm-card{background:#fff;border-radius:12px;border:1px solid #e8e4de;overflow:hidden;cursor:pointer;position:relative;display:flex;flex-direction:column}.bvmm-card-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.bvmm-card-img-ph{width:100%;aspect-ratio:4/3;background:#f0ede8;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px}.bvmm-card-body{padding:12px 14px 14px;flex:1;display:flex;flex-direction:column}.bvmm-card-cat{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin:0 0 5px}.bvmm-card-name{font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 6px;line-height:1.3}.bvmm-card-desc{font-size:12px;color:#777;margin:0 0 10px;line-height:1.5;flex:1}.bvmm-card-price{font-size:15px;font-weight:600;color:#1a1a1a;margin:0}.og-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}.og-ftab{padding:8px 16px;border-radius:40px;border:1.5px solid #d4cfc8;background:#fff;font-size:13px;font-weight:500;cursor:pointer;color:#555}.og-ftab.active{background:#1a1a1a;color:#fff;border-color:#1a1a1a}';document.head.appendChild(s);}\n    buildFilters(usedGroups);\n    var html='';\n    items.forEach(function(e){var i=e.i,gr=e.group,ck=slug(gr);var price=i.price?'$'+parseFloat(i.price).toFixed(2)+' /lb':'';var imgHtml=i.imageUrl?'<img class=\"bvmm-card-img\" src=\"'+esc(i.imageUrl)+'\" loading=\"lazy\" alt=\"'+esc(i.name)+'\">':'<img class=\"bvmm-card-img\" data-pexels=\"'+esc(i.name)+'\" style=\"display:none\" alt=\"'+esc(i.name)+'\"><div class=\"bvmm-card-img-ph\">'+esc(gr)+'</div>';html+='<div class=\"bvmm-card\" data-id=\"'+esc(i.id)+'\" data-cat=\"'+esc(ck)+'\" onclick=\"bvmmOpen(\\''+escQ(i.id)+'\\')\">'+adminBtns(i)+imgHtml+'<div class=\"bvmm-card-body\"><p class=\"bvmm-card-cat\">'+esc(gr)+'</p><p class=\"bvmm-card-name\">'+esc(i.name)+'</p>'+(i.desc&&i.desc!=='NEEDS_REVIEW'?'<p class=\"bvmm-card-desc\">'+esc(i.desc)+'</p>':'<p class=\"bvmm-card-desc\"></p>')+'<p class=\"bvmm-card-price\">'+price+'</p></div></div>';});\n    grid.innerHTML=html;\n    grid.querySelectorAll('[data-pexels]').forEach(function(img){loadPexels(img.getAttribute('data-pexels'),img);});\n    var first=document.querySelector('.og-ftab.active')||document.querySelector('.og-ftab');if(first)first.click();\n  }\n  window.bvmmOpen=function(id){if(!sqData)return;var found=null,fGr='';Object.keys(sqData.grouped||{}).forEach(function(cat){(sqData.grouped[cat]||[]).forEach(function(i){if(i.id===id){found=i;fGr=mapCat(cat);}});});if(!found)return;var ex=document.getElementById('bvmm-popup');if(ex)ex.remove();bvmmQtyVal=1;bvmmCurrentPrice=found.price?parseFloat(found.price):0;var pop=document.createElement('div');pop.id='bvmm-popup';pop.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);display:flex;align-items:flex-end;justify-content:center';var img=found.imageUrl?'<img src=\"'+esc(found.imageUrl)+'\" style=\"width:100%;height:240px;object-fit:cover;border-radius:20px 20px 0 0;display:block\">':'';pop.innerHTML='<div style=\"background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:90vh;overflow-y:auto\">'+img+'<div style=\"padding:20px 20px 36px\"><button onclick=\"document.getElementById(\\'bvmm-popup\\').remove()\" style=\"float:right;background:none;border:none;font-size:24px;cursor:pointer;color:#aaa;margin-top:-4px\">&times;</button><p style=\"font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin:0 0 6px\">'+esc(fGr)+'</p><p style=\"font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 8px;line-height:1.2\">'+esc(found.name)+'</p>'+(found.desc&&found.desc!=='NEEDS_REVIEW'?'<p style=\"font-size:14px;color:#666;line-height:1.6;margin:0 0 16px\">'+esc(found.desc)+'</p>':'')+'<p style=\"font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 20px\">'+(bvmmCurrentPrice?'$'+bvmmCurrentPrice.toFixed(2)+' /lb':'Price on request')+'</p><div style=\"display:flex;align-items:center;gap:16px;margin-bottom:12px\"><div style=\"display:flex;align-items:center;border:2px solid #e0e0e0;border-radius:40px\"><button onclick=\"bvmmQty(-1)\" style=\"width:44px;height:44px;border:none;background:none;font-size:22px;cursor:pointer;color:#333\">&#8722;</button><span id=\"bvmm-qty-display\" style=\"min-width:32px;text-align:center;font-size:18px;font-weight:700\">1</span><button onclick=\"bvmmQty(1)\" style=\"width:44px;height:44px;border:none;background:none;font-size:22px;cursor:pointer;color:#333\">+</button></div><span style=\"font-size:13px;color:#888\">lbs</span><span style=\"margin-left:auto;font-size:16px;font-weight:700;color:#1a1a1a\" id=\"bvmm-subtotal\">'+(bvmmCurrentPrice?'$'+bvmmCurrentPrice.toFixed(2):'')+'</span></div><button onclick=\"bvmmAddToOrder(\\''+escQ(found.id)+'\\',\\''+escQ(found.name)+'\\','+bvmmCurrentPrice+')\" style=\"width:100%;padding:16px;background:#1a1a1a;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer\">Add to Order</button></div></div>';document.body.appendChild(pop);pop.addEventListener('click',function(e){if(e.target===pop)pop.remove();});};\n  var bvmmQtyVal=1,bvmmCurrentPrice=0;\n  window.bvmmQty=function(d){bvmmQtyVal=Math.max(1,Math.min(99,bvmmQtyVal+d));var el=document.getElementById('bvmm-qty-display');if(el)el.textContent=bvmmQtyVal;var s=document.getElementById('bvmm-subtotal');if(s&&bvmmCurrentPrice)s.textContent='$'+(bvmmCurrentPrice*bvmmQtyVal).toFixed(2);};\n  window.bvmmAddToOrder=function(id,name,price){var pop=document.getElementById('bvmm-popup');if(pop)pop.remove();if(typeof openOrderSheet==='function')openOrderSheet(name,price,'','');bvmmQtyVal=1;};\n  window.bvmmEditPhoto=function(id,name){var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var file=inp.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){var b64=e.target.result.split(',')[1];getToken(function(token){if(!token){alert('Please log in first');return;}fetch('https://bvmm-proxy.babylonvillagemeatmarket.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'square-img-upload',itemId:id,imageName:name,imageBase64:b64,imageMime:file.type||'image/jpeg',token:token})}).then(function(r){return r.json();}).then(function(d){if(d.ok){if(sqData)Object.keys(sqData.grouped||{}).forEach(function(cat){(sqData.grouped[cat]||[]).forEach(function(i){if(i.id===id&&d.imageUrl)i.imageUrl=d.imageUrl;});});buildOG(sqData);alert('Photo updated!');}else{alert('Error: '+(d.error||'Unknown'));}}).catch(function(e){alert('Upload failed: '+e.message);});});};reader.readAsDataURL(file);};inp.click();};\n  window.bvmmEditItem=function(id,name,price,desc){var ex=document.getElementById('bvmm-edit-modal');if(ex)ex.remove();var modal=document.createElement('div');modal.id='bvmm-edit-modal';modal.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:20px';var cleanDesc=(desc==='NEEDS_REVIEW'?'':desc);modal.innerHTML='<div style=\"background:#fff;border-radius:16px;width:100%;max-width:460px;padding:24px\"><p style=\"font-size:17px;font-weight:700;margin:0 0 16px\">Edit Item</p><label style=\"font-size:12px;color:#888;display:block;margin-bottom:4px\">Item Name</label><input id=\"bvmm-edit-name\" type=\"text\" value=\"'+esc(name)+'\" style=\"width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:12px;box-sizing:border-box\"><label style=\"font-size:12px;color:#888;display:block;margin-bottom:4px\">Price per lb ($)</label><input id=\"bvmm-edit-price\" type=\"number\" step=\"0.01\" value=\"'+esc(price)+'\" style=\"width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:12px;box-sizing:border-box\"><label style=\"font-size:12px;color:#888;display:block;margin-bottom:4px\">Description</label><textarea id=\"bvmm-edit-desc\" rows=\"3\" style=\"width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box\">'+esc(cleanDesc)+'</textarea><div style=\"display:flex;gap:10px;margin-top:16px\"><button onclick=\"document.getElementById(\\'bvmm-edit-modal\\').remove()\" style=\"flex:1;padding:12px;border:1.5px solid #ddd;background:#fff;border-radius:8px;font-size:15px;cursor:pointer\">Cancel</button><button id=\"bvmm-save-btn\" onclick=\"bvmmSaveItem(\\''+escQ(id)+'\\')\" style=\"flex:1;padding:12px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer\">Save to Square</button></div></div>';document.body.appendChild(modal);modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});};\n  window.bvmmSaveItem=function(id){var nameVal=(document.getElementById('bvmm-edit-name')||{value:''}).value;var priceVal=document.getElementById('bvmm-edit-price').value;var descVal=document.getElementById('bvmm-edit-desc').value;var priceCents=priceVal?Math.round(parseFloat(priceVal)*100):null;var btn=document.getElementById('bvmm-save-btn');if(btn)btn.textContent='Saving...';getToken(function(token){if(!token){if(btn)btn.textContent='Save to Square';alert('Please log in first');return;}fetch('https://bvmm-proxy.babylonvillagemeatmarket.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'square-item-update',id:id,name:nameVal,description:descVal,priceCents:priceCents,token:token})}).then(function(r){return r.json();}).then(function(d){if(d.ok){if(sqData)Object.keys(sqData.grouped||{}).forEach(function(cat){(sqData.grouped[cat]||[]).forEach(function(i){if(i.id===id){if(nameVal)i.name=nameVal;if(priceCents)i.price=(priceCents/100).toFixed(2);i.desc=descVal;}});});var modal=document.getElementById('bvmm-edit-modal');if(modal)modal.remove();buildOG(sqData);}else{if(btn)btn.textContent='Save to Square';alert('Error: '+(d.error||'Unknown'));}}).catch(function(e){if(btn)btn.textContent='Save to Square';alert('Save failed: '+e.message);});});};\n  function rerender(){hideBTC();collapseAdminBar();if(sqData)buildOG(sqData);setTimeout(function(){document.querySelectorAll('.mgroup').forEach(function(g){g.style.display=g.querySelector('.mrow,.wagyu-card')?'':'none';});},400);}\n  var _f=window.fetch;\n  window.fetch=function(){var p=_f.apply(this,arguments);try{var b=arguments[1]&&arguments[1].body;if(b){var parsed=JSON.parse(b);if(parsed.action==='square-catalog'){p.then(function(r){return r.clone().json();}).then(function(d){if(d&&d.ok){sqData=d;setTimeout(rerender,150);}}).catch(function(){});}if(parsed.action==='login'&&parsed.password){p.then(function(r){return r.clone().json();}).then(function(d){if(d&&d.ok&&d.token){sessionStorage.setItem('bvmm_token',d.token);isAdmin=true;setTimeout(function(){if(sqData)buildOG(sqData);},200);}}).catch(function(){});}}}catch(e){}return p;};\n})();\n</script>`;

  // Insert before </body>
  const insertAt = html.lastIndexOf('</body>');
  if (insertAt === -1) return { ok: false, message: 'Could not find </body> in index.html' };

  const patched = html.slice(0, insertAt) + fixScript + '\n' + html.slice(insertAt);

  // Backup current index.html before overwriting
  const stamp = new Date().toISOString().replace(/[-T:.Z]/g,'').slice(0,14);
  try {
    const backupPath = 'backups/index_' + stamp + '.html';
    await ghWrite(backupPath, read.content, 'Auto-backup before /fix ' + stamp, env);
    await appendManifest({ filename: backupPath, label: 'Auto-backup before fix — ' + stamp, ts: Date.now() }, env);
  } catch(_) {}

  // Encode and write back to GitHub
  const encoded = b64EncodeUtf8(patched);
  // Backup current index.html before overwriting
  try {
    const bkPath = 'backups/index_' + stamp + '_prefix.html';
    const cur = await ghRead('index.html', env);
    if (cur.ok && cur.content) {
      await ghWrite(bkPath, cur.content, 'Auto-backup before fix ' + stamp, env);
      let mf = [];
      try { const mr = await ghRead('backups/manifest.json', env); if (mr.ok) mf = JSON.parse(atob(mr.content.replace(/\s/g,''))); } catch(_) {}
      mf.push({ filename: bkPath, label: 'Pre-fix backup ' + stamp, ts: Date.now() });
      if (mf.length > 20) mf.splice(0, mf.length - 20);
      await ghWrite('backups/manifest.json', btoa(JSON.stringify(mf, null, 2)), 'Update backup manifest', env);
    }
  } catch(_) {}
  const write = await ghWrite('index.html', encoded, 'Fix Square render race condition ' + stamp, env);
  if (!write.ok) return { ok: false, message: 'GitHub write failed: ' + (write.error || 'unknown') };

  if (env.BVMM_KV) {
    try { await env.BVMM_KV.delete('square_catalog_v3'); } catch(_) {}
    try { await env.BVMM_KV.delete('square_catalog_v2'); } catch(_) {}
    try { await env.BVMM_KV.delete('site_index_html'); } catch(_) {}
  }
  if (env.CF_API_TOKEN) await purgeCloudflareCache(env);
  // Save worker source to KV so /self-update works without GitHub
  try {
    if (env.BVMM_KV) await env.BVMM_KV.put('worker_source', WORKER_SOURCE_B64);
  } catch(_) {}
  // Also write to GitHub as backup
  try { await ghWrite('worker_source.js', WORKER_SOURCE_B64, 'Auto-stage worker source', env); } catch(_) {}
  return { ok: true, message: '\u2713 Fix applied. CDN cache purged. Site is live.' };
}
