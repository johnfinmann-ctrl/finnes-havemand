/* ================================================================
   app.js — Finnes Entreprise v2.0.0
   Auto-genereret: 2026-06-23
   Baseline: V2. Tilføjet: tilbudsformular, update-banner,
   logo-admin-support, korrekte quick-icon indekser.
   ================================================================ */

/* ══════════════════════════════
   1. DATA
══════════════════════════════ */
var DEFAULT = {
  firmanavn:    "Finnes Entreprise",
  slogan:       "Have · Anlæg · Minigraver",
  logo:         "assets/icon-192.png",
  telefon:      "40 13 73 70",
  telefon_raw:  "+4540137370",
  sms_raw:      "+4540137370",
  email:        "finmann1@gmail.com",
  cvr:          "46557557",
  momstekst:    "Momsregistreret",
  adresse:      "Vejle-området",
  aabningstid:  "Man–fre 07–17 · Lør efter aftale",
  omraade:      "Vejle, Børkop, Egtved, Jelling, Kolding, Brejning",
  maps_url:     "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d89488.0!2d9.3!3d55.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVmVqbGU!5e0!3m2!1sda!2sdk!4v1700000000000",

  timepris:            450,
  minimumspris:        350,
  pris_pr_m2:         1.25,
  minigraver_timepris: 650,
  tillaeg_hoejt_graes: 200,
  tillaeg_bortkoersel: 150,

  ydelser: [
    { id:"graes",   ico:"🌿", navn:"Græsslåning",  tekst:"Regelmæssig eller enkeltstående slåning.\nFast aftale giver rabat.\nAlt afklip ryddes." },
    { id:"haek",    ico:"✂️", navn:"Hækklipning",  tekst:"Professionel klipning og formgivning.\nBegge sider. Bortkørsel inkl." },
    { id:"graver",  ico:"🚜", navn:"Minigraver",    tekst:"Udgravning, planering, dræn, fundament.\nMinimum 2 timer.\nKørsel inkl. i nærområdet." },
    { id:"bort",    ico:"🛻", navn:"Bortkørsel",    tekst:"Vi kører haveaffald og jord bort.\nSamme dag efter aftale." },
    { id:"belaeg",  ico:"🪨", navn:"Belægning",     tekst:"Fliser, grus, chaussésten.\nIndkørsler og terrasser.\nSolidt og pænt håndværk." },
    { id:"beskaer", ico:"🌳", navn:"Beskæring",     tekst:"Frugttræer, buske og hæk.\nKorrekt årstidsbestemt beskæring." },
    { id:"opryd",   ico:"🍂", navn:"Haveoprydning", tekst:"Forår- og efterårsrydning.\nLøvfald, ukrudt, kanter.\nHaven klar til sæsonen." },
    { id:"sommer",  ico:"🏡", navn:"Sommerhus",     tekst:"Åbning og lukning af sæson.\nLøbende vedligeholdelse.\nFast aftale med rabat." }
  ]
};

function getData() {
  try {
    var raw = localStorage.getItem("fe_admin_data");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT));
    var saved = JSON.parse(raw);
    var out   = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(saved).forEach(function(k) {
      if (saved[k] !== null && saved[k] !== undefined) out[k] = saved[k];
    });
    return out;
  } catch(e) { return JSON.parse(JSON.stringify(DEFAULT)); }
}

var D = {};

/* ══════════════════════════════
   2. ROUTING
══════════════════════════════ */
var currentScreen = "home";
var screenHistory  = [];

function goTo(id, push) {
  if (push === undefined) push = true;
  document.querySelectorAll(".screen").forEach(function(s) { s.classList.remove("active"); });
  var next = document.getElementById("s-" + id);
  if (!next) return;
  next.classList.add("active");
  if (push && id !== currentScreen) screenHistory.push(currentScreen);
  currentScreen = id;
  updateNav(id);
  next.scrollTop = 0;
}

