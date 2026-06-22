/* ============================================================
   app.js — Finnes Entreprise
   Prisberegner, regelbaseret chatbot, tilbudsformular, PWA.
   ============================================================ */

/* ── TILPAS DISSE VÆRDIER — priser, kontakt, dækningsområde ──
   Alle ændringer herfra slår automatisk igennem på siden.
   ─────────────────────────────────────────────────────────── */
const CONFIG = {
  pris_pr_m2:          1.25,
  minimumspris:         350,
  tillaeg_hoejt_graes: 200,
  tillaeg_bortkoersel: 150,

  // ── TILPAS: Kontakt ──
  telefon:      "40 13 73 70",
  telefon_link: "tel:+4540137370",
  sms_link:     "sms:+4540137370",
  email:        "finmann1@gmail.com",
  email_link:   "mailto:finmann1@gmail.com",

  // ── TILPAS: Virksomhedsinfo ──
  cvr:     "46557557",
  omraade: ["Vejle", "Børkop", "Egtved", "Jelling", "Kolding", "Brejning", "Omegn"],
};

/* ── PRISBEREGNER ── */
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

  var basispris = m2 * CONFIG.pris_pr_m2;
  if (basispris < CONFIG.minimumspris) basispris = CONFIG.minimumspris;

  var tillaegHoejt = hoejt    ? CONFIG.tillaeg_hoejt_graes : 0;
  var tillaegBort  = bortkoer ? CONFIG.tillaeg_bortkoersel : 0;
  var total        = basispris + tillaegHoejt + tillaegBort;

  var linjer = [];

  if (m2 * CONFIG.pris_pr_m2 < CONFIG.minimumspris) {
    linjer.push({ label: "Minimumspris pr. besøg", value: CONFIG.minimumspris });
  } else {
    linjer.push({ label: m2 + " m\xB2 \xD7 " + CONFIG.pris_pr_m2.toFixed(2) + " kr.", value: basispris });
  }
  if (hoejt)   linjer.push({ label: "Tillæg, højt græs",  value: tillaegHoejt });
  if (bortkoer) linjer.push({ label: "Tillæg, bortkørsel", value: tillaegBort  });

  linesEl.innerHTML = linjer.map(function(l) {
    return "<div class=\"calc-result-line\"><span>" + l.label + "</span><span>" + l.value + " kr.</span></div>";
  }).join("");

  totalEl.textContent = total + " kr.";
  result.classList.add("show");
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ── TILBUDSFORMULAR ── */
function sendTilbud(e) {
  e.preventDefault();
  var f        = e.target;
  var navn     = f.navn.value.trim();
  var telefon  = f.telefon.value.trim();
  var adresse  = f.adresse.value.trim();
  var opgave   = f.opgave.value;
  var beskr    = f.beskrivelse.value.trim();
  var tidspkt  = f.tidspunkt.value.trim();
  var billeder = f.billeder.checked ? "\n\nBilleder kan sendes på SMS: " + CONFIG.telefon : "";

  if (!navn || !telefon) {
    alert("Udfyld venligst navn og telefonnummer.");
    return;
  }

  var emne = encodeURIComponent("Tilbud \u2014 " + opgave + " \u2014 " + navn);
  var body  = encodeURIComponent(
    "Navn: " + navn + "\nTelefon: " + telefon + "\nAdresse/by: " + adresse +
    "\n\nOpgave: " + opgave + "\nBeskrivelse:\n" + beskr +
    "\n\nØnsket tidspunkt: " + tidspkt + billeder
  );

  window.location.href = CONFIG.email_link + "?subject=" + emne + "&body=" + body;
}

/* ── CHATBOT (regelbaseret, ingen AI) ── */
var MENU = [
  { tekst: "💰 Hvad koster det?",       id: "priser"     },
  { tekst: "📋 Hvad laver I?",           id: "opgaver"    },
  { tekst: "🚜 Har I minigraver?",       id: "minigraver" },
  { tekst: "📍 Dækningsområde",          id: "omraade"    },
  { tekst: "🌿 Beregn græspris",         id: "graespris"  },
  { tekst: "📬 Jeg vil have et tilbud",  id: "tilbud"     },
  { tekst: "📞 Ring til os",             id: "ring"       },
  { tekst: "💬 Send SMS",                id: "sms"        },
];

var SVAR = {
  priser:     "Vores vejledende priser:\n• Timepris: fra 450 kr./time\n• Minimum pr. besøg: 350 kr.\n• Græsklip: fra 1,25 kr./m²\n• Minigraver: fra 650 kr./time\n• Kørselstillæg aftales\n\nKontakt os for et præcist tilbud 😊",
  opgaver:    "Vi udfører bl.a.:\n✅ Græsslåning og hækklipning\n✅ Haveoprydning og rydning\n✅ Minigraver-opgaver\n✅ Jordarbejde og gravearbejde\n✅ Bortkørsel af haveaffald\n✅ Belægningsopgaver\n✅ Vedligeholdelse af sommerhuse",
  minigraver: "Ja! Vi har minigraver til:\n• Udgravning og planering\n• Jordflytning\n• Fundament og dræn\n• Mindre anlægsopgaver\n\nTimepris fra 650 kr.\nRing på " + (CONFIG ? CONFIG.telefon : "") + " for booking.",
  omraade:    "Vi dækker primært:\n📍 Vejle, Børkop, Egtved, Jelling,\n   Kolding, Brejning og omegn.\n\nEr du i tvivl? Ring til os! 📞",
  graespris:  "Brug vores prisberegner på siden.\nDen beregner automatisk en vejledende pris ud fra dine m², om græsset er højt, og om du vil have afklip kørt væk. 🌿",
  tilbud:     "Udfyld tilbudsformularen på siden, og vi vender tilbage hurtigst muligt.\n\nDu kan også sende en SMS eller ringe direkte. 📞",
};

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

  if (item.id === "ring") { window.location.href = CONFIG.telefon_link; return; }
  if (item.id === "sms")  { window.location.href = CONFIG.sms_link;     return; }

  if (item.id === "graespris") {
    addBotMsg(SVAR.graespris);
    setTimeout(function() {
      toggleChat();
      document.getElementById("prisberegner").scrollIntoView({ behavior: "smooth" });
    }, 1200);
    return;
  }
  if (item.id === "tilbud") {
    addBotMsg(SVAR.tilbud);
    setTimeout(function() {
      toggleChat();
      document.getElementById("tilbud").scrollIntoView({ behavior: "smooth" });
    }, 1200);
    return;
  }

  addBotMsg(SVAR[item.id] || "Det ved jeg desværre ikke. Ring til os på " + CONFIG.telefon + " 😊");
  setTimeout(function() {
    addBotMsg("Er der andet jeg kan hjælpe med?");
    showMenu();
  }, 700);
}

/* ── SERVICE WORKER ── */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .catch(function(err) { console.warn("SW fejl:", err); });
  }
}

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("calc-btn").addEventListener("click", beregnPris);
  document.getElementById("tilbud-form").addEventListener("submit", sendTilbud);

  document.getElementById("kvm").addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); beregnPris(); }
  });

  document.getElementById("chatbot-fab").addEventListener("click", toggleChat);
  document.getElementById("chatbot-close").addEventListener("click", toggleChat);

  addBotMsg("Hej! 👋 Jeg er din hurtige hjælper hos Finnes Entreprise.\n\nHvad kan jeg hjælpe dig med?");
  showMenu();

  registerSW();
});
