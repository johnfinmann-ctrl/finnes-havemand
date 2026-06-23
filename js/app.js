/**
 * ============================================================
 * APP.JS — Handyman Engine
 * ============================================================
 * Hovedinitialisering: indsætter farver fra config, fylder
 * sektioner med indhold fra config, og styrer APP-FLOW-
 * navigationen (forside = startmenu, ikoner åbner views,
 * tilbage-knap fører tilbage). Loades sidst.
 *
 * APP-FLOW: Hver "side" er et element med class="app-view".
 * Forsiden (id="view-home") er altid views-stakkens bund.
 * window.AppNav.goTo(viewId) skifter view og opdaterer
 * historik, så browserens tilbage-knap også virker.
 * ============================================================
 */

(function () {
  "use strict";

  /* ---------- 1. Anvend farvetema fra config/colors.js ---------- */
  function applyTheme() {
    const root = document.documentElement;
    const map = {
      "--color-primary": colors.primary,
      "--color-secondary": colors.secondary,
      "--color-accent": colors.accent,
      "--color-background": colors.background,
      "--color-primary-dark": colors.primaryDark,
      "--color-primary-tint": colors.primaryTint,
      "--color-accent-dark": colors.accentDark,
      "--color-surface": colors.surface,
      "--color-border": colors.border,
      "--color-text-primary": colors.textPrimary,
      "--color-text-muted": colors.textMuted,
      "--color-text-on-primary": colors.textOnPrimary,
      "--color-text-on-dark": colors.textOnDark,
      "--color-error": colors.error
    };
    Object.entries(map).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
  }

  /* ---------- 1b. Anvend evt. forsidebillede sat via Admin Lite ---------- */
  function applyHeroImageOverride() {
    if (!window.__heroImageOverride) return;
    const heroEl = document.querySelector(".home-hero");
    if (!heroEl) return;
    document.documentElement.style.setProperty("--home-hero-image", `url("${window.__heroImageOverride}")`);
    heroEl.classList.add("has-custom-image");
  }

  /* ---------- 2. Mobil-detektion (til Ring/SMS-knapper) ---------- */
  // "Mobil" = enhed der reelt kan foretage opkald/sms (telefon/tablet).
  // Desktop/laptop får i stedet "kopiér nummer"-adfærd, da tel:/sms:
  // links fejler stille (eller åbner uønskede apps) på de fleste desktops.
  function isMobileDevice() {
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
    const touchPrimary = window.matchMedia("(pointer: coarse)").matches;
    return uaMobile || touchPrimary;
  }

  /* ---------- 3. Kopiér-til-udklipsholder med synlig bekræftelse ---------- */
  function copyToClipboard(text, confirmMessage) {
    const done = () => showToast(confirmMessage);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const tmp = document.createElement("textarea");
    tmp.value = text;
    tmp.style.position = "fixed";
    tmp.style.opacity = "0";
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(tmp);
    done();
  }

  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      toast.className = "app-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- 4. Kontaktknapper: tel/sms/mail med desktop-fallback ---------- */
  function applyContactLinks() {
    const mobile = isMobileDevice();

    document.querySelectorAll("[data-tel]").forEach(el => {
      if (mobile) {
        el.setAttribute("href", `tel:${company.phoneRaw}`);
      } else {
        el.setAttribute("href", "#");
        el.addEventListener("click", (e) => {
          e.preventDefault();
          copyToClipboard(company.phone, `Nummer kopieret: ${company.phone}`);
        });
      }
    });

    document.querySelectorAll("[data-sms]").forEach(el => {
      if (mobile) {
        el.setAttribute("href", `sms:${company.smsRaw}`);
      } else {
        el.setAttribute("href", "#");
        el.addEventListener("click", (e) => {
          e.preventDefault();
          copyToClipboard(company.sms, `Nummer kopieret: ${company.sms}`);
        });
      }
    });

    document.querySelectorAll("[data-mail]").forEach(el => {
      el.setAttribute("href", `mailto:${company.email}`);
    });

    document.querySelectorAll("[data-phone-text]").forEach(el => { el.textContent = company.phone; });
    document.querySelectorAll("[data-sms-text]").forEach(el => { el.textContent = company.sms; });
    document.querySelectorAll("[data-mail-text]").forEach(el => { el.textContent = company.email; });
    document.querySelectorAll("[data-cvr-text]").forEach(el => { el.textContent = company.cvr; });
    document.querySelectorAll("[data-company-name]").forEach(el => { el.textContent = company.name; });
    document.querySelectorAll("[data-company-tagline]").forEach(el => { el.textContent = company.tagline; });
    document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- 5. Render: Ydelser ---------- */
  function renderServices() {
    const grid = document.getElementById("services-grid");
    if (!grid) return;
    grid.innerHTML = services.list.map(s => `
      <div class="service-card" id="service-${s.id}">
        <div class="icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        ${s.hasCalculator
          ? `<button type="button" class="card-link" data-go-view="prisberegner" data-open-calc="${s.calculatorId}">Beregn pris →</button>`
          : `<button type="button" class="card-link" data-go-view="kontakt">Få tilbud →</button>`}
      </div>
    `).join("");
  }

  /* ---------- 6. Render: Hvorfor vælge os ---------- */
  function renderWhyUs() {
    const grid = document.getElementById("why-grid");
    if (!grid) return;
    grid.innerHTML = services.whyUs.map(item => `
      <div class="why-item">
        <div class="icon">${item.icon}</div>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    `).join("");

    const types = document.getElementById("customer-types");
    if (types) {
      types.innerHTML = services.customerTypes.map(t => `<span class="pill">${t}</span>`).join("");
    }
  }

  /* ---------- 7. Render: Anmeldelser ---------- */
  function renderReviews() {
    const grid = document.getElementById("reviews-grid");
    if (!grid) return;
    grid.innerHTML = services.reviews.map(r => `
      <div class="review-card">
        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <p class="quote">"${r.text}"</p>
        <div class="review-author">${r.name}</div>
        <div class="review-location">${r.location}</div>
      </div>
    `).join("");
  }

  /* ---------- 8. Render: Serviceområder ---------- */
  function renderServiceAreas() {
    const list = document.getElementById("areas-list");
    if (!list) return;
    list.innerHTML = company.serviceAreas.map(a => `<span class="pill">${a}</span>`).join("");
  }

  /* ---------- 9. Render: Om os ---------- */
  function renderAbout() {
    const heading = document.getElementById("about-heading");
    const text = document.getElementById("about-text");
    if (heading) heading.textContent = services.about.heading;
    if (text) text.textContent = services.about.text;
  }

  /* ---------- 10. Render: Footer ---------- */
  function renderFooter() {
    const areasList = document.getElementById("footer-areas");
    if (areasList) {
      areasList.innerHTML = company.serviceAreas.map(a => `<li><button type="button" class="footer-link-btn" data-go-view="kontakt">${a}</button></li>`).join("");
    }
  }

  /* ============================================================
     APP-FLOW NAVIGATION
     ============================================================
     Forsiden (#view-home) er startmenuen. Alle andre views
     (#view-ydelser, #view-prisberegner, #view-galleri, osv.)
     er skjult som standard og vises ét ad gangen. En tilbage-
     knap øverst i hvert under-view fører altid til forsiden.
     History API bruges, så browserens fysiske tilbage-knap
     (og swipe-tilbage på mobil) også virker korrekt.
     ============================================================ */
  const HOME_VIEW = "view-home";

  function getAllViews() {
    return Array.from(document.querySelectorAll(".app-view"));
  }

  function showView(viewId, options) {
    options = options || {};
    const views = getAllViews();
    views.forEach(v => v.classList.toggle("active", v.id === viewId));

    const isHome = viewId === HOME_VIEW;
    document.body.classList.toggle("is-home-view", isHome);

    if (options.scrollTo) {
      // Vent én frame så det nye view er synligt (display:block) før vi måler/scroller
      requestAnimationFrame(() => {
        const target = document.getElementById(options.scrollTo);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo(0, 0);
      });
    } else {
      window.scrollTo(0, 0);
    }

    if (!options.skipHistory) {
      const state = { view: viewId };
      if (options.replace) {
        history.replaceState(state, "", viewId === HOME_VIEW ? "#" : `#${viewId}`);
      } else {
        history.pushState(state, "", viewId === HOME_VIEW ? "#" : `#${viewId}`);
      }
    }

    if (options.openCalc && window.HandymanCalculators && window.HandymanCalculators.openTab) {
      window.HandymanCalculators.openTab(options.openCalc);
    }
  }

  function initAppNav() {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-go-view]");
      if (!trigger) return;
      e.preventDefault();
      const targetView = "view-" + trigger.getAttribute("data-go-view").replace(/^view-/, "");
      const openCalc = trigger.getAttribute("data-open-calc");
      const scrollTo = trigger.getAttribute("data-scroll-to");
      showView(targetView, {
        ...(openCalc ? { openCalc } : {}),
        ...(scrollTo ? { scrollTo } : {})
      });
    });

    window.addEventListener("popstate", (e) => {
      const viewId = (e.state && e.state.view) || HOME_VIEW;
      showView(viewId, { skipHistory: true });
    });

    const initialHash = window.location.hash.replace("#", "");
    const initialView = initialHash && document.getElementById(initialHash) ? initialHash : HOME_VIEW;
    showView(initialView, { replace: true });
  }

  window.AppNav = { goTo: (viewId) => showView("view-" + viewId.replace(/^view-/, "")) };


  /* ---------- 0. Hent og anvend admin-overrides fra localStorage ----------
   * Admin-panelet gemmer ændringer i localStorage under "fe_admin_override".
   * Her merges de ind i de globale config-objekter FØR siden renderes.
   * Siden viser altid de seneste admin-indstillinger uden at ændre filer.
   * -------------------------------------------------------------------- */
  function applyAdminOverrides() {
    try {
      const raw = localStorage.getItem("fe_admin_override");
      if (!raw) return;
      const d = JSON.parse(raw);

      // Firma / company
      if (d.name)         company.name     = d.name;
      if (d.tagline)      company.tagline  = d.tagline;
      if (d.cvr)          company.cvr      = d.cvr;
      if (typeof d.vatRegistered === "boolean") company.vatRegistered = d.vatRegistered;
      if (d.phone)        company.phone    = d.phone;
      if (d.phoneRaw)     company.phoneRaw = d.phoneRaw;
      if (d.smsRaw)       company.smsRaw   = company.sms = d.smsRaw;
      if (d.email)        company.email    = d.email;
      if (d.logo)         company.logo     = d.logo;
      if (d.areas) {
        company.serviceAreas = d.areas.split(",").map(a => a.trim()).filter(Boolean);
      }
      if (d.hoursWd) company.openingHours.monday = company.openingHours.tuesday =
        company.openingHours.wednesday = company.openingHours.thursday =
        company.openingHours.friday = d.hoursWd;
      if (d.hoursWe) company.openingHours.saturday = company.openingHours.sunday = d.hoursWe;

      // Intro og om-os
      if (d.intro) {
        const el = document.querySelector(".home-intro");
        if (el) el.textContent = d.intro;
      }
      if (d.aboutH) {
        const el = document.getElementById("about-heading");
        if (el) el.textContent = d.aboutH;
      }
      if (d.aboutText) {
        const el = document.getElementById("about-text");
        if (el) el.textContent = d.aboutText;
      }

      // Logo
      if (d.logo) {
        const logo = document.querySelector(".home-logo");
        if (logo) logo.src = d.logo;
      }

      // Priser — skriv direkte til prices-objektet
      if (prices.grass) {
        if (d.pGrassSqm)   prices.grass.sqmRate            = d.pGrassSqm;
        if (d.pGrassMin)   prices.grass.minimum            = d.pGrassMin;
        if (d.pGrassHigh)  prices.grass.highGrassSurcharge = d.pGrassHigh;
        if (d.pGrassWaste) prices.grass.wasteRemoval       = d.pGrassWaste;
      }
      if (prices.hedge) {
        if (d.pHedgeRate)  prices.hedge.meterRate              = d.pHedgeRate;
        if (d.pHedgeWaste) prices.hedge.wasteRemoval           = d.pHedgeWaste;
        if (d.pHedgeH2)    prices.hedge.heightSurcharge.between2and3m = d.pHedgeH2;
        if (d.pHedgeH3)    prices.hedge.heightSurcharge.over3m        = d.pHedgeH3;
      }
      if (prices.excavator) {
        if (d.pExcRate)  prices.excavator.hourRate        = d.pExcRate;
        if (d.pExcMin)   prices.excavator.minimumHours    = d.pExcMin;
        if (d.pExcMan)   prices.excavator.extraManHourRate= d.pExcMan;
        if (d.pExcWaste) prices.excavator.wasteRemoval    = d.pExcWaste;
      }
      if (prices.cleanup) {
        if (d.pCleanRate)  prices.cleanup.hourRate    = d.pCleanRate;
        if (d.pCleanMin)   prices.cleanup.minimum     = d.pCleanMin;
        if (d.pCleanWaste) prices.cleanup.wasteRemoval= d.pCleanWaste;
        if (d.pCleanBig)   prices.cleanup.bigJobSurcharge = d.pCleanBig;
      }
      if (prices.earthwork) {
        if (d.pEarthRate)    prices.earthwork.hourRate       = d.pEarthRate;
        if (d.pEarthMachine) prices.earthwork.machineHourRate= d.pEarthMachine;
        if (d.pEarthWaste)   prices.earthwork.wastePerLoad   = d.pEarthWaste;
      }
      if (prices.paving) {
        if (d.pPavSimple)  prices.paving.sqmRate.simple  = d.pPavSimple;
        if (d.pPavNormal)  prices.paving.sqmRate.normal  = d.pPavNormal;
        if (d.pPavComplex) prices.paving.sqmRate.complex = d.pPavComplex;
        if (d.pPavPrep)    prices.paving.preparationSurcharge = d.pPavPrep;
      }
      if (prices.summerhouse) {
        if (d.pSumSingle)  prices.summerhouse.singleVisit    = d.pSumSingle;
        if (d.pSumSeason)  prices.summerhouse.openingClosing = d.pSumSeason;
        if (d.pSumInspect) prices.summerhouse.inspectionVisit= d.pSumInspect;
      }
      if (prices.subscription) {
        if (d.pSubSqm) prices.subscription.sqmRate  = d.pSubSqm;
        if (d.pSubMin) prices.subscription.minimum  = d.pSubMin;
      }

      // Ydelser — overskriv services.list
      if (d.ydelser && d.ydelser.length) {
        services.list = d.ydelser.map(y => ({
          id:    y.titel.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          icon:  y.ico,
          title: y.titel,
          desc:  y.tekst,
          link:  "kontakt"
        }));
      }
    } catch(e) {
      console.warn("[Admin] Override fejl:", e);
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyAdminOverrides();
    applyTheme();
    applyHeroImageOverride();
    applyContactLinks();
    renderServices();
    renderWhyUs();
    renderReviews();
    renderServiceAreas();
    renderAbout();
    renderFooter();
    initAppNav();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("pwa/sw.js?v=20260623")
          .then(reg => {
            reg.addEventListener("updatefound", () => {
              const nw = reg.installing;
              nw.addEventListener("statechange", () => {
                if (nw.state === "installed" && navigator.serviceWorker.controller) {
                  const b = document.getElementById("sw-update-banner");
                  if (b) b.classList.add("show");
                }
              });
            });
          })
          .catch(() => {/* offline-support ikke tilgængeligt */});

        navigator.serviceWorker.addEventListener("message", e => {
          if (e.data && e.data.type === "SW_UPDATED") {
            const b = document.getElementById("sw-update-banner");
            if (b) b.classList.add("show");
          }
        });
      });
    }
  });
})();