function goBack() {
  var prev = screenHistory.length > 0 ? screenHistory.pop() : "home";
  goTo(prev, false);
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

  /* Logo — admin kan overstyre med URL eller assets/-sti */
  var logo = el.querySelector(".home-logo");
  if (logo) { logo.src = D.logo || "assets/icon-192.png"; logo.alt = D.firmanavn; }

  setText(el, ".home-name",   D.firmanavn);
  setText(el, ".home-slogan", D.slogan);

  el.querySelector("#home-ring").href = "tel:" + D.telefon_raw;
  el.querySelector("#home-sms").href  = "sms:" + D.sms_raw;

  /* 4 quick-icons — jf. brief: 🌱 Græsslåning, 🚜 Minigraver, ✂️ Hæk, 🍂 Havearbejde */
  var quickMap = [
    { id:"graes",  ico:"🌱", label:"Græsslåning" },
    { id:"graver", ico:"🚜", label:"Minigraver"  },
    { id:"haek",   ico:"✂️", label:"Hæk"         },
    { id:"opryd",  ico:"🍂", label:"Havearbejde" }
  ];

  el.querySelectorAll(".quick-icon").forEach(function(q, i) {
    var qi = quickMap[i];
    if (!qi) return;
    q.querySelector(".qi").textContent      = qi.ico;
    q.querySelector(".qi-label").textContent = qi.label;
    q.onclick = function() { openYdelse(qi.id); };
  });
}

/* ══════════════════════════════
   4. YDELSER
══════════════════════════════ */
function renderYdelser() {
  document.getElementById("ydelser-grid").innerHTML = D.ydelser.map(function(y) {
    return '<div class="service-tile" onclick="openYdelse(\'' + y.id + '\')">'
      + '<span class="st-ico">' + y.ico + '</span>'
      + '<span>' + y.navn + '</span>'
      + '</div>';
  }).join("");
}

function openYdelse(id) {
  var y = D.ydelser.find(function(x) { return x.id === id; });
  if (!y) return;
  var s = document.getElementById("s-ydelse-detail");
  s.querySelector(".service-detail-img").innerHTML = '<span style="font-size:4.5rem">' + y.ico + '</span>';
  setText(s, ".service-detail-title", y.navn);
  setText(s, ".service-detail-text",  y.tekst);
  s.querySelector("#det-ring").href = "tel:" + D.telefon_raw;
  s.querySelector("#det-sms").href  = "sms:" + D.sms_raw;
  s.querySelector("#det-tilbud").onclick = function() { prefillTilbud(y.navn); goTo("tilbud"); };
  goTo("ydelse-detail");
}

/* ══════════════════════════════
   5. PRISER
══════════════════════════════ */
function renderPriser() {
  var cards = [
    { ico:"⏱️", label:"Timepris",          value:"Fra " + D.timepris + " kr.",             sub:"Alm. havearbejde"      },
    { ico:"🌿", label:"Græsslåning pr. m²", value:D.pris_pr_m2 + " kr./m²",                sub:"Min. " + D.minimumspris + " kr." },
    { ico:"📍", label:"Minimumspris",       value:D.minimumspris + " kr.",                  sub:"Pr. besøg"             },
    { ico:"🚜", label:"Minigraver",         value:"Fra " + D.minigraver_timepris + " kr.", sub:"Pr. time inkl. kørsel" },
    { ico:"🛻", label:"Bortkørsel",         value:"+" + D.tillaeg_bortkoersel + " kr.",    sub:"Tillæg pr. gang"       },
    { ico:"📅", label:"Fast aftale",        value:"Op til 15%",                             sub:"Uge- eller 14-dages"  }
  ];
  document.getElementById("pris-cards").innerHTML = cards.map(function(c) {
    return '<div class="price-card">'
      + '<span class="pc-ico">' + c.ico + '</span>'
      + '<span class="pc-label">' + c.label + '</span>'
      + '<span class="pc-value">' + c.value + '</span>'
      + '<span class="pc-sub">' + c.sub + '</span>'
      + '</div>';
  }).join("");
}

/* ══════════════════════════════
   6. BEREGNER (uændret fra V2)
══════════════════════════════ */
var calcState = { hoejt: false, bortkoer: false };

function toggleCalc(item) {
  item.classList.toggle("on");
  calcState[item.dataset.toggle] = item.classList.contains("on");
  beregnLive();
}

function beregnLive() {
  var m2  = parseFloat(document.getElementById("calc-m2").value) || 0;
  var box = document.getElementById("calc-result");
  if (m2 <= 0) { box.classList.remove("show"); return; }

  var p   = parseFloat(D.pris_pr_m2) || 1.25;
  var min = parseFloat(D.minimumspris) || 350;
  var tH  = parseFloat(D.tillaeg_hoejt_graes) || 200;
  var tB  = parseFloat(D.tillaeg_bortkoersel) || 150;

  var basis = Math.max(m2 * p, min);
  var total = basis + (calcState.hoejt ? tH : 0) + (calcState.bortkoer ? tB : 0);

  var linjer = [];
  if (m2 * p < min) {
    linjer.push({ l:"Minimumspris pr. besøg", v:min + " kr." });
  } else {
    linjer.push({ l:m2 + " m² × " + p + " kr.", v:basis + " kr." });
  }
  if (calcState.hoejt)    linjer.push({ l:"Tillæg, højt græs",  v:"+" + tH + " kr." });
  if (calcState.bortkoer) linjer.push({ l:"Tillæg, bortkørsel", v:"+" + tB + " kr." });

  box.querySelector(".crb-amount").textContent = total + " kr.";
  box.querySelector(".crb-lines").innerHTML = linjer.map(function(l) {
    return '<div class="crb-line"><span>' + l.l + '</span><span>' + l.v + '</span></div>';
  }).join("");
  box.classList.add("show");
}

