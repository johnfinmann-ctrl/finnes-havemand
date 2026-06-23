/**
 * ============================================================
 * UI.JS — Handyman Engine
 * ============================================================
 * Generelle UI-finesser, der ikke hører hjemme i app.js:
 * - Interaktivt kort over serviceområder (Leaflet/OSM,
 *   ingen API-nøgle nødvendig)
 * - Let scroll-reveal-animation (respekterer reduced motion)
 * ============================================================
 */

(function () {
  "use strict";

  /* ---------- Serviceområde-kort ---------- */
  // Bruger OpenStreetMap embed — kræver ingen API-nøgle, ingen
  // afhængighed af eksternt JS-bibliotek (let, hurtigt, GDPR-let).
  function initServiceMap() {
    const mapEl = document.getElementById("service-map");
    if (!mapEl) return;

    // Centrum beregnes simpelt som midtpunkt for Trekantområdet/Vejle-Kolding,
    // da dette er en generisk placeholder. Kunde kan finjustere bbox i config.
    const bbox = "9.25,55.55,9.65,55.80"; // minLon,minLat,maxLon,maxLat
    const marker = "55.7092,9.5357"; // Vejle ca.

    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
    mapEl.innerHTML = `<iframe src="${src}" width="100%" height="100%" style="border:0;" loading="lazy" title="Serviceområde kort"></iframe>`;
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const targets = document.querySelectorAll(".service-card, .review-card, .why-item, .gallery-item");
    if (!("IntersectionObserver" in window) || targets.length === 0) return;

    targets.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(el => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initServiceMap();
    initScrollReveal();
  });
})();
