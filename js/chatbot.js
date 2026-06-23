/**
 * ============================================================
 * CHATBOT.JS — Handyman Engine
 * ============================================================
 * Simpel regelbaseret chatbot (ingen ekstern API/nøgle).
 * Svarer på: priser, ydelser, kontakt, serviceområder,
 * åbningstider, booking af tilbud. Kan ikke svare -> foreslår
 * ring/SMS/mail. Alt indhold trækkes fra config-filerne.
 * ============================================================
 */

(function () {
  "use strict";

  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById("chatbot-window");
    if (win) win.classList.toggle("open", isOpen);
    if (isOpen) {
      const input = document.getElementById("chatbot-text-input");
      if (input) input.focus();
    }
  }

  function addMessage(text, sender) {
    const messages = document.getElementById("chatbot-messages");
    if (!messages) return;
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addQuickActions(actions) {
    const messages = document.getElementById("chatbot-messages");
    if (!messages) return;
    const wrap = document.createElement("div");
    wrap.className = "chat-quick-actions";
    actions.forEach(a => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = a.label;
      btn.addEventListener("click", () => handleUserText(a.label, a.intent));
      wrap.appendChild(btn);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function fallbackSuggestion() {
    addMessage("Det kunne jeg desværre ikke svare på. Du er meget velkommen til at kontakte os direkte:", "bot");
    addQuickActions([
      { label: "📞 Ring " + company.phone, intent: null },
      { label: "💬 Send SMS", intent: null },
      { label: "📩 Send mail", intent: null }
    ]);
  }

  /* ---------- Svarlogik ---------- */
  function buildPricesAnswer() {
    return `Vejledende priser (ekskl. moms):\n` +
      `• Græsslåning: fra ${prices.grass.minimum} kr.\n` +
      `• Hækkeklipning: fra ${prices.hedge.meterRate} kr./meter\n` +
      `• Minigraver: ${prices.excavator.hourRate} kr./time\n` +
      `• Trampolin nedgravning: fra ${prices.trampoline.d300.toLocaleString("da-DK")} kr.\n` +
      `Brug prisberegneren på siden for en præcis pris til din opgave.`;
  }

  function buildServicesAnswer() {
    return "Vi tilbyder: " + services.list.map(s => s.title).join(", ") + ".";
  }

  function buildContactAnswer() {
    return `Du kan kontakte os på telefon ${company.phone}, sms ${company.sms} eller mail ${company.email}.`;
  }

  function buildAreasAnswer() {
    return "Vi dækker følgende områder: " + company.serviceAreas.join(", ") + ".";
  }

  function buildHoursAnswer() {
    const h = company.openingHours;
    return `Åbningstider:\nMan–tors: ${h.monday}\nFre: ${h.friday}\nLør–søn: ${h.saturday}`;
  }

  function buildBookingAnswer() {
    return "Du kan booke et tilbud direkte via kontaktformularen på siden, eller ringe/sende SMS til os, så vender vi hurtigt tilbage.";
  }

  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/pris|koste|kr\.|tilbud på|hvad koster/.test(t) && !/booke|aftale/.test(t)) return "prices";
    if (/ydelse|tilbyder|service|hvad laver|hvad kan i/.test(t)) return "services";
    if (/kontakt|telefon|ring|mail|email|nummer/.test(t)) return "contact";
    if (/område|dækker|kommune|by\b|vejle|kolding|jelling|egtved|børkop|brejning/.test(t)) return "areas";
    if (/åben|åbningstid|hvornår.*åben|lukket/.test(t)) return "hours";
    if (/book|bestil|aftale|tilbud(?!.*pris)/.test(t)) return "booking";
    return null;
  }

  function respondToIntent(intent) {
    switch (intent) {
      case "prices": addMessage(buildPricesAnswer(), "bot"); break;
      case "services": addMessage(buildServicesAnswer(), "bot"); break;
      case "contact": addMessage(buildContactAnswer(), "bot"); break;
      case "areas": addMessage(buildAreasAnswer(), "bot"); break;
      case "hours": addMessage(buildHoursAnswer(), "bot"); break;
      case "booking": addMessage(buildBookingAnswer(), "bot"); break;
      default: fallbackSuggestion();
    }
  }

  function handleUserText(text, forcedIntent) {
    addMessage(text, "user");
    const intent = forcedIntent || detectIntent(text);
    setTimeout(() => respondToIntent(intent), 280);
  }

  function initInputForm() {
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-text-input");
    if (!form || !input) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      handleUserText(text);
      input.value = "";
    });
  }

  function initToggle() {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const closeBtn = document.getElementById("chatbot-close");
    if (toggleBtn) toggleBtn.addEventListener("click", toggleChat);
    if (closeBtn) closeBtn.addEventListener("click", toggleChat);
  }

  function showWelcome() {
    addMessage(`Hej! 👋 Jeg er ${company.shortName}s assistent. Spørg mig om priser, ydelser, åbningstider eller serviceområder.`, "bot");
    addQuickActions([
      { label: "Priser", intent: "prices" },
      { label: "Ydelser", intent: "services" },
      { label: "Serviceområder", intent: "areas" },
      { label: "Book tilbud", intent: "booking" }
    ]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initToggle();
    initInputForm();
    showWelcome();
  });
})();
