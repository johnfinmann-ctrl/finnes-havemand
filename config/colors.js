/**
 * ============================================================
 * COLORS.JS — Handyman Engine
 * ============================================================
 * Designtokens. Skift disse for at re-brande hele sitet.
 * Værdierne skrives ind i CSS custom properties ved load
 * (se js/app.js -> applyTheme()), så hverken style.css eller
 * responsive.css skal røres ved kunde-skift.
 * ============================================================
 */

const colors = {
  // Kernepalette (fra kundens brief)
  primary: "#2E6F40",      // grøn — knapper, links, ikoner
  secondary: "#2F3437",    // antracit — tekst, header, footer
  accent: "#F28C28",       // orange — CTA-highlights, priser
  background: "#FFFFFF",   // hvid — sidebaggrund

  // Afledte toner (beregnet for konsistens — ikke nye valg)
  primaryDark: "#234F30",  // hover/active på primær
  primaryTint: "#EAF3EC",  // lyse kort-baggrunde, sektion-bands
  accentDark: "#C96F12",   // hover/active på accent
  surface: "#FAF9F7",      // let off-white til kort/paneler
  border: "#E4E1DA",       // hårfine kanter

  // Statusfarver (faste — bruges af kalkulatorer/formularer)
  success: "#2E6F40",
  warning: "#F28C28",
  error: "#C0392B",

  // Tekstfarver
  textPrimary: "#2F3437",
  textMuted: "#6B7270",
  textOnPrimary: "#FFFFFF",
  textOnDark: "#F5F3EE"
};

window.colors = colors;
