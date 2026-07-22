# Pagrindinio puslapio premium redizainas

Didelės apimties darbas — perdarome visą `/` puslapį pagal naują struktūrą. Siūlau padalinti į etapus, kad galėtum peržiūrėti kiekvieną prieš judant toliau.

## Etapas 1 — Hero sekcija (pirmiausia)

**Turinys**
- Maža eilutė: „Vietinė automobilių nuoma Druskininkuose"
- H1: „Automobilių nuoma Druskininkuose be siurprizų"
- Aprašymas + CTA „Rasti laisvą automobilį"
- Antrinis: „Skubiai reikia automobilio? Skambinti" (tel. linkas)

**Rezervacijos paieškos forma (hero viduje)**
- Atsiėmimo vieta / data / laikas
- Grąžinimo vieta / data / laikas
- Mygtukas „Rasti automobilį"
- Reikšmės išsaugomos `sessionStorage` + perduodamos į `/automobiliai` per URL query (`?pickup=...&return=...&pickupTime=...`)
- `Cars.tsx` skaito query ir pritaiko datų filtrą

**Vizualas ir animacija**
- Placeholder struktūra video ciklui: `<video>` su `poster`, `webm` + `mp4` `<source>`, `muted autoplay loop playsInline preload="metadata"`
- Atskiras `<source media="(max-width: 768px)">` mobiliai versijai
- `prefers-reduced-motion`: rodomas tik `poster` vaizdas
- Video failai kol kas — vietinis lengvas placeholder (Druskininkų pušynas + Carbonus automobilis); struktūra leidžia vėliau lengvai pakeisti be kodo pakeitimų
- Tamsus gradient overlay užtikrina teksto kontrastą
- Lazy load: video nesustabdo formos ir teksto renderinimo

**Pasitikėjimo elementai** po formos: 4.9★ Google, „100+ patenkintų klientų", „Vietinė įmonė Druskininkuose", „Be paslėptų mokesčių"

## Etapas 2 — Kitos sekcijos

Po hero patvirtinimo, atskirai atnaujinsiu:

1. **Pasitikėjimo juosta** — 4 privalumai (Skaidri kaina / Patikrinti auto / Patogus perdavimas / Pagalba nuomos metu). Reikšmes laikysiu i18n faile (administruojama per translations).
2. **Automobiliai pagal datas** — perrašytas `Fleet` komponentas: jei URL yra datos → filtruoja tik laisvus, rodo pilną nuomos kainą + kainą/dieną kaip antrinę. Jei ne — rekomenduojami + CTA pasirinkti datas.
3. **Pasirinkimas pagal kelionę** — 4 naujos kortelės (Miestui / Šeimai / Verslui / Ilgai kelionei) → nukreipia į `/automobiliai` su iš anksto pritaikytu filtru (kategorija/sėdimų vietų sk.).
4. **„Kaip tai veikia"** — 3 žingsniai (patobulinsiu esamą `HowItWorks`).
5. **Atsiėmimas ir pristatymas** — nauja sekcija su Google Maps embed (Druskininkų adresas), darbo laiku, pristatymo teritorija. Pristatymo paslauga rodoma tik jei realiai teikiama (paprašysiu patvirtinimo).
6. **Sąlygų santrauka** — 6 blokai (Užstatas / Draudimas / Atsakomybė / Kilometražas / Kuras / Atšaukimas) su reikšmėmis iš i18n/config.
7. **Atsiliepimai** — pašalinu esamus `testimonials.tsx` išgalvotus, pridedu Supabase `reviews` lentelę (arba paslėpiu sekciją, kol nėra duomenų — pasakyk, kurį variantą nori).
8. **Kelionių gidas** — 3 naujausi blog įrašai iš esamos `blog_posts` lentelės.
9. **DUK** — 5–6 pagrindiniai klausimai (accordion) iš esamų FAQ.
10. **Galutinis CTA** — pakartota datų forma + „Rasti automobilį".

## Techniniai sprendimai

- **Dizaino sistema**: minėjai anksčiau ją ruošti atskirai. **Klausimas**: pradedu iškart nuo Hero (etapas 1) su esamais design tokens, ar pirmiausia atnaujinti globalius tokens (`index.css`, `tailwind.config.ts`) — premium spalvos, tipografijos skalė, tarpai?
- **Video placeholder**: sukursiu `<HeroMedia>` komponentą su aiškiai pažymėtais TODO kur įdėti tikrus failus (`/public/hero/carbonus.webm` + `.mp4` + `.jpg`).
- **Query state**: naudosiu `URLSearchParams` (be papildomų libų) + `BookingContext` update.
- **Realūs atsiliepimai**: reikia sprendimo — (a) sukurti `reviews` lentelę su admin CRUD ar (b) laikinai paslėpti sekciją.

## Ką siūlau daryti dabar

Pradėti **tik nuo Etapo 1 (Hero + paieškos forma + video placeholder struktūra + pasitikėjimo elementai)**. Po to peržiūri ir judam prie sekančių sekcijų viena po kitos, kad nebūtų viena milžiniška neaudituojama iteracija.

**Prieš pradedant patvirtink:**
1. Ar pradedu iškart Hero, ar pirma atnaujinti globalią dizaino sistemą?
2. Atsiliepimai — sukurti admin valdomą lentelę, ar laikinai paslėpti?
3. Pristatymas į viešbutį — ar realiai teikiate ir kokia kaina?
