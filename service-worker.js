/* ================================================================
   service-worker.js — Finnes Entreprise
   Auto-version: 20260623
   ----------------------------------------------------------------
   DU SKAL ALDRIG SELV ÆNDRE DENNE FIL.
   Claude opdaterer automatisk AUTO-VERSION-linjen ovenfor
   og CACHE_NAME nedenfor ved hver ny ZIP-leverance.
   ================================================================

   STRATEGI:
   - index.html + CSS + JS: Network-first
     → brugeren ser ALTID den nyeste version efter GitHub-upload
   - Billeder og ikoner: Cache-first
     → hurtigt load, opdateres automatisk ved ny cache-version
   ================================================================ */

var CACHE_NAME = 'finnes-entreprise-20260623';

/* Filer der præ-caches (kun statiske assets — ikke HTML/CSS/JS) */
var PRECACHE = [
  './assets/logo-placeholder.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.json'
];

/* ── Install: præ-cache kun billeder og manifest ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c) { return c.addAll(PRECACHE); })
      .catch(function(err) { console.warn('[SW] Precache fejl:', err); })
  );
  self.skipWaiting(); /* Aktivér med det samme — ingen ventetid */
});

/* ── Activate: slet ALLE gamle caches automatisk ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) {
              console.log('[SW] Sletter gammel cache:', k);
              return caches.delete(k);
            })
        );
      })
      .then(function() {
        /* Fortæl alle åbne tabs at en ny version er klar */
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      })
      .then(function(clients) {
        clients.forEach(function(c) {
          c.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
        });
      })
  );
  self.clients.claim(); /* Overtag kontrol af alle tabs straks */
});

/* ── Fetch: Network-first for HTML/CSS/JS, cache-first for assets ── */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  var url = e.request.url;
  var isAsset = /\.(png|jpg|jpeg|gif|webp|ico|svg|woff2?)(\?|$)/.test(url);

  if (isAsset) {
    /* Billeder og fonte: cache-first */
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(res) {
          if (!res || res.status !== 200) return res;
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return res;
        });
      })
    );
  } else {
    /* HTML, CSS, JS og alt andet: Network-first → altid nyeste version */
    e.respondWith(
      fetch(e.request)
        .then(function(res) {
          if (!res || res.status !== 200) return res;
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return res;
        })
        .catch(function() {
          /* Offline fallback */
          return caches.match(e.request)
            .then(function(cached) {
              return cached || caches.match('./index.html');
            });
        })
    );
  }
});
