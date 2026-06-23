/**
 * ============================================================
 * GALLERY.JS — Handyman Engine
 * ============================================================
 * Renderer galleriet fra config/services.js og styrer
 * lightbox (klik for at forstørre). Pladsholderbilleder
 * erstattes pr. kunde i config/services.js -> gallery[].src
 * ============================================================
 */

(function () {
  "use strict";

  function renderGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;

    grid.innerHTML = services.gallery.map((img, i) => `
      <div class="gallery-item" data-index="${i}">
        <img src="${img.src}" alt="${img.alt}" loading="lazy"
             onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23EAF3EC%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-family=%27sans-serif%27 font-size=%2718%27 fill=%27%232E6F40%27 text-anchor=%27middle%27 dy=%27.3em%27%3EBillede f%C3%B8lger%3C/text%3E%3C/svg%3E'">
        <span class="tag">${img.category}</span>
      </div>
    `).join("");

    grid.querySelectorAll(".gallery-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.getAttribute("data-index"), 10);
        openLightbox(idx);
      });
    });
  }

  function openLightbox(index) {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if (!lightbox || !img) return;
    const data = services.gallery[index];
    img.src = data.src;
    img.alt = data.alt;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  function initLightboxControls() {
    const lightbox = document.getElementById("lightbox");
    const closeBtn = document.getElementById("lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGallery();
    initLightboxControls();
  });
})();
