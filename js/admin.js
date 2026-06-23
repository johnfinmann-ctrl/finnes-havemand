/**
 * ============================================================
 * ADMIN.JS — Handyman Engine — Admin Lite
 * ============================================================
 * Simpelt, PIN-låst adminpanel der lader kunden selv redigere
 * centrale indstillinger uden at skulle redigere kode direkte.
 * Ingen database — alt gemmes i localStorage som et "overlay"
 * oven på fabriksindstillingerne i config/*.js.
 *
 * VIGTIGT — lagdeling:
 * 1) config/*.js indlæses først (fabriksindstillinger, urørt).
 * 2) admin.js anvender applyOverrides() med det samme (synkront,
 *    før app.js initialiserer UI), så alle ændringer fra Admin
 *    Lite er aktive fra første render.
 * 3) Når brugeren gemmer i Admin Lite, skrives kun de FELTER
 *    der er ændret til localStorage — fabriksindstillingerne i
 *    config/*.js forbliver altid den underliggende standard.
 *
 * PIN: gemt i localStorage, default 1234, kan ændres i panelet.
 * ============================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "handyman_admin_overrides_v1";
  const PIN_KEY = "handyman_admin_pin_v1";
  const DEFAULT_PIN = "1234";

  /* ---------- Overlay: hent + anvend overrides ---------- */
  function getOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveOverrides(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Dyb merge: overrides vinder over fabriksindstillinger, men kun
  // for de nøgler der reelt er sat — resten af config rører vi ikke.
  function deepMerge(target, source) {
    if (!source) return target;
    Object.keys(source).forEach(key => {
      const sourceVal = source[key];
      if (sourceVal && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
        target[key] = deepMerge(target[key] && typeof target[key] === "object" ? target[key] : {}, sourceVal);
      } else {
        target[key] = sourceVal;
      }
    });
    return target;
  }

  function applyOverrides() {
    const overrides = getOverrides();
    if (overrides.company) deepMerge(window.company, overrides.company);
    if (overrides.colors) deepMerge(window.colors, overrides.colors);
    if (overrides.prices) deepMerge(window.prices, overrides.prices);
    if (overrides.heroImage) window.__heroImageOverride = overrides.heroImage;
  }

  /* ---------- PIN ---------- */
  function getPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function setPin(newPin) {
    localStorage.setItem(PIN_KEY, newPin);
  }

  let unlocked = false;

  /* ---------- Panel: byg felter dynamisk fra nuværende state ---------- */
  function buildPanelHtml() {
    const c = window.company;
    const col = window.colors;
    const pr = window.prices;

    const travelRows = (pr.travel && pr.travel.zones || []).map((z, i) => `
      <div class="admin-row">
        <label>${z.label}</label>
        <input type="text" data-admin-travel-zone="${z.id}" value="${z.afterAgreement ? '' : z.fee}" placeholder="${z.afterAgreement ? 'Efter aftale' : 'kr.'}" ${z.afterAgreement ? 'disabled' : ''}>
      </div>
    `).join("");

    return `
      <div class="admin-section">
        <h3>Virksomhed</h3>
        <div class="admin-row"><label>Firmanavn</label><input type="text" data-admin-field="company.name" value="${c.name || ''}"></div>
        <div class="admin-row"><label>Telefon</label><input type="text" data-admin-field="company.phone" value="${c.phone || ''}"></div>
        <div class="admin-row"><label>Telefon (rå, til tel:-link, fx +4540137370)</label><input type="text" data-admin-field="company.phoneRaw" value="${c.phoneRaw || ''}"></div>
        <div class="admin-row"><label>SMS</label><input type="text" data-admin-field="company.sms" value="${c.sms || ''}"></div>
        <div class="admin-row"><label>SMS (rå)</label><input type="text" data-admin-field="company.smsRaw" value="${c.smsRaw || ''}"></div>
        <div class="admin-row"><label>Mail</label><input type="text" data-admin-field="company.email" value="${c.email || ''}"></div>
        <div class="admin-row"><label>CVR</label><input type="text" data-admin-field="company.cvr" value="${c.cvr || ''}"></div>
      </div>

      <div class="admin-section">
        <h3>Åbningstider</h3>
        <div class="admin-row"><label>Man–tors</label><input type="text" data-admin-field="company.openingHours.monday" value="${(c.openingHours && c.openingHours.monday) || ''}"></div>
        <div class="admin-row"><label>Fredag</label><input type="text" data-admin-field="company.openingHours.friday" value="${(c.openingHours && c.openingHours.friday) || ''}"></div>
        <div class="admin-row"><label>Lør–søn</label><input type="text" data-admin-field="company.openingHours.saturday" value="${(c.openingHours && c.openingHours.saturday) || ''}"></div>
      </div>

      <div class="admin-section">
        <h3>Serviceområder <span class="admin-hint">(kommasepareret)</span></h3>
        <div class="admin-row"><input type="text" data-admin-field="company.serviceAreas" value="${(c.serviceAreas || []).join(', ')}"></div>
      </div>

      <div class="admin-section">
        <h3>Tekster</h3>
        <div class="admin-row"><label>Tagline (forside-undertekst)</label><input type="text" data-admin-field="company.tagline" value="${c.tagline || ''}"></div>
      </div>

      <div class="admin-section">
        <h3>Farver</h3>
        <div class="admin-row"><label>Primær</label><input type="color" data-admin-field="colors.primary" value="${col.primary}"></div>
        <div class="admin-row"><label>Sekundær</label><input type="color" data-admin-field="colors.secondary" value="${col.secondary}"></div>
        <div class="admin-row"><label>Accent</label><input type="color" data-admin-field="colors.accent" value="${col.accent}"></div>
      </div>

      <div class="admin-section">
        <h3>Forsidebillede <span class="admin-hint">(upload)</span></h3>
        <div class="admin-row">
          <label class="upload-zone" id="admin-hero-upload-zone" style="display:block;">
            <span class="upload-label-text">Klik for at uploade nyt forsidebillede</span>
            <input type="file" id="admin-hero-upload-input" accept="image/*">
          </label>
        </div>
        <div id="admin-hero-preview" style="margin-top:10px;"></div>
      </div>

      <div class="admin-section">
        <h3>Priser — Græsslåning</h3>
        <div class="admin-row"><label>Kr. pr. m²</label><input type="number" step="0.01" data-admin-field="prices.grass.sqmRate" value="${pr.grass.sqmRate}"></div>
        <div class="admin-row"><label>Minimumspris</label><input type="number" data-admin-field="prices.grass.minimum" value="${pr.grass.minimum}"></div>
        <div class="admin-row"><label>Tillæg, højt græs</label><input type="number" data-admin-field="prices.grass.highGrassSurcharge" value="${pr.grass.highGrassSurcharge}"></div>
        <div class="admin-row"><label>Bortkørsel</label><input type="number" data-admin-field="prices.grass.wasteRemoval" value="${pr.grass.wasteRemoval}"></div>
      </div>

      <div class="admin-section">
        <h3>Priser — Hækkeklipning</h3>
        <div class="admin-row"><label>Kr. pr. meter</label><input type="number" data-admin-field="prices.hedge.meterRate" value="${pr.hedge.meterRate}"></div>
        <div class="admin-row"><label>Bortkørsel</label><input type="number" data-admin-field="prices.hedge.wasteRemoval" value="${pr.hedge.wasteRemoval}"></div>
      </div>

      <div class="admin-section">
        <h3>Priser — Minigraver</h3>
        <div class="admin-row"><label>Kr. pr. time</label><input type="number" data-admin-field="prices.excavator.hourRate" value="${pr.excavator.hourRate}"></div>
        <div class="admin-row"><label>Bortkørsel (jord væk)</label><input type="number" data-admin-field="prices.excavator.wasteRemoval" value="${pr.excavator.wasteRemoval}"></div>
      </div>

      <div class="admin-section">
        <h3>Priser — Trampolin</h3>
        <div class="admin-row"><label>Ø 300 cm</label><input type="number" data-admin-field="prices.trampoline.d300" value="${pr.trampoline.d300}"></div>
        <div class="admin-row"><label>Ø 360 cm</label><input type="number" data-admin-field="prices.trampoline.d360" value="${pr.trampoline.d360}"></div>
        <div class="admin-row"><label>Ø 430 cm</label><input type="number" data-admin-field="prices.trampoline.d430" value="${pr.trampoline.d430}"></div>
        <div class="admin-row"><label>Jord væk-tillæg</label><input type="number" data-admin-field="prices.trampoline.soilRemoval" value="${pr.trampoline.soilRemoval}"></div>
      </div>

      <div class="admin-section">
        <h3>Kørsel</h3>
        <p class="admin-hint">Beløb i kr. ekskl. moms. "Efter aftale"-zonen kan ikke redigeres med et kr.-beløb her.</p>
        ${travelRows}
      </div>

      <div class="admin-section">
        <h3>Moms</h3>
        <div class="admin-row"><label>Momssats (fx 0.25 = 25%)</label><input type="number" step="0.01" data-admin-field="prices.vat.rate" value="${pr.vat.rate}"></div>
      </div>

      <div class="admin-section">
        <h3>Adgangskode til Admin</h3>
        <div class="admin-row"><label>Ny PIN-kode</label><input type="text" id="admin-new-pin" inputmode="numeric" placeholder="${getPin()}"></div>
      </div>
    `;
  }

  /* ---------- Læs alle felter i panelet og byg et overrides-objekt ---------- */
  function readFieldsToOverrides() {
    const overrides = getOverrides();

    document.querySelectorAll("[data-admin-field]").forEach(input => {
      const path = input.getAttribute("data-admin-field");
      let value = input.value;

      if (input.type === "number") {
        if (value === "") return;
        value = parseFloat(value);
      }

      if (path === "company.serviceAreas") {
        value = value.split(",").map(s => s.trim()).filter(Boolean);
      }

      setDeepValue(overrides, path, value);
    });

    // Kørsel/travel-zoner håndteres separat fra det generiske felt-system,
    // da zones er et ARRAY i config/prices.js. Vi bygger et fuldt, korrekt
    // array (matchet på zone-id, ikke index) i stedet for at lade det
    // generiske setDeepValue lave et {0:.., 1:..}-objekt, som ville
    // ødelægge .find()-opslag i js/calculators.js efter merge.
    const travelInputs = document.querySelectorAll("[data-admin-travel-zone]");
    if (travelInputs.length > 0) {
      // Udgangspunkt: de aktuelle zoner (inkl. evt. tidligere overrides),
      // så felter der IKKE er redigeret her (label, afterAgreement) bevares.
      const baseZones = (window.prices.travel && window.prices.travel.zones) || [];
      const zonesById = {};
      baseZones.forEach(z => { zonesById[z.id] = Object.assign({}, z); });

      travelInputs.forEach(input => {
        const zoneId = input.getAttribute("data-admin-travel-zone");
        if (input.disabled) return; // "Efter aftale"-zoner har intet kr.-beløb at gemme
        if (!zonesById[zoneId]) return;
        const raw = input.value.trim();
        if (raw === "") return;
        const fee = parseFloat(raw);
        if (Number.isNaN(fee)) return;
        zonesById[zoneId].fee = fee;
      });

      // Bevar zone-rækkefølgen fra config, byg et ægte array
      const mergedZones = baseZones.map(z => zonesById[z.id]);
      setDeepValue(overrides, "prices.travel.zones", mergedZones);
    }

    return overrides;
  }

  function setDeepValue(obj, path, value) {
    const parts = path.split(".");
    let cursor = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  /* ---------- Forsidebillede-upload (gemmes som base64 i overrides) ---------- */
  function initHeroUpload() {
    const zone = document.getElementById("admin-hero-upload-zone");
    const input = document.getElementById("admin-hero-upload-input");
    const preview = document.getElementById("admin-hero-preview");
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const overrides = getOverrides();
        overrides.heroImage = e.target.result;
        saveOverrides(overrides);
        if (preview) preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px; border-radius:8px;">`;
        showAdminToast("Forsidebillede gemt. Genindlæs siden for at se ændringen.");
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- UI: panel + lås ---------- */
  function buildAdminUI() {
    if (document.getElementById("admin-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "admin-overlay";
    overlay.className = "admin-overlay";
    overlay.innerHTML = `
      <div class="admin-panel">
        <div class="admin-header">
          <strong>Admin Lite</strong>
          <button type="button" id="admin-close-btn" aria-label="Luk admin">✕</button>
        </div>
        <div class="admin-lock" id="admin-lock">
          <p>Indtast adgangskode</p>
          <input type="password" id="admin-pin-input" inputmode="numeric" maxlength="12" autocomplete="off">
          <button type="button" class="btn btn-primary btn-block" id="admin-unlock-btn">Lås op</button>
          <p class="admin-error" id="admin-pin-error"></p>
        </div>
        <div class="admin-body" id="admin-body" style="display:none;">
          <div id="admin-fields"></div>
          <div class="admin-actions">
            <button type="button" class="btn btn-primary btn-block" id="admin-save-btn">Gem ændringer</button>
            <button type="button" class="btn btn-outline btn-block" id="admin-reset-btn">Nulstil til fabriksindstillinger</button>
          </div>
          <p class="admin-save-status" id="admin-save-status"></p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("admin-close-btn").addEventListener("click", closeAdmin);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeAdmin(); });

    document.getElementById("admin-unlock-btn").addEventListener("click", tryUnlock);
    document.getElementById("admin-pin-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
    });

    document.getElementById("admin-save-btn").addEventListener("click", saveAll);
    document.getElementById("admin-reset-btn").addEventListener("click", resetAll);
  }

  function tryUnlock() {
    const input = document.getElementById("admin-pin-input");
    const error = document.getElementById("admin-pin-error");
    if (input.value === getPin()) {
      unlocked = true;
      document.getElementById("admin-lock").style.display = "none";
      const body = document.getElementById("admin-body");
      body.style.display = "block";
      document.getElementById("admin-fields").innerHTML = buildPanelHtml();
      initHeroUpload();
      error.textContent = "";
      input.value = "";
    } else {
      error.textContent = "Forkert kode. Prøv igen.";
      input.value = "";
      input.focus();
    }
  }

  function saveAll() {
    const overrides = readFieldsToOverrides();
    const ok = saveOverrides(overrides);

    const newPinInput = document.getElementById("admin-new-pin");
    if (newPinInput && newPinInput.value.trim()) {
      setPin(newPinInput.value.trim());
    }

    const status = document.getElementById("admin-save-status");
    status.textContent = ok
      ? "Gemt. Genindlæs siden for at se alle ændringer på hele sitet."
      : "Kunne ikke gemme — tjek om din browser tillader localStorage.";
    status.classList.toggle("success", ok);
  }

  function resetAll() {
    if (!confirm("Nulstil alle Admin Lite-ændringer til fabriksindstillinger?")) return;
    localStorage.removeItem(STORAGE_KEY);
    const status = document.getElementById("admin-save-status");
    status.textContent = "Nulstillet. Genindlæser siden...";
    setTimeout(() => window.location.reload(), 800);
  }

  function openAdmin() {
    buildAdminUI();
    document.getElementById("admin-overlay").classList.add("open");
    if (!unlocked) {
      const pinInput = document.getElementById("admin-pin-input");
      if (pinInput) setTimeout(() => pinInput.focus(), 100);
    }
  }

  function closeAdmin() {
    const overlay = document.getElementById("admin-overlay");
    if (overlay) overlay.classList.remove("open");
  }

  let toastTimer = null;
  function showAdminToast(message) {
    if (window.showToast) { window.showToast(message); return; }
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

  /* ---------- Hemmelig adgang: 5 tryk på footer-logo, eller ?admin=1 ---------- */
  function initSecretAccess() {
    let tapCount = 0;
    let tapTimer = null;

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-admin-trigger]");
      if (!trigger) return;
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 1500);
      if (tapCount >= 5) {
        tapCount = 0;
        openAdmin();
      }
    });

    if (new URLSearchParams(window.location.search).get("admin") === "1") {
      document.addEventListener("DOMContentLoaded", openAdmin);
    }
  }

  // Anvend overrides med det samme (synkront), før app.js bruger config
  applyOverrides();

  document.addEventListener("DOMContentLoaded", () => {
    initSecretAccess();
  });

  // Eksponér til evt. andre moduler / manuel test i konsollen
  window.AdminLite = { open: openAdmin, close: closeAdmin };
})();
