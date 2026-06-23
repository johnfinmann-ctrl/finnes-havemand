/* ============================================================
   app.js — Finnes Entreprise v1.1
   Prisberegner, chatbot, tilbudsformular, PWA.

   NY i v1.1: Siden henter data fra localStorage hvis admin
   har gemt ændringer via admin.html. Ellers bruges CONFIG.
   ============================================================ */

/* ── STANDARD-KONFIGURATION ──────────────────────────────────
   Disse værdier bruges ALTID som fallback, hvis admin.html
   ikke har gemt noget i localStorage endnu.
   ─────────────────────────────────────────────────────────── */
var DEFAULT = {
  firmanavn:    "Finnes Entreprise",
  slogan:       "Have · Anlæg · Minigraver",
  forsidetekst: "Vi passer din have og løser dine grave- og anlægsopgaver — professionelt, pålideligt og til konkurrencedygtige priser.",
  telefon:      "40 13 73 70",
  telefon_raw:  "+4540137370",
  sms_raw:      "+4540137370",
  email:        "finmann1@gmail.com",
  cvr:          "46557557",
  momstekst:    "Momsregistreret",
  omraade:      "Vejle, Børkop, Egtved, Jelling, Kolding, Brejning, Omegn",

  timepris:            450,
  minimumspris:        350,
  pris_pr_m2:         1.25,
  minigraver_timepris: 650,
  tillaeg_hoejt_graes: 200,
  tillaeg_bortkoersel: 150,

  ydelser: [
    { ikon: "🌿", titel: "Græsslåning",   tekst: "Regelmæssig eller enkeltstående klipning. Fast aftale giver rabat." },
    { ikon: "✂️", titel: "Hækklipning",   tekst: "Professionel klipning og formgivning — hæk og buske." },
    { ikon: "🍂", titel: "Haveoprydning", tekst: "Rydning, beskæring og oprydning — hele haven gøres klar." },
    { ikon: "🚛", titel: "Bortkørsel",    tekst: "Vi kører haveaffald og overskudsjord bort — korrekt og lovligt." },
    { ikon: "🚜", titel: "Minigraver",    tekst: "Udgravning, planering, fundament, dræn og jordflytning." },
    { ikon: "⛏️", titel: "Jordarbejde",  tekst: "Større og mindre gravearbejde til alt fra dræn til terrasse." },
    { ikon: "🧱", titel: "Belægning",     tekst: "Fliser, grus og indkørsler — vi lægger det pænt og holdbart." },
    { ikon: "🏡", titel: "Sommerhus",     tekst: "Åbning, lukning og løbende vedligeholdelse af sommerhuset." }
  ],

  chatbot_svar: {
    priser:     "Vores vejledende priser:\n• Timepris: fra 450 kr./time\n• Minimum pr. besøg: 350 kr.\n• Græsklip: fra 1,25 kr./m²\n• Minigraver: fra 650 kr./time\n• Kørselstillæg aftales\n\nKontakt os for et præcist tilbud 😊",
    opgaver:    "Vi udfører bl.a.:\n✅ Græsslåning og hækklipning\n✅ Haveoprydning og rydning\n✅ Minigraver-opgaver\n✅ Jordarbejde og gravearbejde\n✅ Bortkørsel af haveaffald\n✅ Belægningsopgaver\n✅ Vedligeholdelse af sommerhuse",
    minigraver: "Ja! Vi har minigraver til:\n• Udgravning og planering\n• Jordflytning\n• Fundament og dræn\n• Mindre anlægsopgaver\n\nTimepris fra 650 kr.\nRing til os for booking.",
    omraade:    "Vi dækker primært:\n📍 Vejle, Børkop, Egtved, Jelling,\n   Kolding, Brejning og omegn.\n\nEr du i tvivl? Ring til os! 📞"
  }
};

/* ── HENT AKTIVE DATA (localStorage > DEFAULT) ─────────────
   getData() returnerer ét samlet objekt med alle værdier.
   Admin-data fra localStorage merges ovenpå DEFAULT, så
   kun de felter admin har ændret, overskrives.
   ─────────────────────────────────────────────────────────── */
function getData() {
  try {
    var saved = localStorage.getItem("fe_admin_data");
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT));
    var parsed = JSON.parse(saved);
    // Merge: start fra en kopi af DEFAULT, overskiv med admin-data
    var merged = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(parsed).forEach(function(k) {
      if (parsed[k] !== null && parsed[k] !== undefined) {
        merged[k] = parsed[k];
      }
    });
    return merged;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT));
  }
}