/* ══════════════════════════════
   7. TILBUDSFORMULAR
══════════════════════════════ */
function prefillTilbud(opgave) {
  var sel = document.getElementById("tf-opgave");
  if (!sel || !opgave) return;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === opgave) { sel.selectedIndex = i; break; }
  }
}

function sendTilbud(e) {
  e.preventDefault();
  var navn    = (document.getElementById("tf-navn").value    || "").trim();
  var tlf     = (document.getElementById("tf-tlf").value     || "").trim();
  var adresse = (document.getElementById("tf-adresse").value || "").trim();
  var opgave  = document.getElementById("tf-opgave").value;
  var beskr   = (document.getElementById("tf-beskr").value   || "").trim();
  var tid     = (document.getElementById("tf-tid").value     || "").trim();
  var bill    = document.getElementById("tf-billeder").checked;

  if (!navn || !tlf) { toast("⚠️ Udfyld navn og telefon"); return; }

  var body = encodeURIComponent(
    "Navn: " + navn +
    "\nTelefon: " + tlf +
    "\nAdresse: " + adresse +
    "\n\nOpgave: " + opgave +
    "\nBeskrivelse:\n" + beskr +
    "\n\nTidspunkt: " + tid +
    (bill ? "\n\nBilleder sendes på SMS: " + D.telefon : "")
  );
  var emne = encodeURIComponent("Tilbud – " + opgave + " – " + navn);
  window.location.href = "mailto:" + D.email + "?subject=" + emne + "&body=" + body;
}

/* ══════════════════════════════
   8. KONTAKT
══════════════════════════════ */
function renderKontakt() {
  var el = document.getElementById("s-kontakt");
  el.querySelector("#k-ring").href = "tel:" + D.telefon_raw;
  el.querySelector("#k-ring").querySelector(".ci-value").textContent = D.telefon;
  el.querySelector("#k-sms").href  = "sms:" + D.sms_raw;
  el.querySelector("#k-mail").href = "mailto:" + D.email;
  el.querySelector("#k-mail").querySelector(".ci-value").textContent = D.email;
  setText(el, "#k-cvr",     "CVR: " + D.cvr + " · " + D.momstekst);
  setText(el, "#k-tid",     D.aabningstid);
  setText(el, "#k-adresse", D.adresse);

  el.querySelector("#k-omraade").innerHTML = D.omraade.split(",").map(function(a) {
    return '<span class="area-pill">' + a.trim() + '</span>';
  }).join("");

  var map = el.querySelector("#k-map iframe");
  if (map) map.src = D.maps_url;
}

function copyPhone() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(D.telefon)
      .then(function() { toast("📋 Kopieret: " + D.telefon); })
      .catch(function() { toast(D.telefon); });
  } else { toast(D.telefon); }
}

/* ══════════════════════════════
   9. HJÆLP (uændret fra V2)
══════════════════════════════ */
var HELP_MENU = [
  { tekst:"💰 Hvad koster det?",       id:"priser"  },
  { tekst:"🚜 Har I minigraver?",      id:"graver"  },
  { tekst:"📋 Hvordan får jeg tilbud?",id:"tilbud"  },
  { tekst:"📍 Hvilke områder?",        id:"omraade" },
  { tekst:"⏰ Åbningstider?",          id:"tid"     },
  { tekst:"📞 Ring til os",            id:"ring"    },
  { tekst:"💬 Send SMS",               id:"sms"     }
];

var helpLaunched = false;

