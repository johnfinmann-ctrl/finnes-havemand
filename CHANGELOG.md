# CHANGELOG — Finnes Entreprise Handyman Engine

## V4 — Release (2026-06-21)

### Nye funktioner

- **App-lignende forside**: kort startmenu med logo, intro, tre CTA-knapper (Ring/SMS/Få tilbud) og 10 store ikonknapper. Ingen lang scrolling — al indhold passer inden for én skærm på almindelige mobiltelefoner uden scroll.
- **10-ikon hovedmenu**: Græsslåning, Hækkeklipning, Minigraver, Trampolin, Beskæring, Bortkørsel, Prisberegner, Galleri, Om os, Kontakt. Beregner-ikonerne åbner direkte det relevante faneblad i prisberegneren; Beskæring/Bortkørsel scroller til deres servicekort.
- **App-flow-navigation**: hvert hovedområde er et selvstændigt "view" med fast tilbage-knap til forsiden. Browserens fysiske tilbage-knap virker også korrekt (History API).
- **Kørsel/transport i alle 5 prisberegnere**: dropdown med konfigurerbare zoner (nærområde, 0–15 km, 15–30 km, 30+ km "efter aftale"). Vises som selvstændig linje i kvitteringen: Opgavepris + Tillæg + Kørsel + Moms = Samlet vejledende pris. 100% styret fra config/prices.js.
- **Admin Lite**: nyt PIN-låst panel (js/admin.js, css/admin.css) der lader kunden redigere firmanavn, logo (forsidebillede), telefon, SMS, mail, CVR, åbningstider, serviceområder, tekster, farver, priser og kørselszoner — alt sammen uden kodeadgang. Gemmes som et localStorage-overlay oven på fabriksindstillingerne; "Nulstil"-knap gendanner originalen.
- **Skærpet SEO**: tilføjet robots-meta, Twitter Card-tags, udvidet Schema.org LocalBusiness-data (billede, @id), og og:image-dimensioner.
- **Opdateret PWA-cache**: service worker cacher nu også admin.js/admin.css; cache-version bumpet til v4, så returnerende besøgende automatisk får den nye struktur.

### Rettede fejl

- **Kritisk: forsiden krævede op til 209px scrolling** på almindelige mobilskærme (iPhone 14) — direkte i modstrid med kravet om en kort, app-lignende forside uden lang scrolling. Rodårsag: min-height: 100vh på forside-containeren kombineret med margin-top: auto på footer-noten skabte unødvendig tom plads. Rettet ved at fjerne den tvungne min-height og kompaktere ikonmenuens padding/skriftstørrelser (3 kolonner på mobil i stedet for 2). Verificeret 0px overflow på 5 enhedsstørrelser fra iPhone SE til iPad.
- **Admin Lite kørsels-redigering kunne ødelægge prisberegnerne**: det generiske felt-til-objekt-system ville have lavet prices.travel.zones (et array) om til et almindeligt objekt med numeriske nøgler ved gem, hvilket ville have knækket .find()-opslag i js/calculators.js. Fanget under testning, før det nåede produktion. Rettet med dedikeret, id-baseret zone-håndtering der bevarer korrekt array-struktur. Verificeret med automatiserede tests (5/5 PASS).
- **Død kode fjernet**: ca. 100 linjer ubrugt CSS fra den oprindelige scroll-side-arkitektur (.site-header, .main-nav, .nav-toggle, hele .hero-familien) fjernet fra style.css og responsive.css efter automatiseret selector-brugs-analyse. Disse var rester fra V1/V2's sticky-header-design, som blev erstattet af app-flow-navigationen i V3, men aldrig ryddet op.
- **Excavator-beregnerens "Bortkørsel"-felt omdøbt til "Jord væk"** for at matche brief-terminologi præcist og fjerne tvetydighed.

### Kvalitetstest gennemført

