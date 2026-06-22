/* =========================================================
   app.js — Finnes Entreprise V2
   Single-page app: screen navigation, calculator, chatbot,
   data layer (localStorage → DEFAULT).
   ========================================================= */

/* ══════════════════════════════
   1. DATA — standard + localStorage merge
══════════════════════════════ */
var DEFAULT = {
  firmanavn:    "Finnes Entreprise",
  slogan:       "Have · Anlæg · Minigraver",
  telefon:      "40 13 73 70",
  telefon_raw:  "+4540137370",
  sms_raw:      "+4540137370",
  email:        "finmann1@gmail.com",
  cvr:          "46557557",
  momstekst:    "Momsregistreret",
  adresse:      "Vejle-området",
  aabningstid:  "Man–fre 07–17 · Lør efter aftale",
  omraade:      "Vejle, Børkop, Egtved, Jelling, Kolding, Brejning",
  maps_url:     "https://www.openstreetmap.org/export/embed.html?bbox=9.2,55.65,9.6,55.80&layer=mapnik",

  timepris:            450,
  minimumspris:        350,
  pris_pr_m2:         1.25,
  minigraver_timepris: 650,
  tillaeg_hoejt_graes: 200,
  tillaeg_bortkoersel: 150,

  ydelser: [
    { id: "graes",    ico: "🌿", navn: "Græsslåning",  tekst: "Regelmæssig eller enkeltstående slåning.\nFast aftale giver rabat.\nAlt afklip ryddes." },
    { id: "haek",     ico: "✂️", navn: "Hækklipning",  tekst: "Professionel klipning og formgivning.\nBegge sider. Bortkørsel inkl." },
    { id: "graver",   ico: "🚜", navn: "Minigraver",    tekst: "Udgravning, planering, dræn, fundament.\nMinimum 2 timer.\nKørsel inkl. i nærområdet." },
    { id: "bort",     ico: "🛻", navn: "Bortkørsel",    tekst: "Vi kører haveaffald og jord bort.\nHaveaffald, grene, jord m.m.\nSamme dag efter aftale." },
    { id: "belaeg",   ico: "🪨", navn: "Belægning",     tekst: "Fliser, grus, chaussésten.\nIndkørsler og terrasser.\nSolidt og pænt håndværk." },
    { id: "beskaer",  ico: "🌳", navn: "Beskæring",     tekst: "Frugttræer, buske og hæk.\nKorrekt årstidsbestemt beskæring.\nSund have og gode afgrøder." },
    { id: "opryd",    ico: "🍂", navn: "Haveoprydning", tekst: "Forår- og efterårsrydning.\nLøvfald, ukrudt, kanter.\nHaven klar til sæsonen." },
    { id: "sommer",   ico: "🏡", navn: "Sommerhus",     tekst: "Åbning og lukning af sæson.\nLøbende vedligeholdelse.\nFast aftale med rabat." }
  ]
};

function getData() {
  try {
    var raw = localStorage.getItem("fe_admin_data");
    if (!raw) return Object.assign({}, DEFAULT);
    var saved = JSON.parse(raw);
    var out = Object.assign({}, DEFAULT);
    Object.keys(saved).forEach(function(k) {
      if (saved[k] !== null && saved[k] !== undefined) out[k] = saved[k];
    });
    return out;
  } catch(e) { return Object.assign({}, DEFAULT); }
}

var D = {};  /* aktivt datasæt — fyldes ved init */

/* ══════════════════════════════
   2. SKÆRMROUTING
══════════════════════════════ */
var currentScreen = "home";
var screenHistory = [];

function goTo(id, pushHistory) {
  if (pushHistory === undefined) pushHistory = true;
  var all = document.querySelectorAll(".screen");
  all.forEach(function(s) { s.classList.remove("active"); });
  var next = document.getElementById("s-" + id);
  if (!next) return;
  next.classList.add("active");
  if (pushHistory && id !== currentScreen) {
    screenHistory.push(currentScreen);
  }
  currentScreen = id;
  updateNav(id);
  next.scrollTop = 0;
}

function goBack() {
  if (screenHistory.length > 0) {
    var prev = screenHistory.pop();
    goTo(prev, false);
  } else {
    goTo("home", false);
  }
}

function updateNav(id) {
  document.querySelectorAll(".nav-item").forEach(function(el) {
    el.classList.toggle("active", el.dataset.screen === id);
  });
}

