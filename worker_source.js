const GITHUB_OWNER  = 'bvmm-droid';
const GITHUB_REPO   = 'greencrk-site';
const GITHUB_BRANCH = 'main';

const SQUARE_API_BASE   = 'https://connect.squareup.com/v2';
const SQUARE_LOCATION_ID = 'LWZJXYFHRWCCJ';
const WORKER_SOURCE_B64 = 'PLACEHOLDER';



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

      if (url.pathname === '/thank-you') {
        const tyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order Received</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;background:#faf8f5;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{background:#fff;border-radius:20px;padding:40px 32px;max-width:420px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}.check{width:64px;height:64px;background:#e8f5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:32px}h1{font-size:1.6rem;font-weight:700;color:#1a1a1a;margin-bottom:12px}p{font-size:.95rem;color:#666;line-height:1.6;margin-bottom:24px}.btn{display:inline-block;padding:14px 32px;background:#1a1a1a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600}</style></head><body><div class="card"><div class="check">✓</div><h1>Order Received!</h1><p>Thank you — we got your order and we’ll have everything ready for pickup. You’ll receive a confirmation from Square shortly.</p><a href="https://greencrk.com" class="btn">Back to greencrk.com</a></div></body></html>`;
        return new Response(tyHtml, { headers: { 'Content-Type': 'text/html;charset=utf-8', ...CORS } });
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
        case 'cf-deploy-worker':      result = await doCFDeployWorker(body, env, ctx); break;
        case 'square-payment-link':   result = await doSquarePaymentLink(body, env); break;
        case 'square-order-create':   result = await doSquareOrderCreate(body, env); break;
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


async function doSquareOrderCreate(body, env) {
  if (!env.SQUARE_ACCESS_TOKEN) return { ok: false, error: 'Square not configured' };
  const { items } = body;
  if (!items || !items.length) return { ok: false, error: 'No items' };
  const sqH = { 'Authorization': 'Bearer ' + env.SQUARE_ACCESS_TOKEN, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' };
  const line_items = items.map(item => {
    const li = { name: item.name, quantity: String(Math.max(0.01, parseFloat(item.quantity)||1)), base_price_money: { amount: Math.round((parseFloat(item.price)||0)*100), currency: 'USD' } };
    if (item.unit === 'lb') li.quantity_unit = { measurement_unit: { custom_unit: { name: 'lb', abbreviation: 'lb' } }, precision: 2 };
    return li;
  });
  const orderResp = await fetch(SQUARE_API_BASE + '/orders', { method: 'POST', headers: sqH, body: JSON.stringify({ idempotency_key: crypto.randomUUID(), order: { location_id: SQUARE_LOCATION_ID, line_items } }) });
  const orderData = await orderResp.json();
  if (!orderResp.ok) return { ok: false, error: orderData.errors?.[0]?.detail || 'Order failed', detail: orderData };
  const linkResp = await fetch(SQUARE_API_BASE + '/online-checkout/payment-links', { method: 'POST', headers: sqH, body: JSON.stringify({ idempotency_key: crypto.randomUUID(), order_id: orderData.order.id, checkout_options: { redirect_url: 'https://greencrk.com/thank-you', ask_for_shipping_address: false } }) });
  const linkData = await linkResp.json();
  if (!linkResp.ok) return { ok: false, error: linkData.errors?.[0]?.detail || 'Link failed', detail: linkData };
  return { ok: true, url: linkData.payment_link.url, orderId: orderData.order.id };
}

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
    const varData0 = (item.variations||[])[0]?.item_variation_data;
    const hasMUnit = !!(varData0?.measurement_unit_id);
    const vName0 = (varData0?.name||'').toLowerCase();
    const isLb = hasMUnit||vName0.includes('lb')||vName0.includes('pound');
    const unit = isLb ? 'lb' : 'each';
    const product = { id: obj.id, name, desc, category, price: firstVariation.price, sku: firstVariation.sku, unit, variations, imageIds, imageUrl, updatedAt: obj.updated_at || '' };
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

async function doCFDeployWorker(body, env, ctx) {
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
  // Auto-run /fix in background so the new fix script is injected immediately
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil((async () => {
      try {
        await new Promise(r => setTimeout(r, 3000)); // wait for worker to propagate
        await fetch('https://bvmm-proxy.babylonvillagemeatmarket.workers.dev/fix');
      } catch(_) {}
    })());
  }
  return { ok: true, id: data.result?.id, autoFix: true };
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
  const fixScript = `
<script id="_bvmm_race_fix">
(function(){
  var WORKER='https://bvmm-proxy.babylonvillagemeatmarket.workers.dev';
  var tabMap={
    'beef':'Butcher','pork & veal':'Butcher','lamb':'Butcher','poultry':'Butcher','seafood':'Butcher',
    'wagyu':'Butcher','butcher':'Butcher','butcher - beef':'Butcher','butcher - pork':'Butcher',
    'butcher - veal':'Butcher','butcher - lamb':'Butcher','butcher - poultry':'Butcher',
    'butcher - seafood':'Butcher','prime beef':'Butcher','fish':'Butcher','frozen sea food':'Butcher',
    'beef roast':'Butcher','steak':'Butcher','butcher shop':'Butcher','veal':'Butcher','veal & pork':'Butcher',
    'chicken':'Butcher','turkey':'Butcher','berkshire pork':'Butcher','shellfish':'Butcher',
    'deli':'Deli','cold salads':'Deli','cheese & deli':'Deli','deli meats & cheeses':'Deli',
    'sandwiches':'Deli','heroes breads & wraps':'Deli','paninis':'Deli','lunch':'Deli','soups':'Deli',
    'catering':'Catering','all catering':'Catering','quick catering':'Catering','market place':'Catering',
    'prepared':'Other','prepared foods':'Other','family dinners':'Other','pasta & eggplant':'Other',
    'vegetables potatoes & rice':'Other','appetizers':'Other','desserts':'Other','coffee':'Other',
    'specials':'Other','special orders':'Other','dartagnan':'Other','gear':'Other',
    'the regulars':'Other','drinks':'Other','other':'Other'
  };
  function mapTab(c){return tabMap[(c||'').toLowerCase()]||'Other';}
  function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').slice(0,300);}
  function escQ(s){return(s||'').replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'").slice(0,200);}
  var sqData=null,pexCache={},_rebuilding=false,_observer=null;
  var cart=[];
  function cartTotal(){return cart.reduce(function(s,c){return s+(parseFloat(c.price)||0)*c.qty;},0);}
  function cartCount(){return cart.reduce(function(s,c){return s+c.qty;},0);}
  function updateCartUI(){
    var badge=document.getElementById('bvmm-cart-count');
    if(badge)badge.textContent=cart.length>0?cartCount():'';
    var bar=document.getElementById('bvmm-cart-bar');
    if(bar)bar.style.display=cart.length>0?'flex':'none';
    if(bar){
      var tot=bar.querySelector('.bvmm-bar-total');if(tot)tot.textContent='$'+cartTotal().toFixed(2);
      var cnt=bar.querySelector('.bvmm-bar-count');if(cnt)cnt.textContent=cart.length+' item'+(cart.length!==1?'s':'');
    }
  }
  function injectCartBar(){
    if(document.getElementById('bvmm-cart-bar'))return;
    var bar=document.createElement('div');bar.id='bvmm-cart-bar';
    bar.style.cssText='display:none;position:fixed;bottom:0;left:0;right:0;z-index:8000;background:#1a1a1a;color:#fff;padding:14px 20px;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 -2px 16px rgba(0,0,0,.2)';
    bar.innerHTML='<div><div class="bvmm-bar-count" style="font-size:13px;opacity:.7"></div><div class="bvmm-bar-total" style="font-size:20px;font-weight:700"></div></div><button onclick="bvmmCheckout()" style="padding:12px 28px;background:#fff;color:#1a1a1a;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Checkout \u2192</button>';
    document.body.appendChild(bar);
  }
  function loadPexels(name,img){
    if(pexCache[name]){img.src=pexCache[name];img.style.display='';if(img.nextElementSibling)img.nextElementSibling.style.display='none';return;}
    fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'pexels',query:name+' food',per_page:1})})
    .then(function(r){return r.json();}).then(function(d){var u=d.ok&&d.photos&&d.photos[0]?d.photos[0].src.large:null;if(u){pexCache[name]=u;img.src=u;img.style.display='';if(img.nextElementSibling)img.nextElementSibling.style.display='none';}}).catch(function(){});
  }
  function applyMyTabs(data){
    var fe=document.querySelector('.og-filter');var grid=document.querySelector('.og-grid');
    if(!fe||!grid)return;
    injectCartBar();
    var tabs=['Butcher','Deli','Catering','Other'];
    var grouped={};tabs.forEach(function(t){grouped[t]=[];});
    var all=[];
    Object.keys(data.grouped||{}).forEach(function(cat){
      (data.grouped[cat]||[]).forEach(function(item){var t=mapTab(cat);grouped[t].push(item);all.push({item:item,tab:t});});
    });
    if(_observer){_observer.disconnect();}_rebuilding=true;
    var fh='<button class="bvmm5-tab active" data-tab="all" style="display:inline-flex;align-items:center;gap:5px;padding:9px 20px;border-radius:40px;border:1.5px solid #1a1a1a;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">\u2022 ALL ITEMS</button>';
    tabs.forEach(function(t){if(grouped[t].length>0)fh+='<button class="bvmm5-tab" data-tab="'+t+'" style="display:inline-flex;align-items:center;gap:5px;padding:9px 20px;border-radius:40px;border:1.5px solid #c8c3bc;background:transparent;color:#555;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap">\u2022 '+t+'</button>';});
    fe.innerHTML=fh;
    fe.querySelectorAll('.bvmm5-tab').forEach(function(btn){
      btn.onclick=function(){
        fe.querySelectorAll('.bvmm5-tab').forEach(function(b){b.style.background='transparent';b.style.color='#555';b.style.borderColor='#c8c3bc';b.style.fontWeight='500';});
        btn.style.background='#1a1a1a';btn.style.color='#fff';btn.style.borderColor='#1a1a1a';btn.style.fontWeight='600';
        var tab=btn.getAttribute('data-tab');
        grid.querySelectorAll('.bvmm5-card').forEach(function(c){c.style.display=(tab==='all'||c.getAttribute('data-tab')===tab)?'':'none';});
      };
    });
    var html='';
    all.forEach(function(e){
      var i=e.item,t=e.tab;
      var priceNum=parseFloat(i.price)||0;
      var unitLabel=i.unit==='lb'?'/lb':'/each';
      var priceStr=priceNum>0?('$'+priceNum.toFixed(2)+' '+unitLabel):'';
      var desc=(i.desc&&i.desc!=='NEEDS_REVIEW')?i.desc:'';
      var imgHtml=i.imageUrl
        ?'<img src="'+esc(i.imageUrl)+'" loading="lazy" alt="'+esc(i.name)+'" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">'
        :'<img data-pexels="'+esc(i.name)+'" style="display:none" alt="'+esc(i.name)+'"><div style="width:100%;aspect-ratio:4/3;background:#f0ede8;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;letter-spacing:1px;text-transform:uppercase">'+esc(t)+'</div>';
      html+='<div class="bvmm5-card" data-tab="'+esc(t)+'" onclick="bvmmOpen(\''+escQ(i.id)+'\')" style="background:#fff;border-radius:12px;border:1px solid #e8e4de;overflow:hidden;cursor:pointer;display:flex;flex-direction:column">'+imgHtml+'<div style="padding:12px 14px 14px;flex:1;display:flex;flex-direction:column"><p style="font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin:0 0 5px">'+esc(t)+'</p><p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 6px;line-height:1.3">'+esc(i.name)+'</p>'+(desc?'<p style="font-size:12px;color:#777;margin:0 0 10px;line-height:1.5;flex:1">'+esc(desc)+'</p>':'')+'<p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0">'+priceStr+'</p></div></div>';
    });
    grid.innerHTML=html;
    grid.querySelectorAll('[data-pexels]').forEach(function(img){loadPexels(img.getAttribute('data-pexels'),img);});
    setTimeout(function(){
      _rebuilding=false;
      _observer=new MutationObserver(function(){
        if(_rebuilding||!sqData)return;
        var allBtns=fe.querySelectorAll('button'),ourBtns=fe.querySelectorAll('.bvmm5-tab');
        if(allBtns.length!==ourBtns.length){applyMyTabs(sqData);}
      });
      _observer.observe(fe,{childList:true,subtree:true});
    },100);
  }
  window.bvmmOpen=function(id){
    if(!sqData)return;
    var found=null,foundTab='';
    Object.keys(sqData.grouped||{}).forEach(function(cat){(sqData.grouped[cat]||[]).forEach(function(i){if(i.id===id){found=i;foundTab=mapTab(cat);}});});
    if(!found)return;
    var ex=document.getElementById('bvmm-popup');if(ex)ex.remove();
    var price=found.price?parseFloat(found.price):0;
    var isLb=found.unit==='lb';
    var unitLabel=isLb?'lbs':'qty';
    var priceStr=price?(isLb?'$'+price.toFixed(2)+' /lb':'$'+price.toFixed(2)+' each'):'Price on request';
    var pop=document.createElement('div');pop.id='bvmm-popup';
    pop.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center';
    var imgHtml=found.imageUrl?'<img src="'+esc(found.imageUrl)+'" style="width:100%;height:220px;object-fit:cover;border-radius:20px 20px 0 0;display:block">':'';
    var desc=(found.desc&&found.desc!=='NEEDS_REVIEW')?'<p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px">'+esc(found.desc)+'</p>':'';
    pop.innerHTML='<div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:90vh;overflow-y:auto">'+imgHtml+'<div style="padding:20px 20px 36px"><button onclick="document.getElementById(\'bvmm-popup\').remove()" style="float:right;background:none;border:none;font-size:24px;cursor:pointer;color:#aaa">&times;</button><p style="font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#999;margin:0 0 6px">'+esc(foundTab)+'</p><p style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 8px;line-height:1.2">'+esc(found.name)+'</p>'+desc+'<p style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 20px">'+priceStr+'</p><div style="display:flex;align-items:center;gap:16px;margin-bottom:16px"><div style="display:flex;align-items:center;border:2px solid #e0e0e0;border-radius:40px"><button onclick="bvmmQty(-1)" style="width:44px;height:44px;border:none;background:none;font-size:22px;cursor:pointer">&#8722;</button><span id="bvmm-qty" style="min-width:32px;text-align:center;font-size:18px;font-weight:700">1</span><button onclick="bvmmQty(1)" style="width:44px;height:44px;border:none;background:none;font-size:22px;cursor:pointer">+</button></div><span style="font-size:13px;color:#888">'+unitLabel+'</span><span id="bvmm-sub" style="margin-left:auto;font-size:16px;font-weight:700;color:#1a1a1a">'+(price?'$'+price.toFixed(2):'')+'</span></div><button onclick="bvmmAdd(\''+escQ(found.id)+'\',\''+escQ(found.name)+'\','+price+',\''+found.unit+'\')" style="width:100%;padding:16px;background:#1a1a1a;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer">Add to Order</button></div></div>';
    document.body.appendChild(pop);
    pop.addEventListener('click',function(e){if(e.target===pop)pop.remove();});
    window._bvmmPrice=price;window._bvmmQty=1;window._bvmmIsLb=isLb;
  };
  window.bvmmQty=function(d){
    var step=window._bvmmIsLb?0.5:1;var min=window._bvmmIsLb?0.5:1;
    window._bvmmQty=Math.max(min,Math.round((window._bvmmQty+d*step)*10)/10);
    var q=document.getElementById('bvmm-qty');if(q)q.textContent=window._bvmmQty;
    var s=document.getElementById('bvmm-sub');if(s&&window._bvmmPrice)s.textContent='$'+(window._bvmmPrice*window._bvmmQty).toFixed(2);
  };
  window.bvmmAdd=function(id,name,price,unit){
    var qty=window._bvmmQty||1;
    var pop=document.getElementById('bvmm-popup');if(pop)pop.remove();
    var existing=null;for(var k=0;k<cart.length;k++){if(cart[k].id===id){existing=cart[k];break;}}
    if(existing){existing.qty=Math.round((existing.qty+qty)*10)/10;}
    else{cart.push({id:id,name:name,price:price,qty:qty,unit:unit||'each'});}
    updateCartUI();window._bvmmQty=1;
  };
  window.bvmmCheckout=function(){
    if(!cart.length)return;
    var btn=document.querySelector('#bvmm-cart-bar button');
    if(btn){btn.textContent='Processing...';btn.disabled=true;}
    var items=cart.map(function(c){return{name:c.name,price:c.price,quantity:c.qty,unit:c.unit};});
    fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'square-order-create',items:items})})
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.ok&&d.url){window.location.href=d.url;}
      else{alert('Checkout error: '+(d.error||'Unknown'));if(btn){btn.textContent='Checkout \u2192';btn.disabled=false;}}
    })
    .catch(function(e){alert('Error: '+e.message);if(btn){btn.textContent='Checkout \u2192';btn.disabled=false;}});
  };
  // ── Inject Push Live + Deploy Worker into admin top nav ─────────────────
  function findAdminNav(){
    var found=null;
    document.querySelectorAll('button,a,[role="button"],span,div').forEach(function(el){
      var txt=(el.textContent||'').trim();
      if(txt.includes('Cache')||txt.includes('Tools')||txt.includes('Sections')||txt.includes('Links')){
        var par=el.parentElement;
        // Make sure parent has multiple children (it's a nav bar, not a single item)
        if(par&&par.children.length>=2)found=par;
      }
    });
    return found;
  }

  function makeNavBtn(id,icon,label,color){
    var lbl=document.createElement('label');
    lbl.id=id;
    lbl.style.cssText='cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;font-weight:600;color:'+color+';user-select:none;white-space:nowrap';
    lbl.setAttribute('data-default-html', icon+' '+label);
    lbl.innerHTML=icon+' '+label;
    return lbl;
  }

  function setNavBtnState(lbl,html,color,disabled){
    lbl.innerHTML=html;
    lbl.style.color=color;
    lbl.style.opacity=disabled?'.5':'1';
    lbl.style.pointerEvents=disabled?'none':'';
  }

  function resetNavBtn(lbl,inputId,onChangeFn){
    lbl.innerHTML=lbl.getAttribute('data-default-html')+'<input id="'+inputId+'" type="file" style="display:none">';
    lbl.style.color=lbl.style.color;lbl.style.opacity='1';lbl.style.pointerEvents='';
    document.getElementById(inputId).onchange=onChangeFn;
  }

  function setupAdminDeploy(){
    var nav=findAdminNav();
    if(!nav)return;
    // Make nav scrollable on mobile
    nav.style.overflowX='auto';
    nav.style.flexWrap='nowrap';
    nav.style.webkitOverflowScrolling='touch';
    nav.style.scrollbarWidth='none';
    nav.style.msOverflowStyle='none';
    // Hide scrollbar visually but keep scroll
    if(!document.getElementById('bvmm-nav-scroll-css')){
      var ns=document.createElement('style');ns.id='bvmm-nav-scroll-css';
      ns.textContent='#bvmm-pl-label,#bvmm-wd-label{flex-shrink:0}';
      document.head.appendChild(ns);
    }

    // ── Push Live (index.html) ──
    if(!document.getElementById('bvmm-pl-label')){
      var plLbl=makeNavBtn('bvmm-pl-label','\ud83d\ude80','Push Live','#4ade80');
      plLbl.innerHTML+=('<input id="bvmm-pl-input" type="file" accept=".html" style="display:none">');
      nav.appendChild(plLbl);
      function onPlChange(ev){
        var file=ev.target.files[0];if(!file)return;
        var reader=new FileReader();
        reader.onload=function(e){
          var token=null;try{token=sessionStorage.getItem('bvmm_token');}catch(_){}
          if(!token){alert('Please log in to the admin panel first.');return;}
          setNavBtnState(plLbl,'\u23f3 Pushing...','#facc15',true);
          var b64=btoa(unescape(encodeURIComponent(e.target.result)));
          fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({action:'admin-deploy',content:b64,token:token,force:false})
          }).then(function(r){return r.json();}).then(function(d){
            if(d.ok){
              setNavBtnState(plLbl,'\u2714 Live!','#4ade80',false);
              setTimeout(function(){resetNavBtn(plLbl,'bvmm-pl-input',onPlChange);plLbl.style.color='#4ade80';},3000);
            } else {
              alert('Push error: '+(d.error||'Unknown'));
              resetNavBtn(plLbl,'bvmm-pl-input',onPlChange);plLbl.style.color='#4ade80';
            }
          }).catch(function(e){alert('Error: '+e.message);resetNavBtn(plLbl,'bvmm-pl-input',onPlChange);plLbl.style.color='#4ade80';});
        };
        reader.readAsText(file);ev.target.value='';
      }
      document.getElementById('bvmm-pl-input').onchange=onPlChange;
    }

    // ── Deploy Worker (.js) ──
    if(!document.getElementById('bvmm-wd-label')){
      var wdLbl=makeNavBtn('bvmm-wd-label','\u2699\ufe0f','Worker','#e8a83e');
      wdLbl.innerHTML+=('<input id="bvmm-wd-input" type="file" accept=".js" style="display:none">');
      nav.appendChild(wdLbl);
      function onWdChange(ev){
        var file=ev.target.files[0];if(!file)return;
        var reader=new FileReader();
        reader.onload=function(e){
          var token=null;try{token=sessionStorage.getItem('bvmm_token');}catch(_){}
          setNavBtnState(wdLbl,'\u23f3 Deploying...','#facc15',true);
          fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({action:'cf-deploy-worker',script:e.target.result,token:token})
          }).then(function(r){return r.json();}).then(function(d){
            if(d.ok){
              setNavBtnState(wdLbl,'\u2714 Deployed! Fixing...','#3dd68c',false);
              setTimeout(function(){resetNavBtn(wdLbl,'bvmm-wd-input',onWdChange);wdLbl.style.color='#e8a83e';},5000);
            } else {
              alert('Deploy error: '+(d.error||'Unknown'));
              resetNavBtn(wdLbl,'bvmm-wd-input',onWdChange);wdLbl.style.color='#e8a83e';
            }
          }).catch(function(e){alert('Error: '+e.message);resetNavBtn(wdLbl,'bvmm-wd-input',onWdChange);wdLbl.style.color='#e8a83e';});
        };
        reader.readAsText(file);ev.target.value='';
      }
      document.getElementById('bvmm-wd-input').onchange=onWdChange;
    }

    // greencrk.com quick link
    if(!document.getElementById('bvmm-site-link')){
      var siteLink=document.createElement('a');
      siteLink.id='bvmm-site-link';
      siteLink.href='https://greencrk.com';
      siteLink.target='_blank';
      siteLink.style.cssText='cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;font-weight:600;color:#60a5fa;user-select:none;white-space:nowrap;text-decoration:none';
      siteLink.textContent='View Site';
      nav.appendChild(siteLink);
    }
  }
  setTimeout(setupAdminDeploy,1000);
  setTimeout(setupAdminDeploy,3000);

  var _f=window.fetch;
  window.fetch=function(){
    var p=_f.apply(this,arguments);
    try{var b=arguments[1]&&arguments[1].body;if(b){var parsed=JSON.parse(b);
      if(parsed.action==='square-catalog'){p.then(function(r){return r.clone().json();}).then(function(d){if(d&&d.ok){sqData=d;setTimeout(function(){applyMyTabs(d);},400);}}).catch(function(){});}
      if(parsed.action==='login'&&parsed.password){p.then(function(r){return r.clone().json();}).then(function(d){if(d&&d.ok&&d.token){try{sessionStorage.setItem('bvmm_token',d.token);}catch(e){}}}).catch(function(){});}
    }}catch(e){}return p;
  };
})();
</script>`

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