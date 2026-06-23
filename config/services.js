/**
 * ============================================================
 * SERVICES.JS — Handyman Engine
 * ============================================================
 * Indhold til "Vores ydelser", galleri, anmeldelser og
 * "Hvorfor vælge os". Tekst kan frit redigeres her uden at
 * røre HTML.
 * ============================================================
 */

const services = {
  list: [
    {
      id: "graesslaaning",
      icon: "🌱",
      title: "Græsslåning",
      description: "Regelmæssig eller enkeltstående slåning — pænt og ensartet hver gang.",
      hasCalculator: true,
      calculatorId: "calc-grass"
    },
    {
      id: "haekkeklipning",
      icon: "✂️",
      title: "Hækkeklipning",
      description: "Lige kanter og sunde hække, uanset højde eller længde.",
      hasCalculator: true,
      calculatorId: "calc-hedge"
    },
    {
      id: "minigraver",
      icon: "🚜",
      title: "Minigraver",
      description: "Udgravning, planering, fundament og dræn — kompakt maskine, stor effekt.",
      hasCalculator: true,
      calculatorId: "calc-excavator"
    },
    {
      id: "beskaering",
      icon: "🌳",
      title: "Beskæring",
      description: "Træer og buske beskæres sikkert og fagligt korrekt.",
      hasCalculator: false
    },
    {
      id: "stubfraesning",
      icon: "🪵",
      title: "Stubfræsning",
      description: "Vi fjerner generende træstubbe, så haven kan bruges fuldt ud igen.",
      hasCalculator: false
    },
    {
      id: "bortkoersel",
      icon: "🚛",
      title: "Bortkørsel",
      description: "Affald, jord og haveaffald køres bort — du slipper for besværet.",
      hasCalculator: false
    },
    {
      id: "trampolin",
      icon: "🤸",
      title: "Nedgravning af trampolin",
      description: "Sikker og solid nedgravning, så trampolinen sidder i plan med jorden.",
      hasCalculator: true,
      calculatorId: "calc-trampoline"
    },
    {
      id: "belaegning",
      icon: "🧱",
      title: "Belægningsarbejde",
      description: "Fliser, indkørsler og terrasser anlagt med præcision.",
      hasCalculator: false
    },
    {
      id: "jordarbejde",
      icon: "⛏️",
      title: "Jordarbejde",
      description: "Fra mindre opgaver til større anlægsprojekter.",
      hasCalculator: false
    },
    {
      id: "fast-haveservice",
      icon: "📅",
      title: "Fast haveservice",
      description: "Lad os holde haven året rundt — du vælger frekvensen.",
      hasCalculator: true,
      calculatorId: "calc-subscription"
    }
  ],

  whyUs: [
    { icon: "📍", title: "Lokalt firma", text: "Vi kender området og er hurtigt fremme." },
    { icon: "🛠️", title: "Professionelt arbejde", text: "Ordentligt håndværk hver gang." },
    { icon: "💰", title: "Konkurrencedygtige priser", text: "Gennemskuelige priser — ingen overraskelser." },
    { icon: "📩", title: "Gratis tilbud", text: "Send din opgave — du får et uforpligtende tilbud." }
  ],

  customerTypes: ["Privat", "Erhverv", "Sommerhuse"],

  reviews: [
    {
      name: "Anne M.",
      location: "Vejle",
      rating: 5,
      text: "Hurtig, præcis og meget pæn afslutning på haven. Kan varmt anbefales."
    },
    {
      name: "Peter S.",
      location: "Kolding",
      rating: 5,
      text: "Fik gravet ud til ny indkørsel — professionelt fra start til slut."
    },
    {
      name: "Mette K.",
      location: "Jelling",
      rating: 5,
      text: "Fast aftale om græsslåning hver uge. Aldrig noget at klage over."
    }
  ],

  // Galleri — minigraver er et rigtigt produktbillede; øvrige er branded
  // pladsholdere indtil kunden leverer rigtige før/efter-billeder.
  gallery: [
    { src: "assets/gallery/graesslaaning-placeholder.jpg", alt: "Græsslåning", category: "Græs" },
    { src: "assets/gallery/haekkeklipning-placeholder.jpg", alt: "Hækkeklipning", category: "Hæk" },
    { src: "assets/gallery/minigraver-kobelco-sk10sr.jpg", alt: "Minigraver i arbejde", category: "Minigraver" },
    { src: "assets/gallery/trampolin-placeholder.jpg", alt: "Trampolin gravet ned", category: "Trampolin" },
    { src: "assets/gallery/belaegning-placeholder.jpg", alt: "Belægningsarbejde", category: "Belægning" },
    { src: "assets/gallery/haveservice-placeholder.jpg", alt: "Færdig have", category: "Haveservice" }
  ],

  about: {
    heading: "Om os",
    text: "Vi er et lokalt firma med fokus på ordentligt håndværk, kvalitet og pålidelighed. Uanset om opgaven er stor eller lille, går vi efter samme mål: et resultat du er tilfreds med, leveret til tiden."
  }
};

window.services = services;
