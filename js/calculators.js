/**
 * ============================================================
 * CALCULATORS.JS — Finnes Entreprise
 * Auto-version: 20260623
 * ============================================================
 * 8 beregnere — al beregningslogik. INGEN priser er hardkodede
 * her; alt hentes fra config/prices.js (window.prices).
 * Kvitteringsdesign: se css/calculator.css.
 * ============================================================
 */

(function () {
  "use strict";

  const fmt = (n) => Math.round(n).toLocaleString("da-DK") + " kr.";
  const fmtPct = (n) => Math.round(n * 100) + " %";

  /* ---------- Standardzone ---------- */
  const defaultZone = () =>
    prices.travel && prices.travel.zones && prices.travel.zones[0]
      ? prices.travel.zones[0].id : null;

  /* ---------- Fælles kørsels-hjælper ---------- */
  function applyTravel(subtotal, zoneId) {
    if (!prices.travel || !prices.travel.enabled)
      return { travelLine: null, subtotalWithTravel: subtotal, afterAgreement: false };
    const zone = (prices.travel.zones || []).find(z => z.id === zoneId);
    if (!zone) return { travelLine: null, subtotalWithTravel: subtotal, afterAgreement: false };
    if (zone.afterAgreement) {
      return {
        travelLine: { label: `Kørsel (${zone.label})`, value: prices.travel.afterAgreementText || "Efter aftale" },
        subtotalWithTravel: subtotal, afterAgreement: true
      };
    }
    const fee = zone.fee || 0;
    return {
      travelLine: { label: `Kørsel (${zone.label})`, value: fee === 0 ? "0 kr." : fmt(fee) },
      subtotalWithTravel: subtotal + fee, afterAgreement: false
    };
  }

  /* ---------- Render kvittering ---------- */
  function renderReceipt(containerId, { lines, subtotal, vat, total, afterAgreement, badge, disclaimer }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const vatLine = afterAgreement
      ? { label: "Moms (25%)", value: "beregnes ved tilbud" }
      : { label: `Moms (${Math.round(prices.vat.rate * 100)} %)`, value: fmt(vat) };
    const totalLine = afterAgreement
      ? `<span style="font-size:.9rem;opacity:.7">Se vejledende pris (ekskl. kørsel)</span>`
      : `<strong>${fmt(total)}</strong>`;

    el.innerHTML = `
      <div class="calc-receipt">
        ${badge ? `<div class="calc-badge">${badge}</div>` : ""}
        ${lines.map(l =>
          `<div class="calc-line"><span class="calc-line-label">${l.label}</span><span class="calc-line-value">${l.value}</span></div>`
        ).join("")}
        <div class="calc-line calc-line-vat"><span class="calc-line-label">${vatLine.label}</span><span class="calc-line-value">${vatLine.value}</span></div>
        <div class="calc-line calc-line-total">
          <span class="calc-line-label">Vejledende pris</span>
          <span class="calc-line-value calc-total-amount">${totalLine}</span>
        </div>
        ${disclaimer ? `<p class="calc-disclaimer">${disclaimer}</p>` : ""}
        <a href="#tilbud" class="btn btn-accent calc-tilbud-btn">📋 Få præcist tilbud</a>
      </div>`;
  }

  /* ============================================================
     1) GRÆSSLÅNING
     ============================================================ */
  const grassState = { sqm: 200, highGrass: false, waste: false, subscription: false, zone: null };

  function calcGrass() {
    const p = prices.grass;
    const s = grassState;
    s.zone = s.zone || defaultZone();
    const base       = Math.max(s.sqm * p.sqmRate, p.minimum);
    const highFee    = s.highGrass ? p.highGrassSurcharge : 0;
    const wasteFee   = s.waste ? p.wasteRemoval : 0;
    let subtotal     = base + highFee + wasteFee;
    let discount     = 0;
    if (s.subscription) { discount = subtotal * p.subscriptionDiscount; subtotal -= discount; }
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-grass", {
      lines: [
        { label: `Plæne (${s.sqm} m² × ${p.sqmRate} kr.)`, value: fmt(base) },
        s.highGrass    ? { label: "Tillæg, højt græs", value: fmt(highFee) } : null,
        s.waste        ? { label: "Bortkørsel af afklip", value: fmt(wasteFee) } : null,
        s.subscription ? { label: `Rabat, fast aftale (${fmtPct(p.subscriptionDiscount)})`, value: "−" + fmt(discount) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement,
      badge: s.subscription ? "Fast aftale" : null,
      disclaimer: "Vejledende pris ekskl. moms. Endelig pris aftales efter besigtigelse."
    });
  }

  function initGrass() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("grass-sqm", e => { grassState.sqm = parseInt(e.target.value) || 0; calcGrass(); });
    bind("grass-high", e => { grassState.highGrass = e.target.checked; calcGrass(); });
    bind("grass-waste", e => { grassState.waste = e.target.checked; calcGrass(); });
    bind("grass-subscription", e => { grassState.subscription = e.target.checked; calcGrass(); });
    bind("grass-zone", e => { grassState.zone = e.target.value; calcGrass(); });
    calcGrass();
  }

  /* ============================================================
     2) HÆKKEKLIPNING
     ============================================================ */
  const hedgeState = { meter: 10, height: "under2m", bothSides: false, formClip: false, waste: false, zone: null };

  function calcHedge() {
    const p = prices.hedge;
    const s = hedgeState;
    s.zone = s.zone || defaultZone();
    const heightLabel = { under2m: "under 2 m", between2and3m: "2–3 m", over3m: "over 3 m" };
    const heightSurcharge = p.heightSurcharge[s.height] || 0;
    const ratePerM  = p.meterRate + heightSurcharge;
    let base        = s.meter * ratePerM;
    if (s.bothSides) base *= p.bothSidesMultiplier;
    let formFee     = 0;
    if (s.formClip) { formFee = base * p.formClipSurcharge; base += formFee; }
    const wasteFee  = s.waste ? p.wasteRemoval : 0;
    const subtotal  = base + wasteFee;
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-hedge", {
      lines: [
        { label: `Hæk (${s.meter} m, ${heightLabel[s.height]}, ${s.bothSides ? "begge sider" : "én side"})`, value: fmt(s.meter * ratePerM * (s.bothSides ? p.bothSidesMultiplier : 1)) },
        s.formClip ? { label: `Formklip-tillæg (${fmtPct(p.formClipSurcharge)})`, value: fmt(formFee) } : null,
        s.waste    ? { label: "Bortkørsel", value: fmt(wasteFee) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement, badge: null,
      disclaimer: "Vejledende pris ekskl. moms."
    });
  }

  function initHedge() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("hedge-meter", e => { hedgeState.meter = parseInt(e.target.value) || 0; calcHedge(); });
    bind("hedge-height", e => { hedgeState.height = e.target.value; calcHedge(); });
    bind("hedge-both", e => { hedgeState.bothSides = e.target.checked; calcHedge(); });
    bind("hedge-form", e => { hedgeState.formClip = e.target.checked; calcHedge(); });
    bind("hedge-waste", e => { hedgeState.waste = e.target.checked; calcHedge(); });
    bind("hedge-zone", e => { hedgeState.zone = e.target.value; calcHedge(); });
    calcHedge();
  }

  /* ============================================================
     3) MINIGRAVER
     ============================================================ */
  const excavatorState = { hours: 4, taskType: "udgravning", extraMan: false, waste: false, zone: null };

  function calcExcavator() {
    const p = prices.excavator;
    const s = excavatorState;
    s.zone = s.zone || defaultZone();
    const taskLabel = { udgravning: "Udgravning", planering: "Planering", fundament: "Fundament", draen: "Dræn", jordarbejde: "Jordarbejde" };
    const hours     = Math.max(s.hours, p.minimumHours);
    const surcharge = p.taskTypeSurcharge[s.taskType] || 0;
    const rate      = p.hourRate + surcharge;
    const base      = hours * rate;
    const extraFee  = s.extraMan ? hours * p.extraManHourRate : 0;
    const wasteFee  = s.waste ? p.wasteRemoval : 0;
    const subtotal  = base + extraFee + wasteFee;
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-excavator", {
      lines: [
        { label: `${taskLabel[s.taskType]} (${hours} t × ${rate} kr./t)`, value: fmt(base) },
        hours < p.minimumHours ? { label: `Minimumstid: ${p.minimumHours} timer`, value: "" } : null,
        s.extraMan ? { label: `Ekstra mand (${hours} t × ${p.extraManHourRate} kr./t)`, value: fmt(extraFee) } : null,
        s.waste    ? { label: "Bortkørsel af jord (pr. læs)", value: fmt(wasteFee) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement, badge: null,
      disclaimer: "Minimum 2 timers leje. Priser ekskl. moms."
    });
  }

  function initExcavator() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("exc-hours", e => { excavatorState.hours = parseFloat(e.target.value) || 0; calcExcavator(); });
    bind("exc-type", e => { excavatorState.taskType = e.target.value; calcExcavator(); });
    bind("exc-man", e => { excavatorState.extraMan = e.target.checked; calcExcavator(); });
    bind("exc-waste", e => { excavatorState.waste = e.target.checked; calcExcavator(); });
    bind("exc-zone", e => { excavatorState.zone = e.target.value; calcExcavator(); });
    calcExcavator();
  }

  /* ============================================================
     4) HAVEOPRYDNING
     ============================================================ */
  const cleanupState = { hours: 3, waste: false, bigJob: false, zone: null };

  function calcCleanup() {
    const p = prices.cleanup;
    const s = cleanupState;
    s.zone = s.zone || defaultZone();
    const hours    = s.hours;
    const base     = Math.max(hours * p.hourRate, p.minimum);
    const bigFee   = (s.bigJob && hours >= p.bigJobHoursThreshold) ? p.bigJobSurcharge : 0;
    const wasteFee = s.waste ? p.wasteRemoval : 0;
    const subtotal = base + bigFee + wasteFee;
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-cleanup", {
      lines: [
        { label: `Oprydning (${hours} t × ${p.hourRate} kr./t)`, value: fmt(base) },
        s.bigJob && hours >= p.bigJobHoursThreshold ? { label: "Tillæg, større opgave", value: fmt(bigFee) } : null,
        s.waste ? { label: "Bortkørsel af haveaffald", value: fmt(wasteFee) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement, badge: null,
      disclaimer: "Vejledende pris. Endelig pris aftales efter gennemgang."
    });
  }

  function initCleanup() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("cleanup-hours", e => { cleanupState.hours = parseFloat(e.target.value) || 0; calcCleanup(); });
    bind("cleanup-waste", e => { cleanupState.waste = e.target.checked; calcCleanup(); });
    bind("cleanup-big", e => { cleanupState.bigJob = e.target.checked; calcCleanup(); });
    bind("cleanup-zone", e => { cleanupState.zone = e.target.value; calcCleanup(); });
    calcCleanup();
  }

  /* ============================================================
     5) JORDARBEJDE
     ============================================================ */
  const earthState = { hours: 4, machineHours: 0, wasteLoads: 0, zone: null };

  function calcEarth() {
    const p = prices.earthwork;
    const s = earthState;
    s.zone = s.zone || defaultZone();
    const base        = s.hours * p.hourRate;
    const machineFee  = s.machineHours * p.machineHourRate;
    const wasteFee    = s.wasteLoads * p.wastePerLoad;
    const subtotal    = base + machineFee + wasteFee;
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-earth", {
      lines: [
        { label: `Jordarbejde (${s.hours} t × ${p.hourRate} kr./t)`, value: fmt(base) },
        s.machineHours > 0 ? { label: `Maskintid (${s.machineHours} t × ${p.machineHourRate} kr./t)`, value: fmt(machineFee) } : null,
        s.wasteLoads > 0 ? { label: `Bortkørsel af jord (${s.wasteLoads} læs × ${p.wastePerLoad} kr.)`, value: fmt(wasteFee) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement, badge: null,
      disclaimer: "Priser ekskl. moms og deponering."
    });
  }

  function initEarth() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("earth-hours", e => { earthState.hours = parseFloat(e.target.value) || 0; calcEarth(); });
    bind("earth-machine", e => { earthState.machineHours = parseFloat(e.target.value) || 0; calcEarth(); });
    bind("earth-loads", e => { earthState.wasteLoads = parseInt(e.target.value) || 0; calcEarth(); });
    bind("earth-zone", e => { earthState.zone = e.target.value; calcEarth(); });
    calcEarth();
  }

  /* ============================================================
     6) BELÆGNING
     ============================================================ */
  const pavingState = { sqm: 20, complexity: "normal", materialsIncluded: false, preparation: false, zone: null };

  function calcPaving() {
    const p = prices.paving;
    const s = pavingState;
    s.zone = s.zone || defaultZone();
    const complexLabel = { simple: "Simpel (grus/stabilgrus)", normal: "Normal (fliser/brosten)", complex: "Kompleks (natursten/mønster)" };
    let sqmRate = p.sqmRate[s.complexity];
    let base    = s.sqm * sqmRate;
    let prepFee = 0;
    if (s.preparation) { prepFee = base * p.preparationSurcharge; base += prepFee; }
    let matFee  = 0;
    if (s.materialsIncluded) { matFee = s.sqm * p.materialsIncluded[s.complexity]; }
    const subtotal = base + matFee;
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(subtotal, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-paving", {
      lines: [
        { label: `${complexLabel[s.complexity]} (${s.sqm} m² × ${sqmRate} kr./m²)`, value: fmt(s.sqm * sqmRate) },
        s.preparation      ? { label: `Forberedelse inkl. (${fmtPct(p.preparationSurcharge)})`, value: fmt(prepFee) } : null,
        s.materialsIncluded ? { label: `Materialer (${s.sqm} m² × ${p.materialsIncluded[s.complexity]} kr./m²)`, value: fmt(matFee) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement, badge: null,
      disclaimer: "Materialepris er skønsmæssig — endelig pris aftales."
    });
  }

  function initPaving() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("pav-sqm", e => { pavingState.sqm = parseInt(e.target.value) || 0; calcPaving(); });
    bind("pav-complexity", e => { pavingState.complexity = e.target.value; calcPaving(); });
    bind("pav-materials", e => { pavingState.materialsIncluded = e.target.checked; calcPaving(); });
    bind("pav-prep", e => { pavingState.preparation = e.target.checked; calcPaving(); });
    bind("pav-zone", e => { pavingState.zone = e.target.value; calcPaving(); });
    calcPaving();
  }

  /* ============================================================
     7) SOMMERHUSSERVICE
     ============================================================ */
  const summerState = { type: "single", monthlyVisits: "1", zone: null };

  function calcSummer() {
    const p = prices.summerhouse;
    const s = summerState;
    s.zone = s.zone || defaultZone();
    let base = 0;
    let label = "";
    let discount = 0;
    if (s.type === "single") {
      base = p.singleVisit; label = "Enkeltbesøg";
    } else if (s.type === "opening") {
      base = p.openingClosing; label = "Åbning af sæson";
    } else if (s.type === "closing") {
      base = p.openingClosing; label = "Lukning af sæson";
    } else if (s.type === "inspection") {
      base = p.inspectionVisit; label = "Tilsynsbesøg";
    } else if (s.type === "subscription") {
      const visits = s.monthlyVisits;
      base  = p.monthlySubscription[visits] || p.singleVisit;
      label = `Fast aftale ${visits} besøg/md.`;
      discount = base * p.subscriptionDiscount;
      base -= discount;
    }
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(base, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-summer", {
      lines: [
        { label, value: fmt(s.type === "subscription" ? base + discount : base) },
        s.type === "subscription" ? { label: `Rabat, fast aftale (${fmtPct(p.subscriptionDiscount)})`, value: "−" + fmt(discount) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement,
      badge: s.type === "subscription" ? "Fast aftale" : null,
      disclaimer: "Priser ekskl. moms. Indhold aftales ved opstart."
    });
  }

  function initSummer() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("summer-type", e => {
      summerState.type = e.target.value;
      const sub = document.getElementById("summer-subscription-opts");
      if (sub) sub.style.display = summerState.type === "subscription" ? "block" : "none";
      calcSummer();
    });
    bind("summer-visits", e => { summerState.monthlyVisits = e.target.value; calcSummer(); });
    bind("summer-zone", e => { summerState.zone = e.target.value; calcSummer(); });
    calcSummer();
  }

  /* ============================================================
     8) FAST HAVEAFTALE
     ============================================================ */
  const subscriptionState = { sqm: 200, frequency: "biweekly", season: "6", zone: null };

  function calcSubscription() {
    const p = prices.subscription;
    const s = subscriptionState;
    s.zone = s.zone || defaultZone();
    const freq      = p.frequency[s.frequency];
    const perVisit  = Math.max(s.sqm * p.sqmRate, p.minimum);
    const monthly   = perVisit * freq.multiplier;
    const discount  = p.seasonDiscount[s.season] || 0;
    const monthly_d = monthly * (1 - discount);
    const seasonal  = monthly_d * parseInt(s.season);
    const { travelLine, subtotalWithTravel, afterAgreement } = applyTravel(monthly_d, s.zone);
    const vat   = subtotalWithTravel * prices.vat.rate;
    const total = subtotalWithTravel + vat;
    renderReceipt("receipt-subscription", {
      lines: [
        { label: `${s.sqm} m² × ${freq.label.toLowerCase()}`, value: fmt(perVisit) + "/besøg" },
        { label: `Månedspris (${freq.label})`, value: fmt(monthly) },
        discount > 0 ? { label: `Sæsonrabat (${fmtPct(discount)}, ${s.season} mdr.)`, value: "−" + fmt(monthly * discount) } : null,
        travelLine
      ].filter(Boolean),
      subtotal: subtotalWithTravel, vat, total, afterAgreement,
      badge: `${s.season} mdr. aftale`,
      disclaimer: `Månedlig pris inkl. moms: ${fmt(total)}. Sæson (${s.season} mdr.) i alt ca. ${fmt(seasonal * (1 + prices.vat.rate))}.`
    });
  }

  function initSubscription() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", fn); };
    bind("sub-sqm", e => { subscriptionState.sqm = parseInt(e.target.value) || 0; calcSubscription(); });
    bind("sub-freq", e => { subscriptionState.frequency = e.target.value; calcSubscription(); });
    bind("sub-season", e => { subscriptionState.season = e.target.value; calcSubscription(); });
    bind("sub-zone", e => { subscriptionState.zone = e.target.value; calcSubscription(); });
    calcSubscription();
  }

  /* ---------- Faneblade ---------- */
  function initTabs() {
    document.querySelectorAll(".calc-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.panel;
        document.querySelectorAll(".calc-tab").forEach(b => b.classList.toggle("active", b === btn));
        document.querySelectorAll(".calc-panel").forEach(p => p.classList.toggle("active", p.id === panel));
      });
    });
    window.HandymanCalculators = window.HandymanCalculators || {};
    window.HandymanCalculators.openTab = function(id) {
      const btn = document.querySelector(`.calc-tab[data-panel="${id}"]`);
      if (btn) btn.click();
    };
  }

  /* ---------- Zone-dropdowns: byg fra config ---------- */
  function buildZoneDropdowns() {
    if (!prices.travel || !prices.travel.enabled) return;
    document.querySelectorAll(".travel-zone-select").forEach(sel => {
      sel.innerHTML = prices.travel.zones.map(z =>
        `<option value="${z.id}">${z.label}${z.afterAgreement ? "" : z.fee === 0 ? " (gratis)" : ` (+${z.fee} kr.)`}</option>`
      ).join("");
    });
  }

  /* ---------- Init alle beregnere ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    buildZoneDropdowns();
    initTabs();
    initGrass();
    initHedge();
    initExcavator();
    initCleanup();
    initEarth();
    initPaving();
    initSummer();
    initSubscription();
  });

})();
