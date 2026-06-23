/**
 * ============================================================
 * COMPANY.JS — Handyman Engine
 * ============================================================
 * Alle virksomhedsoplysninger samles her.
 * Skift kunde = udfyld denne fil. Rør ikke ved HTML/CSS/JS.
 * ============================================================
 */

const company = {
  // Grundlæggende identitet
  name: "Finnes Entreprise",
  tagline: "Professionel Have- og Graveservice",
  shortName: "Finnes Entreprise",

  // Branche (bruges af chatbot + SEO + ydelser)
  industry: "Havearbejde, entreprenør, minigraver og haveservice",

  // Kontakt
  phone: "40 13 73 70",
  phoneRaw: "+4540137370", // til tel:/sms: links — ingen mellemrum
  sms: "40 13 73 70",
  smsRaw: "+4540137370",
  email: "finmann1@gmail.com",

  // Virksomhedsoplysninger
  cvr: "46557557",
  vatRegistered: true,
  address: {
    street: "", // udfyldes pr. kunde
    zip: "",
    city: "",
    full: "" // bruges i Schema.org + footer, hvis udfyldt
  },

  // Åbningstider (bruges af chatbot)
  openingHours: {
    monday: "07:00–16:00",
    tuesday: "07:00–16:00",
    wednesday: "07:00–16:00",
    thursday: "07:00–16:00",
    friday: "07:00–15:00",
    saturday: "Lukket",
    sunday: "Lukket"
  },

  // Serviceområder (bruges til kort + SEO + chatbot)
  serviceAreas: ["Vejle", "Børkop", "Brejning", "Egtved", "Jelling", "Kolding"],

  // Social / eksterne links (valgfrit, tomt = skjules automatisk)
  social: {
    facebook: "",
    instagram: ""
  },

  // Bruges i footer + manifest + meta tags
  founded: "2024",
  legalForm: "Enkeltmandsvirksomhed"
};

// Eksporter til brug i andre moduler (uden bundler — global namespace)
window.company = company;