function launchHelp() {
  if (helpLaunched) return;
  helpLaunched = true;
  addHelpMsg("Hej! 👋 Jeg er din hurtige hjælper.\n\nHvad kan jeg hjælpe dig med?", false);
  showHelpMenu();
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

  if (item.id === "tilbud") {
    addHelpMsg("Udfyld vores tilbudsformular — vi svarer inden 1–2 hverdage.", false);
    setTimeout(function() { goTo("tilbud"); }, 900);
    return;
  }

  var svar = {
    priser:  "Vores priser:\n• Timepris fra " + D.timepris + " kr.\n• Min. pr. besøg: " + D.minimumspris + " kr.\n• Græs pr. m²: " + D.pris_pr_m2 + " kr.\n• Minigraver fra " + D.minigraver_timepris + " kr./time\n\nAlt ekskl. moms.",
    graver:  "Ja! Vi har minigraver til:\n• Udgravning og planering\n• Jordflytning\n• Dræn og fundament\n\nRing for booking 📞",
    omraade: "Vi kører primært til:\n📍 " + D.omraade + "\n\nRing og spørg — vi løser det!",
    tid:     "Åbningstider:\n⏰ " + D.aabningstid + "\n\nHastet behov? Ring — vi gør hvad vi kan 💪"
  };

  var s = svar[item.id];
  if (s) {
    addHelpMsg(s, false);
    setTimeout(function() { addHelpMsg("Kan jeg hjælpe med noget andet?", false); showHelpMenu(); }, 700);
  }
}

/* ══════════════════════════════
   10. GALLERI
══════════════════════════════ */
var GALLERY = [
  { ico:"🌿", label:"Færdig plæne — Vejle" },
  { ico:"✂️", label:"Hæk — skarp kant" },
  { ico:"🚜", label:"Minigraver — udgravning" },
  { ico:"🏡", label:"Sommerhus — vedligeholdelse" },
  { ico:"🌳", label:"Beskæring — frugttræer" },
  { ico:"🍂", label:"Haveoprydning — efterår" }
];

function renderGalleri() {
  var slider = document.getElementById("gallery-slider");
  var dots   = document.getElementById("gallery-dots");

  slider.innerHTML = GALLERY.map(function(g) {
    return '<div class="gallery-slide" style="cursor:default">'
      + '<span style="font-size:5rem;line-height:1">' + g.ico + '</span>'
      + '<span class="gallery-slide-label">' + g.label + '</span>'
      + '</div>';
  }).join("");

  dots.innerHTML = GALLERY.map(function(_, i) {
    return '<span class="gdot' + (i === 0 ? " active" : "") + '"></span>';
  }).join("");

  slider.addEventListener("scroll", function() {
    var idx = Math.round(slider.scrollLeft / (slider.clientWidth || 1));
    dots.querySelectorAll(".gdot").forEach(function(d, i) {
      d.classList.toggle("active", i === idx);
    });
  }, { passive: true });
}

/* ══════════════════════════════
   11. TOAST
══════════════════════════════ */
var toastT;
function toast(msg) {
  var t = document.getElementById("app-toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(function() { t.classList.remove("show"); }, 2600);
}

/* ══════════════════════════════
   12. HELPERS
══════════════════════════════ */
function setText(ctx, sel, val) {
  var el = (ctx instanceof Element) ? ctx.querySelector(sel) : document.querySelector(sel);
  if (el) el.textContent = val;
}

/* ══════════════════════════════
   13. PWA — Service Worker
══════════════════════════════ */
function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("sw.js?v=20260623")
    .then(function(reg) {
      /* Lyt efter ny SW der er fundet */
      reg.addEventListener("updatefound", function() {
        var nw = reg.installing;
        nw.addEventListener("statechange", function() {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    })
    .catch(function(e) { console.warn("[SW]", e); });

  /* Lyt efter besked fra ny SW (postMessage fra activate) */
  navigator.serviceWorker.addEventListener("message", function(e) {
    if (e.data && e.data.type === "SW_UPDATED") showUpdateBanner();
  });
}

function showUpdateBanner() {
  var b = document.getElementById("update-banner");
  if (b) b.classList.add("show");
}

function dismissUpdate() {
  var b = document.getElementById("update-banner");
  if (b) b.classList.remove("show");
}

/* ══════════════════════════════
   14. INIT
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", function() {
  D = getData();

  renderHome();
  renderYdelser();
  renderPriser();
  renderKontakt();
  renderGalleri();

  /* Bundnavigation */
  document.querySelectorAll(".nav-item").forEach(function(el) {
    el.addEventListener("click", function() {
      var id = el.dataset.screen;
      if (id === "hjaelp") launchHelp();
      goTo(id);
    });
  });

  /* Beregner live */
  var ci = document.getElementById("calc-m2");
  if (ci) ci.addEventListener("input", beregnLive);

  /* Tilbudsformular */
  var tf = document.getElementById("tilbud-form");
  if (tf) tf.addEventListener("submit", sendTilbud);

  registerSW();
  goTo("home", false);
});