/* ══════════════════════════════
   3. FORSIDE
══════════════════════════════ */
function renderHome() {
  var el = document.getElementById("s-home");

  /* Logo */
  var logo = el.querySelector(".home-logo");
  if (logo) { logo.src = "assets/icon-192.png"; logo.alt = D.firmanavn; }

  /* Tekst */
  setText(el, ".home-name",   D.firmanavn);
  setText(el, ".home-slogan", D.slogan);

  /* CTA-knapper */
  el.querySelector("#home-ring").href  = "tel:" + D.telefon_raw;
  el.querySelector("#home-sms").href   = "sms:" + D.sms_raw;

  /* Quick icons */
  var qs = el.querySelectorAll(".quick-icon");
  var top4 = [D.ydelser[0], D.ydelser[1], D.ydelser[2], D.ydelser[6]];
  qs.forEach(function(q, i) {
    if (!top4[i]) return;
    q.querySelector(".qi").textContent     = top4[i].ico;
    q.querySelector(".qi-label").textContent = top4[i].navn;
    q.onclick = function() { openYdelse(top4[i]); };
  });
}

/* ══════════════════════════════
   4. YDELSER
══════════════════════════════ */
function renderYdelser() {
  var grid = document.getElementById("ydelser-grid");
  grid.innerHTML = D.ydelser.map(function(y) {
    return '<div class="service-tile" onclick="openYdelse(D.ydelser.find(function(x){return x.id===\'' + y.id + '\';}))">'
      + '<span class="st-ico">' + y.ico + '</span>'
      + '<span>' + y.navn + '</span>'
      + '</div>';
  }).join("");
}

function openYdelse(y) {
  if (!y) return;
  var s = document.getElementById("s-ydelse-detail");

  /* Stort "billede" — emoji placeholder */
  var imgEl = s.querySelector(".service-detail-img");
  imgEl.innerHTML = '<span style="font-size:5rem">' + y.ico + '</span>';

  setText(s, ".service-detail-title", y.navn);
  setText(s, ".service-detail-text",  y.tekst);

  /* Knapper */
  s.querySelector("#det-ring").href  = "tel:" + D.telefon_raw;
  s.querySelector("#det-sms").href   = "sms:" + D.sms_raw;
  s.querySelector("#det-tilbud").onclick = function() { goTo("home"); setTimeout(function() { document.querySelector('.cta-btn[onclick*="tilbud"]') && goTo("home"); }, 100); };

  goTo("ydelse-detail");
}

/* ══════════════════════════════
   5. PRISER
══════════════════════════════ */
function renderPriser() {
  var cards = [
    { ico: "⏱️",  label: "Timepris",           value: "Fra " + D.timepris + " kr.",           sub: "Alm. havearbejde" },
    { ico: "🌿",  label: "Græsslåning pr. m²",  value: D.pris_pr_m2 + " kr./m²",              sub: "Minimum " + D.minimumspris + " kr." },
    { ico: "📍",  label: "Minimumspris",         value: D.minimumspris + " kr.",                sub: "Pr. besøg" },
    { ico: "🚜",  label: "Minigraver",           value: "Fra " + D.minigraver_timepris + " kr.", sub: "Pr. time inkl. kørsel" },
    { ico: "🛻",  label: "Bortkørsel",           value: "+" + D.tillaeg_bortkoersel + " kr.",   sub: "Tillæg pr. gang" },
    { ico: "📅",  label: "Fast aftale",          value: "Op til 15% rabat",                     sub: "Uge- eller 14-dages klip" }
  ];
  var el = document.getElementById("pris-cards");
  el.innerHTML = cards.map(function(c) {
    return '<div class="price-card">'
      + '<span class="pc-ico">' + c.ico + '</span>'
      + '<span class="pc-label">' + c.label + '</span>'
      + '<span class="pc-value">' + c.value + '</span>'
      + '<span class="pc-sub">' + c.sub + '</span>'
      + '</div>';
  }).join("");
}

/* ══════════════════════════════
   6. BEREGNER
══════════════════════════════ */
var calcState = { hoejt: false, bortkoer: false };

function toggleCalc(item) {
  item.classList.toggle("on");
  var id = item.dataset.toggle;
  calcState[id] = item.classList.contains("on");
  beregnLive();
}

