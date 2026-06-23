/**
 * ============================================================
 * CONTACT.JS — Finnes Entreprise
 * Auto-version: 20260623
 * ============================================================
 * STRATEGI:
 * 1) Primær: SMS / Ring — anbefales tydeligt i UI
 * 2) Sekundær: Formularen samler data → åbner mailto: som
 *    fallback. Billeder kan ikke vedhæftes via mailto, men
 *    brugeren vejledes til SMS i stedet.
 * ============================================================
 */

(function () {
  "use strict";

  /* ---------- Submit ---------- */
  function initFormSubmit() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name     = (form.querySelector("#cf-name")?.value || "").trim();
      const phone    = (form.querySelector("#cf-phone")?.value || "").trim();
      const mail     = (form.querySelector("#cf-mail")?.value || "").trim();
      const address  = (form.querySelector("#cf-address")?.value || "").trim();
      const zip      = (form.querySelector("#cf-zip")?.value || "").trim();
      const taskType = form.querySelector("#cf-task-type")?.value || "";
      const desc     = (form.querySelector("#cf-description")?.value || "").trim();
      const timing   = (form.querySelector("#cf-timing")?.value || "").trim();
      const hasPhotos= form.querySelector("#cf-has-photos")?.checked;

      if (!name || !phone || !desc) {
        showStatus("error", "Udfyld venligst navn, telefon og beskrivelse.");
        return;
      }

      const subject = encodeURIComponent(
        `Tilbudsforespørgsel — ${taskType || "Opgave"} (${name})`
      );

      const lines = [
        `Navn: ${name}`,
        `Telefon: ${phone}`,
        mail    ? `Mail: ${mail}` : null,
        address ? `Adresse: ${address}` : null,
        zip     ? `Postnummer: ${zip}` : null,
        taskType ? `Opgavetype: ${taskType}` : null,
        timing  ? `Ønsket tidspunkt: ${timing}` : null,
        "",
        "Beskrivelse:",
        desc,
        "",
        hasPhotos
          ? `OBS: Kunden sender billeder via SMS til ${company.phone}.`
          : null
      ].filter(Boolean);

      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;

      showStatus(
        "success",
        "Din mail-app åbnes med oplysningerne udfyldt. " +
        (hasPhotos ? `Send billeder separat på SMS til ${company.phone}.` : "")
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

  /* ---------- SMS-hints: opdater data-sms links ---------- */
  function initSmsHints() {
    // Opdater alle .contact-sms-hint SMS-knapper med korrekt sms:-link
    document.querySelectorAll(".contact-sms-hint a[data-sms]").forEach(a => {
      a.href = `sms:${company.smsRaw}`;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFormSubmit();
    initSmsHints();
  });
})();