/* Aktive data til brug i hele filen */
var D = getData();

/* Hjælper: lav fuld tel:/sms:/mailto:-link */
function rawPhone(nr) {
  return "tel:+" + nr.replace(/[^0-9]/g, "");
}
function rawSms(nr) {
  return "sms:+" + nr.replace(/[^0-9]/g, "");
}

/* ── ANVEND DATA PÅ SIDEN ──────────────────────────────────── */
function applyDataToPage() {
  /* Navigation — firmanavn */
  var navLogo = document.querySelector(".nav-logo-text");
  if (navLogo) navLogo.textContent = D.firmanavn;

  /* Hero */
  var h1 = document.getElementById("hero-firmanavn");
  if (h1) h1.textContent = D.firmanavn;

  var tagEl = document.getElementById("hero-slogan");
  if (tagEl) tagEl.textContent = D.slogan;

  var subEl = document.getElementById("hero-sub");
  if (subEl) subEl.textContent = D.forsidetekst;

  /* Hero-knapper */
  var btnRing = document.getElementById("btn-ring");
  if (btnRing) { btnRing.href = rawPhone(D.telefon_raw || D.telefon); }

  var btnSms = document.getElementById("btn-sms");
  if (btnSms) { btnSms.href = rawSms(D.sms_raw || D.telefon_raw || D.telefon); }

  var btnMail = document.getElementById("btn-mail");
  if (btnMail) { btnMail.href = "mailto:" + D.email; }

  /* Ydelseskort */
  var grid = document.getElementById("ydelser-grid");
  if (grid && D.ydelser && D.ydelser.length) {
    grid.innerHTML = D.ydelser.map(function(y) {
      return "<div class=\"card\">"
        + "<span class=\"icon\">" + (y.ikon || "🌿") + "</span>"
        + "<h3>" + esc(y.titel) + "</h3>"
        + "<p>" + esc(y.tekst) + "</p>"
        + "</div>";
    }).join("");
  }

  /* Prisliste */
  setText("pris-timepris",            "Fra " + D.timepris + " kr./t");
  setText("pris-minimum",             D.minimumspris + " kr.");
  setText("pris-m2",                  "Fra " + D.pris_pr_m2 + " kr./m²");
  setText("pris-hoejt",               "+" + D.tillaeg_hoejt_graes + " kr.");
  setText("pris-bortkoersel-tillaeg", "+" + D.tillaeg_bortkoersel + " kr.");
  setText("pris-minigraver",          "Fra " + D.minigraver_timepris + " kr./t");

  /* Kontakt-sektion */
  var kRing = document.getElementById("kontakt-ring");
  if (kRing) { kRing.href = rawPhone(D.telefon_raw || D.telefon); kRing.querySelector("span:last-child").textContent = D.telefon; }

  var kSms = document.getElementById("kontakt-sms");
  if (kSms) { kSms.href = rawSms(D.sms_raw || D.telefon_raw || D.telefon); }

  var kMail = document.getElementById("kontakt-mail");
  if (kMail) { kMail.href = "mailto:" + D.email; kMail.querySelector("span:last-child").textContent = D.email; }

  setText("kontakt-cvr",   "CVR: " + D.cvr);
  setText("kontakt-moms",  D.momstekst);

  /* Dækningsområde */
  var areasEl = document.getElementById("omraade-chips");
  if (areasEl) {
    var areas = typeof D.omraade === "string" ? D.omraade.split(",") : D.omraade;
    areasEl.innerHTML = areas.map(function(a) {
      return "<span class=\"area-chip\">" + esc(a.trim()) + "</span>";
    }).join("");
  }

  /* Footer */
  var footerEl = document.getElementById("footer-text");
  if (footerEl) {
    footerEl.textContent = "© " + new Date().getFullYear() + " " + D.firmanavn + " · CVR " + D.cvr + " · " + D.momstekst;
  }

  /* Chatbot-titel */
  var cbTitle = document.querySelector(".chatbot-title");
  if (cbTitle) cbTitle.textContent = D.firmanavn;

  /* Tilbudsformular — hints */
  var fHint = document.getElementById("form-kontakt-hint");
  if (fHint) {
    fHint.innerHTML = "📷 Billeder kan sendes som SMS til <strong>" + esc(D.telefon)
      + "</strong> eller på mail til <strong>" + esc(D.email) + "</strong> — det hjælper os med at give dig et præcist tilbud.";
  }
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── PRISBEREGNER ───────────────────────────────────────────── */
function beregnPris() {
  var m2Input  = document.getElementById("kvm");
  var hoejt    = document.getElementById("hoejt-graes").checked;
  var bortkoer = document.getElementById("bortkoersel").checked;
  var result   = document.getElementById("calc-result");
  var linesEl  = document.getElementById("calc-lines");
  var totalEl  = document.getElementById("calc-total");

  var m2 = parseFloat(m2Input.value);
  if (!m2 || m2 <= 0) {
    m2Input.focus();
    m2Input.style.borderColor = "#C0392B";
    return;
  }
  m2Input.style.borderColor = "";

  /* Brug aktuelle priser fra D (som kan komme fra localStorage) */
  var pris     = parseFloat(D.pris_pr_m2) || 1.25;
  var minimum  = parseFloat(D.minimumspris) || 350;
  var thGraes  = parseFloat(D.tillaeg_hoejt_graes) || 200;
  var thBort   = parseFloat(D.tillaeg_bortkoersel) || 150;

  var basis = m2 * pris;
  if (basis < minimum) basis = minimum;

  var tHoejt = hoejt    ? thGraes : 0;
  var tBort  = bortkoer ? thBort  : 0;
  var total  = basis + tHoejt + tBort;

  var linjer = [];
  if (m2 * pris < minimum) {
    linjer.push({ label: "Minimumspris pr. besøg", value: minimum });
  } else {
    linjer.push({ label: m2 + " m² × " + pris.toFixed(2) + " kr.", value: basis });
  }
  if (hoejt)   linjer.push({ label: "Tillæg, højt græs",  value: tHoejt });
  if (bortkoer) linjer.push({ label: "Tillæg, bortkørsel", value: tBort  });

  linesEl.innerHTML = linjer.map(function(l) {
    return "<div class=\"calc-result-line\"><span>" + l.label + "</span><span>" + l.value + " kr.</span></div>";
  }).join("");

  totalEl.textContent = total + " kr.";
  result.classList.add("show");
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ── TILBUDSFORMULAR ────────────────────────────────────────── */
function sendTilbud(e) {
  e.preventDefault();
  var f       = e.target;
  var navn    = f.navn.value.trim();
  var tlf     = f.telefon.value.trim();
  var adresse = f.adresse.value.trim();
  var opgave  = f.opgave.value;
  var beskr   = f.beskrivelse.value.trim();
  var tidspkt = f.tidspunkt.value.trim();
  var bill    = f.billeder.checked ? "\n\nBilleder kan sendes på SMS: " + D.telefon : "";

  if (!navn || !tlf) { alert("Udfyld venligst navn og telefonnummer."); return; }

  var emne = encodeURIComponent("Tilbud — " + opgave + " — " + navn);
  var body = encodeURIComponent(
    "Navn: " + navn + "\nTelefon: " + tlf + "\nAdresse/by: " + adresse +
    "\n\nOpgave: " + opgave + "\nBeskrivelse:\n" + beskr +
    "\n\nØnsket tidspunkt: " + tidspkt + bill
  );
  window.location.href = "mailto:" + D.email + "?subject=" + emne + "&body=" + body;
}

/* ── CHATBOT (regelbaseret) ─────────────────────────────────── */
var MENU = [
  { tekst: "💰 Hvad koster det?",      id: "priser"     },
  { tekst: "📋 Hvad laver I?",          id: "opgaver"    },
  { tekst: "🚜 Har I minigraver?",      id: "minigraver" },
  { tekst: "📍 Dækningsområde",         id: "omraade"    },
  { tekst: "🌿 Beregn græspris",        id: "graespris"  },
  { tekst: "📬 Jeg vil have et tilbud", id: "tilbud"     },
  { tekst: "📞 Ring til os",            id: "ring"       },
  { tekst: "💬 Send SMS",               id: "sms"        }
];

var chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById("chatbot-window").classList.toggle("open", chatOpen);
  if (chatOpen) {
    var badge = document.querySelector(".chatbot-badge");
    if (badge) badge.style.display = "none";
  }
}

function addBotMsg(tekst) {
  var msgs = document.getElementById("chat-messages");
  var div  = document.createElement("div");
  div.className = "chat-bubble bot";
  div.style.whiteSpace = "pre-wrap";
  div.textContent = tekst;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(tekst) {
  var msgs = document.getElementById("chat-messages");
  var div  = document.createElement("div");
  div.className = "chat-bubble user";
  div.textContent = tekst;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showMenu() {
  var msgs = document.getElementById("chat-messages");
  var wrap = document.createElement("div");
  wrap.className = "chat-actions";
  MENU.forEach(function(item) {
    var btn = document.createElement("button");
    btn.className = "chat-btn";
    btn.textContent = item.tekst;
    btn.onclick = function() { handleChoice(item); };
    wrap.appendChild(btn);
  });
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function handleChoice(item) {
  addUserMsg(item.tekst);

  if (item.id === "ring") { window.location.href = rawPhone(D.telefon_raw || D.telefon); return; }
  if (item.id === "sms")  { window.location.href = rawSms(D.sms_raw || D.telefon_raw || D.telefon); return; }

  if (item.id === "graespris") {
    addBotMsg(D.chatbot_svar && D.chatbot_svar.graespris ? D.chatbot_svar.graespris
      : "Brug vores prisberegner på siden — den giver dig en vejledende pris med det samme. 🌿");
    setTimeout(function() {
      toggleChat();
      document.getElementById("prisberegner").scrollIntoView({ behavior: "smooth" });
    }, 1200);
    return;
  }
  if (item.id === "tilbud") {
    addBotMsg(D.chatbot_svar && D.chatbot_svar.tilbud ? D.chatbot_svar.tilbud
      : "Udfyld tilbudsformularen på siden, og vi vender tilbage hurtigst muligt. 📞");
    setTimeout(function() {
      toggleChat();
      document.getElementById("tilbud").scrollIntoView({ behavior: "smooth" });
    }, 1200);
    return;
  }
  if (item.id === "omraade" && D.chatbot_svar && D.chatbot_svar.omraade) {
    /* Brug admin-redigeret svar, men erstat stednavne fra D.omraade */
    addBotMsg(D.chatbot_svar.omraade);
  } else if (item.id === "priser" && D.chatbot_svar && D.chatbot_svar.priser) {
    /* Generer prissvaret dynamisk fra aktuelle priser */
    var prisText = "Vores vejledende priser:\n"
      + "• Timepris: fra " + D.timepris + " kr./time\n"
      + "• Minimum pr. besøg: " + D.minimumspris + " kr.\n"
      + "• Græsklip: fra " + D.pris_pr_m2 + " kr./m²\n"
      + "• Minigraver: fra " + D.minigraver_timepris + " kr./time\n"
      + "• Kørselstillæg aftales\n\nKontakt os for et præcist tilbud 😊";
    addBotMsg(prisText);
  } else {
    var svar = D.chatbot_svar && D.chatbot_svar[item.id]
      ? D.chatbot_svar[item.id]
      : "Det ved jeg desværre ikke — ring til os på " + D.telefon + " 😊";
    addBotMsg(svar);
  }

  setTimeout(function() {
    addBotMsg("Er der andet jeg kan hjælpe med?");
    showMenu();
  }, 700);
}

/* ── SERVICE WORKER ─────────────────────────────────────────── */
function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("service-worker.js")
    .then(function(reg) {
      /* Lyt efter ny service worker — viser besked til brugeren */
      reg.addEventListener("updatefound", function() {
        var nw = reg.installing;
        nw.addEventListener("statechange", function() {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            visOpdateringsbesked();
          }
        });
      });
    })
    .catch(function(e) { console.warn("SW fejl:", e); });

  /* Lyt efter postMessage fra ny service worker */
  navigator.serviceWorker.addEventListener("message", function(e) {
    if (e.data && e.data.type === "SW_UPDATED") visOpdateringsbesked();
  });
}

function visOpdateringsbesked() {
  var b = document.getElementById("sw-update-banner");
  if (b) b.classList.add("show");
}

function lukOpdateringsbesked() {
  var b = document.getElementById("sw-update-banner");
  if (b) b.classList.remove("show");
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function() {
  /* Hent friske data (localStorage > DEFAULT) og opdater siden */
  D = getData();
  applyDataToPage();

  document.getElementById("calc-btn").addEventListener("click", beregnPris);
  document.getElementById("tilbud-form").addEventListener("submit", sendTilbud);

  document.getElementById("kvm").addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); beregnPris(); }
  });

  document.getElementById("chatbot-fab").addEventListener("click", toggleChat);
  document.getElementById("chatbot-close").addEventListener("click", toggleChat);

  addBotMsg("Hej! 👋 Jeg er din hurtige hjælper hos " + D.firmanavn + ".\n\nHvad kan jeg hjælpe dig med?");
  showMenu();

  registerSW();
});
