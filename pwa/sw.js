/**
 * ============================================================
 * sw.js — Finnes Entreprise
 * Auto-version: 20260623
 * ============================================================
 * DU SKAL ALDRIG SELV ÆNDRE DENNE FIL.
 * Claude opdaterer CACHE_NAME automatisk ved hver ny ZIP.
 *
 * STRATEGI:
 *   HTML / CSS / JS  → Network-first (altid nyeste kode)
 *   Billeder / fonte → Cache-first   (hurtigt load)
 * ============================================================
 */

const CACHE = "finnes-v4-20260623";
const SCOPE = self.registration.scope;

/* Statiske assets der præ-caches (billeder og ikoner) */
const PRECACHE = [
  SCOPE + "assets/icons/icon-192.png",
  SCOPE + "assets/icons/icon-512.png",
  SCOPE + "assets/icons/apple-touch-icon.png",
  SCOPE + "pwa/manifest.json",
  SCOPE + "assets/images/hero-placeholder.jpg"
];

/* Stier der aldrig caches (indeholder query-params eller er dynamiske) */
const NEVER_CACHE = ["sw.js", "admin.html"];

/* ── Install ── */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .catch(err => console.warn("[SW] Precache fejl:", err))
  );
  self.skipWaiting();
});

/* ── Activate: ryd ALLE gamle caches ── */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log("[SW] Sletter:", k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: "window" }))
      .then(clients => clients.forEach(c =>
        c.postMessage({ type: "SW_UPDATED", version: CACHE })
      ))
  );
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  const isAsset = /\.(png|jpe?g|gif|webp|ico|svg|woff2?)(\?|$)/i.test(e.request.url);

  if (isAsset) {
    /* Billeder: cache-first */
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
      )
    );
  } else {
    /* HTML, CSS, JS: network-first → altid nyeste version */
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(e.request)
            .then(cached => cached || caches.match(SCOPE + "index.html"))
        )
    );
  }
});
