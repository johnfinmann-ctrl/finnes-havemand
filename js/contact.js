/**
 * ============================================================
 * CONTACT.JS — Finnes Entreprise v5
 * Auto-version: 20260623
 * ============================================================
 * Foto-upload:
 *  - Maks. 3 billeder
 *  - accept="image/*" UDEN capture → kamera + galleri på iPhone
 *  - FileReader preview med slet-knap på hvert billede
 *  - Ærlig besked: billeder kan ikke uploades automatisk via
 *    GitHub Pages — sendes via SMS eller vedhæftes i mail
 * ============================================================
 */
(function () {
  "use strict";

  const MAX_PHOTOS = 3;
  let uploadedFiles = []; // global liste, deles mellem CTA og formular

  /* ══════════════════════════════════════════════
     1. RENDER PREVIEW MED SLET-KNAP
  ══════════════════════════════════════════════ */
  function renderPreview(files, container, onRemove) {
    if (!container) return;
    container.innerHTML = "";
    files.forEach((file, idx) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const wrap = document.createElement("div");
        wrap.className = "preview-thumb";
        wrap.dataset.idx = idx;

        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = file.name;

        const del = document.createElement("button");
        del.type = "button";
        del.className = "preview-del";
        del.textContent = "✕";
        del.setAttribute("aria-label", "Fjern billede");
        del.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (typeof onRemove === "function") onRemove(idx);
        });

        wrap.appendChild(img);
        wrap.appendChild(del);
        container.appendChild(wrap);
      };
      reader.readAsDataURL(file);
    });
  }

  /* ══════════════════════════════════════════════
     2. OPDATÉR LABELS OG HINT
  ══════════════════════════════════════════════ */
  function updateUI(files) {
    const count = files.length;

    // CTA-sektionens label
    const lbl = document.querySelector("#task-photo-zone .upload-label-text");
    if (lbl) {
      lbl.textContent = count > 0
        ? `${count} billede${count === 1 ? "" : "r"} valgt — tryk for at tilføje flere`
        : "Tag billeder til tilbud";
    }
    const sub = document.querySelector("#task-photo-zone .upload-sub");
    if (sub) sub.style.display = count > 0 ? "none" : "";

    // Tæller i hint
    document.querySelectorAll("#upload-count, #upload-count-form").forEach(el => {
      el.textContent = count;
    });

    // CTA hint-boks
    const hint = document.getElementById("upload-mail-hint");
    if (hint) hint.style.display = count > 0 ? "flex" : "none";

    // Formular note og zone-label
    const note = document.getElementById("upload-note");
    if (note) note.style.display = count > 0 ? "block" : "none";
    const fLbl = document.getElementById("upload-zone-label");
    if (fLbl) {
      fLbl.textContent = count > 0
        ? `${count} billede${count === 1 ? "" : "r"} valgt (maks. ${MAX_PHOTOS})`
        : `Tryk for at vælge billeder (maks. ${MAX_PHOTOS})`;
    }
  }

  /* ══════════════════════════════════════════════
     3. FJERN ET BILLEDE
  ══════════════════════════════════════════════ */
  function removeFile(idx) {
    uploadedFiles.splice(idx, 1);
    // Re-render begge preview-containere
    renderPreview(uploadedFiles, document.getElementById("task-photo-preview"), removeFile);
    renderPreview(uploadedFiles, document.getElementById("upload-preview"),      removeFile);
    updateUI(uploadedFiles);
  }

  /* ══════════════════════════════════════════════
     4. CTA: "Tag billeder til tilbud" — i prisberegner-view
  ══════════════════════════════════════════════ */
  function initTaskPhotoCTA() {
    const zone  = document.getElementById("task-photo-zone");
    const input = document.getElementById("task-photo-input");
    if (!zone || !input) return;

    // Klik på zone → åbn fil-dialog
    zone.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
      const newFiles = Array.from(input.files);
      // Tilføj til eksisterende (men max MAX_PHOTOS total)
      newFiles.forEach(f => {
        if (uploadedFiles.length < MAX_PHOTOS) uploadedFiles.push(f);
      });
      input.value = ""; // nulstil input så samme fil kan vælges igen

      const prev = document.getElementById("task-photo-preview");
      const fPrev = document.getElementById("upload-preview");
      renderPreview(uploadedFiles, prev,  removeFile);
      renderPreview(uploadedFiles, fPrev, removeFile);
      updateUI(uploadedFiles);

      // Opdatér SMS/mail-knapper i hint-boksen
      const smsLink = document.querySelector("#upload-mail-hint a[data-sms]");
      if (smsLink) smsLink.href = `sms:${company.smsRaw || company.phoneRaw}`;
      const mailLink = document.querySelector("#upload-mail-hint a[data-mail]");
      if (mailLink) mailLink.href = `mailto:${company.email}`;
    });

    // Scroll-to logik: ikon-knap med data-scroll-to="task-photo-zone"
    document.querySelectorAll("[data-scroll-to='task-photo-zone']").forEach(btn => {
      btn.addEventListener("click", () => {
        // Navigér til prisberegner-view først
        if (window.AppNav) window.AppNav.goTo("prisberegner");
        setTimeout(() => {
          const el = document.getElementById("task-photo-zone");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      });
    });
  }

  /* ══════════════════════════════════════════════
     5. FORMULAR UPLOAD (direkte i kontakt-view)
  ══════════════════════════════════════════════ */
  function initFormUpload() {
    const zone  = document.getElementById("upload-zone-form");
    const input = document.getElementById("upload-input");
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
      const newFiles = Array.from(input.files);
      newFiles.forEach(f => {
        if (uploadedFiles.length < MAX_PHOTOS) uploadedFiles.push(f);
      });
      input.value = "";

      const prev  = document.getElementById("upload-preview");
      const cPrev = document.getElementById("task-photo-preview");
      renderPreview(uploadedFiles, prev,  removeFile);
      renderPreview(uploadedFiles, cPrev, removeFile);
      updateUI(uploadedFiles);
    });
  }

  /* ══════════════════════════════════════════════
     6. FORMULAR SUBMIT
  ══════════════════════════════════════════════ */
  function initFormSubmit() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name     = (form.querySelector("#cf-name")?.value      || "").trim();
      const phone    = (form.querySelector("#cf-phone")?.value     || "").trim();
      const mail     = (form.querySelector("#cf-mail")?.value      || "").trim();
      const address  = (form.querySelector("#cf-address")?.value   || "").trim();
      const zip      = (form.querySelector("#cf-zip")?.value       || "").trim();
      const taskType = form.querySelector("#cf-task-type")?.value  || "";
      const desc     = (form.querySelector("#cf-description")?.value || "").trim();
      const timing   = (form.querySelector("#cf-timing")?.value    || "").trim();

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
        mail     ? `Mail: ${mail}`              : null,
        address  ? `Adresse: ${address}`        : null,
        zip      ? `Postnummer: ${zip}`         : null,
        taskType ? `Opgavetype: ${taskType}`    : null,
        timing   ? `Ønsket tidspunkt: ${timing}`: null,
        "", "Beskrivelse:", desc, "",
        uploadedFiles.length > 0
          ? `Billeder: Kunden har valgt ${uploadedFiles.length} billede(r). HUSK at bede dem vedhæfte billederne i mailen — eller de sender dem på SMS til ${company.phone}.`
          : null
      ].filter(x => x !== null);

      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;

      const msg = uploadedFiles.length > 0
        ? `📬 Mail-appen åbnes. Bed kunden vedhæfte ${uploadedFiles.length} billede(r) — eller send dem på SMS til ${company.phone}.`
        : "📬 Mail-appen åbnes med din forespørgsel klar.";
      showStatus("success", msg);
    });
  }

  function showStatus(type, msg) {
    const el = document.getElementById("form-status");
    if (!el) return;
    el.className = `form-status ${type}`;
    el.textContent = msg;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ══════════════════════════════════════════════
     7. INIT
  ══════════════════════════════════════════════ */
  document.addEventListener("DOMContentLoaded", () => {
    initTaskPhotoCTA();
    initFormUpload();
    initFormSubmit();
  });

})();