function beregnLive() {
  var m2 = parseFloat(document.getElementById("calc-m2").value) || 0;
  if (m2 <= 0) {
    document.getElementById("calc-result").classList.remove("show");
    return;
  }
  var p = parseFloat(D.pris_pr_m2)          || 1.25;
  var min = parseFloat(D.minimumspris)       || 350;
  var tHoejt = parseFloat(D.tillaeg_hoejt_graes) || 200;
  var tBort  = parseFloat(D.tillaeg_bortkoersel) || 150;

  var basis = Math.max(m2 * p, min);
  var total = basis + (calcState.hoejt ? tHoejt : 0) + (calcState.bortkoer ? tBort : 0);

  var linjer = [];
  if (m2 * p < min) {
    linjer.push({ l: "Minimumspris", v: min + " kr." });
  } else {
    linjer.push({ l: m2 + " m² × " + p + " kr.", v: basis + " kr." });
  }
  if (calcState.hoejt)   linjer.push({ l: "Tillæg, højt græs",  v: "+" + tHoejt + " kr." });
  if (calcState.bortkoer) linjer.push({ l: "Tillæg, bortkørsel", v: "+" + tBort  + " kr." });

  var box = document.getElementById("calc-result");
  box.querySelector(".crb-amount").textContent = total + " kr.";
  box.querySelector(".crb-lines").innerHTML = linjer.map(function(l) {
    return '<div class="crb-line"><span>' + l.l + '</span><span>' + l.v + '</span></div>';
  }).join("");
  box.classList.add("show");
}

/* ══════════════════════════════
   7. KONTAKT
══════════════════════════════ */
function renderKontakt() {
  var el = document.getElementById("s-kontakt");

  el.querySelector("#k-ring").href  = "tel:" + D.telefon_raw;
  el.querySelector("#k-ring").querySelector(".ci-value").textContent = D.telefon;
  el.querySelector("#k-sms").href   = "sms:" + D.sms_raw;
  el.querySelector("#k-sms").querySelector(".ci-value").textContent = "Send SMS";
  el.querySelector("#k-mail").href  = "mailto:" + D.email;
  el.querySelector("#k-mail").querySelector(".ci-value").textContent = D.email;
  setText(el, "#k-cvr",   "CVR: " + D.cvr + " · " + D.momstekst);
  setText(el, "#k-time",  D.aabningstid);
  setText(el, "#k-adresse", D.adresse);

  /* Dækningsområde */
  var pills = el.querySelector("#k-omraade");
  pills.innerHTML = D.omraade.split(",").map(function(a) {
    return '<span class="area-pill">' + a.trim() + '</span>';
  }).join("");

  /* Kort */
  var map = el.querySelector("#k-map iframe");
  if (map) map.src = D.maps_url;
}

/* ══════════════════════════════
   8. HJÆLP (regelbaseret chatbot)
══════════════════════════════ */
var HELP_MENU = [
  { tekst: "💰 Hvad koster det?",      id: "priser"   },
  { tekst: "🚜 Har I minigraver?",     id: "graver"   },
  { tekst: "📋 Hvordan får jeg tilbud?",id: "tilbud"  },
  { tekst: "📍 Hvilke områder?",       id: "omraade"  },
  { tekst: "⏰ Åbningstider?",         id: "tid"      },
  { tekst: "📞 Ring til os",           id: "ring"     },
  { tekst: "💬 Send SMS",              id: "sms"      }
];

function helpSvar(id) {
  var svar = {
    priser:  "Vores priser:\n• Timepris fra " + D.timepris + " kr.\n• Minimum pr. besøg: " + D.minimumspris + " kr.\n• Græs pr. m²: " + D.pris_pr_m2 + " kr.\n• Minigraver fra " + D.minigraver_timepris + " kr./time",
    graver:  "Ja! Vi har minigraver til:\n• Udgravning og planering\n• Jordflytning\n• Dræn og fundament\n\nRing for booking 📞",
    tilbud:  "Nem! Gå til Kontakt → ring eller send SMS.\nVi er ude og kigger og giver tilbud inden for 1-2 hverdage — helt uforpligtende.",
    omraade: "Vi kører primært til:\n" + D.omraade + "\n\nRing og spørg — vi løser det!",
    tid:     "Åbningstider:\n" + D.aabningstid + "\n\nHastet behov? Ring — vi gør hvad vi kan 💪",
    ring:    null,
    sms:     null
  };
  return svar[id];
}

