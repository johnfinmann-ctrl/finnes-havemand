/**
 * ============================================================
 * PRICES.JS — Finnes Entreprise
 * Auto-version: 20260623
 * ============================================================
 * ALLE priser til ALLE 8 beregnere. Ingen priser må stå i
 * calculators.js — kun her. Moms beregnes separat (vat.rate).
 * ============================================================
 */

const prices = {
  vat: { rate: 0.25 }, // 25 % dansk moms

  // KØRSEL — fælles for alle beregnere
  travel: {
    enabled: true,
    zones: [
      { id: "zone0", label: "Vejle / Børkop / nærområde", fee: 0 },
      { id: "zone1", label: "0–15 km",  fee: 0 },
      { id: "zone2", label: "15–30 km", fee: 150 },
      { id: "zone3", label: "30+ km",   fee: null, afterAgreement: true }
    ],
    afterAgreementText: "Efter aftale"
  },

  // 1) GRÆSSLÅNING
  grass: {
    sqmRate:            1.25,  // kr./m²
    minimum:            350,   // minimumspris pr. besøg
    highGrassSurcharge: 200,   // tillæg, højt græs
    wasteRemoval:       150,   // bortkørsel af afklip
    subscriptionDiscount: 0.10 // 10 % ved fast aftale
  },

  // 2) HÆKKEKLIPNING
  hedge: {
    meterRate: 60,             // kr./løbende meter, under 2 m, én side
    heightSurcharge: {
      under2m:      0,
      between2and3m: 25,       // kr./m ekstra
      over3m:       55         // kr./m ekstra
    },
    bothSidesMultiplier: 1.8,  // begge sider (lille rabat ift. ×2)
    formClipSurcharge:   0.20, // 20 % ekstra ved formklip
    wasteRemoval:        400
  },

  // 3) MINIGRAVER
  excavator: {
    hourRate:     650,
    minimumHours: 2,
    taskTypeSurcharge: {
      udgravning:  0,
      planering:   0,
      fundament:   100, // kr./t
      draen:       150, // kr./t
      jordarbejde: 0
    },
    extraManHourRate: 350, // ekstra mand/time
    wasteRemoval:     850  // pr. læs
  },

  // 4) HAVEOPRYDNING
  cleanup: {
    hourRate:     450,   // kr./time
    minimum:      350,   // minimumspris
    bigJobSurcharge: 500, // tillæg ved større opgave (>6 t)
    bigJobHoursThreshold: 6,
    wasteRemoval: 400    // bortkørsel
  },

  // 5) JORDARBEJDE
  earthwork: {
    hourRate:      450,  // maskintid / håndkraft
    machineHourRate: 300, // maskintillæg pr. time
    wastePerLoad:  850,  // bortkørsel pr. læs
    travelSurcharge: 150 // kørselstillæg ud over nærområde (i stedet for zoner)
  },

  // 6) BELÆGNING
  paving: {
    sqmRate: {
      simple:  350,  // grus, stabilgrus
      normal:  550,  // fliser, brosten
      complex: 850   // natursten, mønster, svær form
    },
    preparationSurcharge: 0.25, // 25 % ekstra ved forberedelse inkl.
    materialsIncluded: {
      simple:  80,  // materialer pr. m² (skøn)
      normal:  180,
      complex: 350
    }
  },

  // 7) SOMMERHUSSERVICE
  summerhouse: {
    singleVisit:       650,   // enkeltbesøg
    openingClosing:    1200,  // åbning eller lukning af sæson
    inspectionVisit:   450,   // tilsynsbesøg
    monthlySubscription: {
      "1":  650,  // 1 besøg/md
      "2":  1100, // 2 besøg/md
      "4":  1800  // 4 besøg/md
    },
    subscriptionDiscount: 0.10 // 10 % rabat på fast aftale
  },

  // 8) FAST HAVEAFTALE
  subscription: {
    sqmRate:   0.95,  // kr./m² pr. besøg (lavere end enkeltbesøg)
    minimum:   300,   // minimum pr. besøg
    frequency: {
      weekly:   { label: "Hver uge",           multiplier: 4.3  },
      biweekly: { label: "Hver 14. dag",        multiplier: 2.15 },
      monthly:  { label: "1 gang om måneden",   multiplier: 1    }
    },
    seasonDiscount: { // rabat ved lang sæson
      "3":  0,     // 3 mdr.
      "6":  0.05,  // 5 % ved 6 mdr.
      "12": 0.10   // 10 % ved helårlig aftale
    }
  }
};

window.prices = prices;
