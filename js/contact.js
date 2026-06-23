/**
 * ============================================================
 * CONTACT.JS — Finnes Entreprise v5
 * Auto-version: 20260623
 * ============================================================
 * Formular → mailto: som fallback.
 * Billeder sendes ALTID via SMS — aldrig vedhæftet via mail.
 * Primær handling: Ring / SMS.
 * ============================================================
 */
(function () {
  "use strict";

  function initFormSubmit() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name     = (form.querySelector("#cf-name")?.value     || "").trim();
      const phone    = (form.querySelector("#cf-phone")?.value    || "").trim();
      const mail     = (form.querySelector("#cf-mail")?.value     || "").trim();
      const address  = (form.querySelector("#cf-address")?.value  || "").trim();
      const zip      = (form.querySelector("#cf-zip")?.value      || "").trim();
      const taskType = form.querySelector("#cf-task-type")?.value  || "";
      const desc     = (form.querySelector("#cf-description")?.value || "").trim();
      const timing   = (form.querySelector("#cf-timing")?.value   || "").trim();
      const hasPhotos= form.querySelector("#cf-has-photos")?.checked;

      if (!name || !phone || !desc) {
        showStatus("error", "Udfyld venligst navn, telefon og beskrivelse af opgaven.");
        return;
      }

      const subject = encodeURIComponent(
        `Tilbudsforespørgsel — ${taskType || "Opgave"} (${name})`
      );

      const lines = [
        `Navn: ${name}`,
        `Telefon: ${phone}`,
        mail    ? `Mail: ${mail}`             : null,
        address ? `Adresse: ${address}`       : null,
        zip     ? `Postnummer: ${zip}`        : null,
        taskType ? `Opgavetype: ${taskType}`  : null,
        timing  ? `Ønsket tidspunkt: ${timing}` : null,
        "",
        "Beskrivelse:",
        desc,
        "",
        hasPhotos
          ? `OBS: Kunden sender billeder via SMS til ${company.phone}.`
          : null
      ].filter(x => x !== null);

      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;

      showStatus(
        "success",
        hasPhotos
          ? `📬 Mail-app åbnes. Husk at sende billeder på SMS til ${company.phone} bagefter.`
          : "📬 Mail-app åbnes med din forespørgsel udfyldt."
      );
    });
  }

  function showStatus(type, msg) {
    const el = document.getElementById("form-status");
    if (!el) return;
    el.className = `form-status ${type}`;
    el.textContent = msg;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* Opdater SMS-knapper i formularen med korrekt sms:-link */
  function initFormSmsLinks() {
    document.querySelectorAll(".contact-sms-hint a[data-sms], .photo-sms-btn[data-sms]").forEach(a => {
      if (a.href === "#" || !a.href.startsWith("sms:")) {
        a.href = `sms:${company.smsRaw || company.phoneRaw}`;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFormSubmit();
    initFormSmsLinks();
  });
})();