function addHelpMsg(tekst, isUser) {
  var msgs = document.getElementById("help-messages");
  var d = document.createElement("div");
  d.className = isUser ? "hm-user" : "hm-bot";
  d.textContent = tekst;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function showHelpMenu() {
  var msgs = document.getElementById("help-messages");
  var wrap = document.createElement("div");
  wrap.className = "hm-buttons";
  HELP_MENU.forEach(function(item) {
    var btn = document.createElement("button");
    btn.className = "hm-btn" + (item.id === "ring" || item.id === "sms" ? " accent" : "");
    btn.textContent = item.tekst;
    btn.onclick = function() { handleHelp(item); };
    wrap.appendChild(btn);
  });
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function handleHelp(item) {
  addHelpMsg(item.tekst, true);
  if (item.id === "ring") { window.location.href = "tel:" + D.telefon_raw; return; }
  if (item.id === "sms")  { window.location.href = "sms:" + D.sms_raw;    return; }
  var s = helpSvar(item.id);
  if (s) {
    addHelpMsg(s, false);
    setTimeout(function() {
      addHelpMsg("Kan jeg hjælpe med noget andet?", false);
      showHelpMenu();
    }, 600);
  }
}

/* ══════════════════════════════
   9. GALLERI
══════════════════════════════ */
var GALLERY = [
  { ico: "🌿", label: "Græsslåning" },
  { ico: "✂️", label: "Hæk" },
  { ico: "🚜", label: "Minigraver" },
  { ico: "🛻", label: "Bortkørsel" },
  { ico: "🌳", label: "Beskæring" },
  { ico: "🍂", label: "Haveoprydning" }
];

function renderGalleri() {
  var slider = document.getElementById("gallery-slider");
  var dots   = document.getElementById("gallery-dots");

  slider.innerHTML = GALLERY.map(function(g, i) {
    return '<div class="gallery-slide">'
      + '<span style="font-size:5rem">' + g.ico + '</span>'
      + '<span class="gallery-slide-label">' + g.label + '</span>'
      + '</div>';
  }).join("");

  dots.innerHTML = GALLERY.map(function(_, i) {
    return '<span class="gdot' + (i === 0 ? ' active' : '') + '"></span>';
  }).join("");

  /* Opdater dots ved scroll */
  slider.addEventListener("scroll", function() {
    var idx = Math.round(slider.scrollLeft / slider.clientWidth);
    dots.querySelectorAll(".gdot").forEach(function(d, i) {
      d.classList.toggle("active", i === idx);
    });
  }, { passive: true });
}

/* ══════════════════════════════
   10. TOAST
══════════════════════════════ */
var toastT;
function toast(msg) {
  var t = document.getElementById("app-toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(function() { t.classList.remove("show"); }, 2500);
}

/* ══════════════════════════════
   11. HJÆLPERE
══════════════════════════════ */
function setText(ctx, sel, val) {
  var el = (ctx instanceof Element) ? ctx.querySelector(sel) : document.querySelector(sel);
  if (el) el.textContent = val;
}

function copyPhone() {
  navigator.clipboard && navigator.clipboard.writeText(D.telefon)
    .then(function() { toast("📋 Kopieret: " + D.telefon); })
    .catch(function() { toast(D.telefon); });
}

/* ══════════════════════════════
   12. PWA
══════════════════════════════ */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .catch(function(e) { console.warn("SW:", e); });
  }
}

/* ══════════════════════════════
   13. INIT
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", function() {
  D = getData();

  /* Render alle sektioner */
  renderHome();
  renderYdelser();
  renderPriser();
  renderKontakt();

  /* Galleri */
  renderGalleri();

  /* Hjælp velkomst */
  addHelpMsg("Hej! 👋 Jeg er Finnes Entreprises hurtige hjælper.\n\nHvad kan jeg hjælpe dig med?", false);
  showHelpMenu();

  /* Bundnavigation */
  document.querySelectorAll(".nav-item").forEach(function(el) {
    el.addEventListener("click", function() {
      goTo(el.dataset.screen);
    });
  });

  /* Beregner: live-beregn ved input */
  var calcInput = document.getElementById("calc-m2");
  if (calcInput) {
    calcInput.addEventListener("input", beregnLive);
  }

  /* Start på forside */
  goTo("home", false);

  /* PWA */
  registerSW();
});
