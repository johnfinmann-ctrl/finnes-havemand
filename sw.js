/* =========================================================
   sw.js — Finnes Entreprise V2
   Cache-first service worker for offline support.
   ========================================================= */
var CACHE = "fe-v2-1";
var FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(FILES); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit) {
      if (hit) return hit;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200) return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match("./index.html");
      });
    })
  );
});
