// ══════════════════════════════════════════════════════════════════
//  BVMM Service Worker — Self-destructing
//  Version: 2026-04-22-nuke
//
//  Purpose: Unregister any existing service worker on greencrk.com
//  and wipe all cached files. After this runs once, browsers will
//  no longer serve stale copies of index.html or anything else.
//
//  Do not re-add a service worker until we actually need offline
//  support (not before Phase G at earliest).
// ══════════════════════════════════════════════════════════════════

self.addEventListener('install', function(e) {
  // Activate immediately, skip the normal "waiting" phase
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    (async function() {
      // Step 1: Delete every cache the old service worker created
      var cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(function(name) {
        return caches.delete(name);
      }));

      // Step 2: Unregister this service worker so it never runs again
      var registrations = await self.registration.unregister();

      // Step 3: Force every open tab to reload from the network
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function(client) {
        client.navigate(client.url);
      });
    })()
  );
});

// Ignore all fetch events — let the browser hit the network directly
self.addEventListener('fetch', function(e) {
  // Pass through to the network, no caching
  return;
});
