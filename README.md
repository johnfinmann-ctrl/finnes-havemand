# Finnes Entreprise — Handyman Engine V4

En professionel, genbrugelig hjemmeside/PWA-motor til håndværksvirksomheder. Denne instans er konfigureret til **Finnes Entreprise** (havearbejde, entreprenør, minigraver), men hele løsningen er bygget som en **motor**, der kan genbruges til andre brancher ved kun at ændre filer i `config/` og `assets/`.

App-flow: en kort startmenu med 10 store ikoner, der hver åbner en selvstændig "side" (view) med tilbage-knap — ikke en lang scroll-side. Alle priser styres fra én fil. Et indbygget Admin Lite-panel lader kunden selv redigere centrale indstillinger uden at skulle røre kode.

---

## Indholdsfortegnelse

1. [Hurtig start / installation](#hurtig-start--installation)
2. [Deploy til GitHub Pages](#deploy-til-github-pages)
3. [Deploy til Netlify](#deploy-til-netlify)
4. [Mappestruktur](#mappestruktur)
5. [Sådan ændrer du logo](#sådan-ændrer-du-logo)
6. [Sådan ændrer du priser](#sådan-ændrer-du-priser)
7. [Sådan ændrer du farver](#sådan-ændrer-du-farver)
8. [Sådan ændrer du ydelser](#sådan-ændrer-du-ydelser)
9. [Sådan ændrer du kontaktoplysninger](#sådan-ændrer-du-kontaktoplysninger)
10. [Admin Lite](#admin-lite)
11. [Genbrug motoren til andre brancher](#genbrug-motoren-til-andre-brancher)
12. [Kørsel/transport i beregnerne](#kørseltransport-i-beregnerne)
13. [Test før launch](#test-før-launch)
14. [Kendte begrænsninger](#kendte-begrænsninger)

---

## Hurtig start / installation

Løsningen er **ren HTML/CSS/JavaScript** — ingen build-step, ingen npm install, ingen server-side kode nødvendig.

**For at se siden lokalt:**

```bash
cd Finnes-Entreprise-Engine-V4
python3 -m http.server 8080
# Åbn http://localhost:8080/index.html i browseren
```

Eller åbn `index.html` direkte i browseren (de fleste funktioner virker, men service worker/PWA-installation kræver en rigtig server pga. browser-sikkerhedsregler for `file://`).

---

## Deploy til GitHub Pages

1. Opret et nyt repository på GitHub (eller brug et eksisterende).
2. Push **hele mappen** `Finnes-Entreprise-Engine-V4/` til repoets rod — ikke kun `index.html`:
   ```bash
   git init
   git add .
   git commit -m "Finnes Entreprise — Handyman Engine V4"
   git branch -M main
   git remote add origin https://github.com/DIT-BRUGERNAVN/DIT-REPO.git
   git push -u origin main
   ```
3. Gå til repoets **Settings → Pages**.
4. Under "Build and deployment": vælg **Deploy from a branch**, branch **main**, mappe **/ (root)**.
5. Gem. Siden er typisk tilgængelig efter 1-2 minutter på `https://dit-brugernavn.github.io/dit-repo/`.

**Vigtigt:** Tjek at `index.html` ligger direkte i repo-roden (ikke i en undermappe), ellers virker de relative sti-referencer til `assets/`, `css/`, `js/` ikke.

---

## Deploy til Netlify

**Metode A — Drag & drop (hurtigst):**
1. Gå til [app.netlify.com/drop](https://app.netlify.com/drop).
2. Træk hele `Finnes-Entreprise-Engine-V4`-mappen ind i browservinduet.
3. Netlify deployer øjeblikkeligt og giver en URL (`tilfældigt-navn.netlify.app`).
4. Omdøb sitet under **Site settings → Change site name**, eller tilknyt eget domæne.

**Metode B — Git-integration (anbefalet til løbende opdateringer):**
1. Push projektet til GitHub (se ovenfor).
2. I Netlify: **Add new site → Import an existing project**.
3. Vælg GitHub-repoet.
4. Build command: lad stå **tom** (ingen build nødvendig).
5. Publish directory: **/** (roden).
6. Deploy.

---

## Mappestruktur

```
Finnes-Entreprise-Engine-V4/
├── assets/
│   ├── images/       → hero-baggrund, OG-cover, øvrige generelle billeder
│   ├── icons/         → PWA-ikoner (192/512, almindelig + maskable, favicon, apple-touch)
│   ├── logo/           → logo (mark + fuld variant), transparent baggrund
│   └── gallery/          → galleribilleder (foto + branded pladsholdere)
├── css/
│   ├── style.css          → kernedesign, layout, komponenter, knapper
│   ├── calculator.css       → "kvittering"-design til prisberegnere
│   ├── app-views.css          → app-flow (startmenu, views, tilbage-knap, toast)
│   ├── admin.css                → Admin Lite-panelets udseende
│   └── responsive.css             → mobil/tablet-justeringer pr. breakpoint
├── js/
│   ├── admin.js              → Admin Lite: PIN-lås, localStorage-overrides, redigeringsformular
│   ├── app.js                  → tema, app-navigation (views), kontaktknap-logik, render af indhold
│   ├── calculators.js            → al prisberegningslogik inkl. kørsel (læser KUN config/prices.js)
│   ├── ui.js                       → kort, scroll-reveal
│   ├── gallery.js                    → galleri + lightbox
│   ├── chatbot.js                      → regelbaseret chatbot
│   └── contact.js                        → kontaktformular + billede-upload
├── config/
│   ├── company.js     → navn, kontakt, CVR, åbningstider, serviceområder
│   ├── colors.js        → designtokens (farver)
│   ├── prices.js          → ALLE priser til beregnerne, inkl. kørsel/travel
│   └── services.js          → ydelseskort, anmeldelser, galleri, "hvorfor os"
├── pwa/
│   ├── manifest.json    → PWA-installation
│   └── sw.js               → service worker (offline-cache)
├── seo/
│   ├── robots.txt
│   └── sitemap.xml
├── index.html          → eneste HTML-fil, trækker alt fra config/css/js
├── README.md            → denne fil
└── CHANGELOG.md           → versionshistorik
```

**Tommelfingerregel:** Du skal næsten aldrig redigere `index.html`, `css/` eller `js/` for at tilpasse løsningen til en ny kunde — alt indhold styres fra `config/`.

---

## Sådan ændrer du logo

1. Læg dit nye logo i `assets/logo/` — gerne PNG med transparent baggrund.
2. Erstat filerne der allerede refereres:
   - `assets/logo/finnes-entreprise-mark.png` — bruges i header/forside (vises lille, ca. 40-76px)
   - `assets/logo/finnes-entreprise-logo-full.png` — det fulde logo med tekst (holdes klar til fremtidig brug)
3. Generér nye PWA-ikoner fra dit logo i størrelserne: 192x192, 512x512, en maskable-variant af hver (med ca. 70% sikkerhedsmargin), favicon.ico, og apple-touch-icon.png (180x180). Læg dem i `assets/icons/` med samme filnavne som de eksisterende, så `index.html` og `pwa/manifest.json` ikke skal redigeres.
4. **Alternativ uden filudskiftning:** Brug Admin Lite (se nedenfor) til at uploade et nyt forsidebillede direkte fra browseren — det kræver ingen kodeadgang.

---

## Sådan ændrer du priser

**Alt prisrelateret ligger udelukkende i `config/prices.js`.** Ingen priser er hardkodede i HTML eller i beregningslogikken (`js/calculators.js`).

```js
// config/prices.js
const prices = {
  vat: { rate: 0.25 },              // moms, 0.25 = 25%

  grass: {
    sqmRate: 1.25,                  // kr. pr. m²
    minimum: 350,                   // minimumspris pr. besøg
    highGrassSurcharge: 200,
    wasteRemoval: 150,
    subscriptionDiscount: 0.10      // 10% rabat ved fast aftale
  },

  hedge: { meterRate: 60 },
  excavator: { hourRate: 650 },
  trampoline: { d300: 3500, d360: 4500, d430: 5500 },
  subscription: { sqmRate: 0.95 },

  travel: {
    enabled: true,
    zones: [
      { id: "zone0", label: "Vejle / Børkop / nærområde", fee: 0 },
      { id: "zone1", label: "0–15 km", fee: 0 },
      { id: "zone2", label: "15–30 km", fee: 150 },
      { id: "zone3", label: "30+ km", fee: null, afterAgreement: true }
    ],
    afterAgreementText: "Efter aftale"
  }
};
```

Gem filen, genindlæs siden — alle 5 beregnere opdaterer sig automatisk. **Ingen anden fil skal røres.**

**Alternativ uden kodeadgang:** Admin Lite har et fuldt prisredigerings-panel (se nedenfor) til de samme felter.

---

## Sådan ændrer du farver

Alt farvedesign styres fra `config/colors.js`:

```js
const colors = {
  primary: "#2E6F40",      // grøn — knapper, links, ikoner
  secondary: "#2F3437",    // antracit — tekst, header, footer
  accent: "#F28C28",       // orange — CTA-highlights, priser
  background: "#FFFFFF",   // hvid — sidebaggrund
  // ... afledte toner beregnes automatisk i samme fil
};
```

Skift de 4 hovedfarver (primary, secondary, accent, background) — de afledte toner (hover-farver, lyse baggrunde osv.) er allerede sat op til at fungere godt med enhver fornuftig farvekombination. Værdierne skrives ind som CSS custom properties ved sideload (`js/app.js` → `applyTheme()`), så hverken `style.css` eller andre stylesheets skal røres.

**Alternativ uden kodeadgang:** Admin Lite har 3 farve-vælgere (primær/sekundær/accent) indbygget.

---

## Sådan ændrer du ydelser

Ydelseskort, anmeldelser, galleri og "hvorfor vælge os" styres fra `config/services.js`:

```js
const services = {
  list: [
    {
      id: "graesslaaning",
      icon: "🌱",
      title: "Græsslåning",
      description: "Regelmæssig eller enkeltstående slåning...",
      hasCalculator: true,
      calculatorId: "calc-grass"
    }
    // ... flere ydelser
  ],
  reviews: [ /* tre anmeldelser med navn, lokation, rating, tekst */ ],
  gallery: [ /* billed-stier, alt-tekst, kategori */ ],
  whyUs: [ /* fire USP'er med ikon + tekst */ ]
};
```

For at **tilføje en ny ydelse uden beregner**: tilføj et nyt objekt til `list`-arrayet med `hasCalculator: false` — det vises automatisk som et kort i Ydelser-viewet.

For at **tilføje en ny ydelse MED beregner** kræver det desuden en ny `calc-panel` i `index.html` og tilsvarende beregningsfunktion i `js/calculators.js` — dette er den eneste tilpasning, der ikke er ren konfiguration, da hver beregner har unik logik.

---

## Sådan ændrer du kontaktoplysninger

Alt kontaktrelateret ligger i `config/company.js`:

```js
const company = {
  name: "Finnes Entreprise",
  tagline: "Professionel Have- og Graveservice",
  phone: "40 13 73 70",
  phoneRaw: "+4540137370",     // bruges til tel:-links — ingen mellemrum
  sms: "40 13 73 70",
  smsRaw: "+4540137370",
  email: "finmann1@gmail.com",
  cvr: "46557557",
  vatRegistered: true,
  openingHours: { monday: "07:00–16:00" },
  serviceAreas: ["Vejle", "Børkop", "Brejning", "Egtved", "Jelling", "Kolding"]
};
```

Gem og genindlæs — alle kontaktknapper, footer, kontaktformularens forudfyldte mail-adresse og chatbottens svar opdateres automatisk.

**Alternativ uden kodeadgang:** Admin Lite redigerer de samme felter direkte fra browseren.

---

## Admin Lite

Et indbygget, PIN-låst panel der lader ikke-tekniske brugere redigere centrale indstillinger uden at åbne en kodeeditor.

**Sådan åbnes panelet:**
- Tryk **5 gange** på firmanavnet i footeren (nederst i Kontakt-viewet).
- Eller besøg siden med `?admin=1` i URL'en (fx `index.html?admin=1`).

**Standard-PIN:** `1234` — kan ændres direkte i panelet under "Adgangskode til Admin".

**Admin Lite kan redigere:**
- Firmanavn, telefon, SMS, mail, CVR
- Åbningstider (man–tors, fredag, weekend)
- Serviceområder
- Tagline/forside-tekst
- Farver (primær, sekundær, accent)
- Forsidebillede (upload direkte fra enheden)
- Alle priser i alle 5 beregnere
- Kørselszoner (kr.-beløb pr. zone)
- Momssats

**Teknisk:** Ændringer gemmes i browserens localStorage som et "overlay" oven på fabriksindstillingerne i `config/*.js` — selve config-filerne ændres aldrig. Det betyder:
- Ingen database, ingen server, ingen backend nødvendig.
- Ændringer er lokale for den browser/enhed, hvor de blev foretaget — de synkroniserer ikke automatisk til andre enheder eller besøgende. (Til en fælles, server-side løsning kræves en rigtig backend — se "Kendte begrænsninger".)
- "Nulstil til fabriksindstillinger"-knappen sletter alle overrides og gendanner de oprindelige `config/*.js`-værdier.

---

## Genbrug motoren til andre brancher

Hele pointen med "Handyman Engine" er, at den kan genbruges til enhver håndværksvirksomhed — elektriker, tømrer, VVS, maler, anlægsgartner, rengøring, vinduespolering — ved kun at ændre:

| Hvad | Hvor |
|---|---|
| Logo | `assets/logo/` (se "Sådan ændrer du logo") |
| Farver | `config/colors.js` |
| Firmanavn/kontakt | `config/company.js` |
| Ydelser/ikonmenu | `config/services.js` + ikonmenuens 10 knapper i `index.html` (emoji + label + data-go-view) |
| Priser | `config/prices.js` |

**Eksempel — sådan laver du en VVS-version:**
1. Kopiér hele projektmappen til et nyt navn, fx `VVS-Engine-V1`.
2. Opdatér `config/company.js` med VVS-firmaets navn/kontakt.
3. Opdatér `config/colors.js` til VVS-firmaets brandfarver.
4. Erstat logo i `assets/logo/` og generér nye PWA-ikoner.
5. Omskriv `config/services.js`'s `list`-array til VVS-ydelser (fx "Vandskade", "Toiletinstallation", "Fjernvarmetjek").
6. Hvis VVS-firmaet skal have prisberegnere: definér priser i `config/prices.js`, og byg tilsvarende calc-panel-blokke i `index.html` + beregningsfunktioner i `js/calculators.js` (kopiér en eksisterende beregner som skabelon — fx `calcGrass()` er en god, simpel skabelon for "pris pr. enhed + tillæg + kørsel + moms").
7. Opdatér ikonmenuens 10 knapper i `index.html` til VVS-relevante ikoner/labels.
8. Opdatér `<title>`, meta-tags og Schema.org-blokken i `index.html`s `<head>` (kan ikke trækkes fra config, da det er rå HTML).
9. Opdatér `pwa/manifest.json` (name, short_name, theme_color).
10. Opdatér `seo/sitemap.xml` og `seo/robots.txt` med det nye domæne.

App-flow-navigationen, Admin Lite, kontaktknap-logikken (mobil/desktop), galleri-lightbox og service worker kræver ingen ændringer — de er allerede branche-uafhængige.

---

## Kørsel/transport i beregnerne

Styres 100% fra `config/prices.js` → `travel`. Kunden vælger område via dropdown i hver beregner. Alle 5 beregnere viser kørsel som selvstændig linje:

```
Opgavepris
+ Tillæg
+ Kørsel
+ Moms
= Samlet vejledende pris
```

- Tilføj/fjern/omdøb zoner frit i `travel.zones` — dropdown-menuerne genereres automatisk herfra.
- Sæt `fee: null` og `afterAgreement: true` på en zone for at vise en tekst ("Efter aftale") i stedet for et kr.-beløb — denne zone tæller ikke med i den beregnede total, da prisen ikke kendes på forhånd.
- Sæt `enabled: false` for at slå kørselsfeltet helt fra i alle beregnere.

---

## Test før launch

- Test ALTID på en rigtig GitHub Pages-URL eller Netlify-preview — ikke kun lokalt eller i en chat-preview-iframe.
- Test specifikt på Safari/iOS, da tel:/sms:/mailto:-links og PWA-installation kan opføre sig anderledes der end på Chrome/Android.
- Test PWA-installation: besøg siden på en mobil, og tjek at "Føj til hjemmeskærm"/installations-prompten dukker op.
- Test Admin Lite: åbn panelet (5 tryk på footer-logo), skift PIN, rediger et par felter, gem, genindlæs siden, og bekræft ændringerne slog igennem.
- Tjek konsollen for fejl efter at have udskiftet config-værdier.

---

## Kendte begrænsninger

- Kontaktformularen har ingen backend — den åbner en udfyldt mailto:-besked. Billeder kan ikke vedhæftes automatisk via mailto; brugeren bliver bedt om at vedhæfte dem manuelt.
- Admin Lite gemmer kun lokalt (localStorage) på den enhed/browser, hvor ændringen blev foretaget — det er ikke en central, server-synkroniseret løsning. Til det kræves en rigtig backend.
- Chatbotten er regelbaseret (ingen AI-API, ingen nøgle) — svarer på faste intents (priser/ydelser/kontakt/områder/åbningstider/booking) og foreslår ring/sms/mail ved tvivl.
- Kortet bruger en gratis OpenStreetMap-embed (ingen API-nøgle). Justér bbox/marker i `js/ui.js`, hvis kundens serviceområde ligger et andet sted i landet.
- Kørsels-zoner er manuelt valg via dropdown (den enkleste løsning). Automatisk postnummer-/afstandsberegning kan tilføjes som en fremtidig udvidelse.

Se `CHANGELOG.md` for komplet versionshistorik og forslag til kommende versioner.
