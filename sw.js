/* ================================================================
   sw.js — Finnes Entreprise v2.0.0
   Auto-genereret: 2026-06-23  |  Cache: fe-v2.0-20260623
   ================================================================
   STRATEGI:
   - index.html:        Network-first  → brugeren ser altid nyeste HTML
   - app.css / app.js:  Network-first  → nyeste kode, cache som fallback
   - Billeder / ikoner: Cache-first    → hurtigt, opdateres ved ny cache
   ================================================================ */

var CACHE = "fe-v2.0-20260623";

var BASE = self.registration.scope;

/* Filer der præ-caches ved install */
var PRECACHE = [
  BASE + "assets/icon-192.png",
  BASE + "assets/icon-512.png",
  BASE + "assets/apple-touch-icon.png",
  BASE + "manifest.json"
];

/* ── Install: præ-cache kun statiske assets ── */
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(PRECACHE); })
      .catch(function(err) { console.warn("[SW] Precache fejl:", err); })
  );
  self.skipWaiting(); /* Aktivér med det samme */
});

/* ── Activate: ryd ALLE gamle caches ── */
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(k) { return k !== CACHE; })
            .map(function(k) {
              console.log("[SW] Sletter gammel cache:", k);
              return caches.delete(k);
            })
        );
      })
      .then(function() {
        /* Fortæl alle åbne tabs at ny version er installeret */
        return self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      })
      .then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: "SW_UPDATED", version: CACHE });
        });
      })
  );
  self.clients.claim(); /* Overtag alle tabs øjeblikkeligt */
});

/* ── Fetch: differentieret strategi pr. filtype ── */
self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  var url = e.request.url;
  var isHTML   = e.request.mode === "navigate" || url.includes("index.html");
  var isAsset  = url.includes("/assets/") || url.includes("icon-");
  var isCSS    = url.includes(".css");
  var isJS     = url.includes(".js");

  /* HTML + CSS + JS: Network-first, cache som fallback */
  if (isHTML || isCSS || isJS) {
    e.respondWith(
      fetch(e.request)
        .then(function(res) {
          if (!res || res.status !== 200) return res;
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
          return res;
        })
        .catch(function() {
          return caches.match(e.request)
            .then(function(cached) {
              return cached || caches.match(BASE + "index.html");
            });
        })
    );
    return;
  }

  /* Billeder og statiske assets: cache-first */
  e.respondWith(
    caches.match(e.request)
      .then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(res) {
          if (!res || res.status !== 200) return res;
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
          return res;
        });
      })
  );
});