70 automatiserede browser-tests kørt i ægte Chromium via Playwright — 70/70 PASS:
- 53 funktionelle tests: navigation, alle 5 beregnere + kørsel, galleri/lightbox, kontaktformular, kontaktknapper (mobil/desktop), chatbot, fuld Admin Lite-rundtur (PIN, redigering, gem, reload-persistens, nulstilling).
- 17 kvalitetstests: performance (load-tid, ressourcevægt), SEO (title/meta/canonical/Schema.org/lang), alle navigationslinks, responsivt design på 5 skærmstørrelser (320px–1280px) uden horisontal scroll.

### Kendte begrænsninger

- Kontaktformularen har ingen backend (mailto:-baseret, billeder skal vedhæftes manuelt af brugeren).
- Admin Lite-ændringer er lokale for browseren/enheden, de blev foretaget på — ingen central synkronisering uden en rigtig backend.
- Chatbotten er regelbaseret, ikke AI-drevet.
- Kørselszoner vælges manuelt via dropdown — ingen automatisk postnummer-/GPS-baseret afstandsberegning.
- Ægte Safari/WebKit-browsertest kunne ikke gennemføres i udviklingsmiljøet (kun Chromium-baseret automatiseret test var teknisk muligt). Chrome og Edge er dækket (samme rendering-motor), men Safari/iOS bør testes manuelt på en rigtig enhed før launch, særligt for tel:/sms:-links og PWA-installation.
- Logo-filnavne (finnes-entreprise-mark.png osv.) er ikke parametriserede i config — ved branche-genbrug skal de fysiske filer erstattes med samme filnavn, eller referencerne i index.html/pwa/manifest.json opdateres.

### Forslag til V5

- Server-side Admin (rigtig backend + database), så prisændringer synkroniserer på tværs af enheder og besøgende ser opdaterede priser med det samme, uden at hver besøgende skal have lavet sine egne localStorage-overrides.
- Automatisk kørsel-/afstandsberegning via postnummer-opslag eller Google Maps Distance Matrix API, som erstatning for manuel zone-dropdown.
- Flersproget support (dansk/engelsk) til kunder med internationale kunder (sommerhusudlejere, expats).
- Bookingkalender-integration så "Få tilbud" kan blive til en reel tidsbestilling med kalendervisning af ledige tider.
- Billede-komprimering ved upload i kontaktformularen og Admin Lite's forsidebillede-upload, så store mobilfotos ikke fylder unødigt.
- Multi-tenant konfiguration: én kodebase, flere config-mapper valgt via URL-parameter eller subdomæne, så flere branche-varianter kan hostes fra samme deploy.
- Lighthouse-baseret CI-test: automatiseret performance/SEO/tilgængeligheds-scoring ved hver commit, så regressioner fanges tidligt.

---

## V3 — App-flow-ombygning

- Omstrukturerede fra lang scroll-side til app-flow: kort forside med ikonmenu, separate views med tilbage-knap.
- Tilføjede kørsel/transport til alle 5 prisberegnere (første version, før V4's UX-finpudsning).
- Rettede firmanavn fra forkert "FINNES HAVEMAND" til korrekt "Finnes Entreprise".
- Kontaktknapper gjort enhedsbevidste: mobil bruger tel:/sms:, desktop kopierer til udklipsholder med bekræftelse.

## V2 — Branding og mappestruktur-genopretning

- Genopbyggede ødelagt GitHub-mappestruktur fra V1.
- Skiftede branding til "Finnes Entreprise" (senere rettet i V3).
- Tilføjede rigtige logo- og produktbilleder, genererede PWA-ikoner og branded pladsholderbilleder, så assets-mapperne aldrig var tomme.

## V1 — Første version

- Oprindelig "Handyman Engine"-arkitektur med config/css/js-modulopdeling.
- 5 fuldt funktionelle prisberegnere (græs, hæk, minigraver, trampolin, fast haveservice).
- PWA-grundlag (manifest, service worker), SEO-grundlag (Schema.org, sitemap, robots.txt).
- Regelbaseret chatbot, galleri med lightbox, kontaktformular med billede-upload.
