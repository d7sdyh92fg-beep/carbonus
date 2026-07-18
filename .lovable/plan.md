# Pagrindinio puslapio HERO atnaujinimas

Keičiame tik `src/components/sections/hero.tsx` ir susijusius vertimus/analitiką. Kitos puslapio dalys (Fleet, Features, HowItWorks, CTA, Footer) lieka nepaliestos.

## 1. Tekstas (LT + EN)

Atnaujinami `hero.*` raktai `src/i18n/translations.ts`:

- Žyma: „Jūsų kelionė prasideda Druskininkuose“ / „Your journey starts in Druskininkai“
- Antraštė (2 eilutės): „Daugiau laisvės“ / „kiekvienai kelionei.“
- Aprašymas: „Atraskite Druskininkus ir Lietuvą savo tempu. Pasirinkite tinkamą automobilį, o mes pristatysime jį ten, kur apsistojote.“
- Pagrindinis CTA: „Pradėti kelionę“
- Formos CTA: „Rodyti laisvus automobilius“
- Trust juosta po forma: „Realus laisvumas · Aiški kaina ir užstatas · Pristatymas Druskininkuose“

Pašalinami visi seni variantai („Kurkime prisiminimus…“, „Jūsų planai, mūsų automobilis“ ir kt.), jei dar likę raktuose.

## 2. Hero rezervacijos forma

Į hero įdedamas kompaktiškas paieškos blokas su:

- Atsiėmimo data (date input, `ref`, autoFocus taikinys)
- Grąžinimo data
- Mygtukas „Rodyti laisvus automobilius“

Elgsena:
- Submit → navigacija į `/automobiliai` su `?start=YYYY-MM-DD&end=YYYY-MM-DD` (Cars puslapis jau filtruoja pagal datas per `BookingContext`; perduosime datas per context prieš navigaciją).
- Datos validuojamos (start ≥ šiandien, end > start).

CTA „Pradėti kelionę“ elgsena:
- Desktop: `scrollIntoView({behavior:'smooth', block:'center'})` į formos konteinerį, tada `.focus()` į pirmą datos lauką; formai trumpam pridedamas `ring-2 ring-primary/60` (300 ms).
- Mobile (`useIsMobile`): tas pats scroll + focus; forma jau matoma hero apačioje.
- Nebekelia į `/automobiliai` be datų.

## 3. Vizualas

Dabartinis „Premium Green Audi“ PNG pakeičiamas realia Carbonus automobilio nuotrauka. Kadangi šiuo metu turime tik studijines nuotraukas iš flotos (Hyundai Bayon, KIA Ceed, VW Passat), pirmame žingsnyje:

- Naudojame **Hyundai Bayon** studijinę nuotrauką kaip pagrindinį hero automobilį (universalus, atitinka „šeimos / kelionės“ toną).
- Mercedes SLK NEnaudojamas kaip pagrindinis hero.
- Pridedamas švelnus gradient overlay (tamsesnis kairėje po tekstu, skaidrus dešinėje po automobiliu).
- `<img>` gauna `width`, `height`, `fetchpriority="high"`, be `loading="lazy"`.

Vėliau (atskiras žingsnis, ne šiame plane) galima užsakyti realią lauko fotosesiją Druskininkuose ir pakeisti į AVIF/WebP srcset. Video loop dabar NEĮDEDAMAS, nes neturime kokybiškos filmuotos medžiagos — planas numato tik statišką realų vaizdą, kaip nurodyta 4 skyriaus pabaigoje.

## 4. Išdėstymas

- Desktop: `min-h-screen`, kairėje – žyma + antraštė + aprašymas + CTA, apačioje po jais – rezervacijos formos kortelė. Dešinėje – automobilio vaizdas. Viskas telpa be scroll (1440×900 patikrinta).
- Mobile: stack – žyma, antraštė, aprašymas, CTA, forma. Automobilio vaizdas paslėptas (`hidden lg:block`) kaip dabar, kad neatsirastų horizontalus scroll.
- Tablet: patikrinta portrait/landscape, forma pilnu pločiu, vaizdas mažesnis.

## 5. Skaitomumas ir stilius

- Formos kortelė: `bg-background/70 backdrop-blur-md border border-border/60 shadow-lg rounded-xl`.
- Overlay: `bg-gradient-to-r from-background/85 via-background/40 to-transparent` virš vaizdo tik desktop.
- Naudojami tik semantiniai tokenai (`primary`, `foreground`, `muted-foreground`) — jokių hardcoded spalvų.

## 6. Animacijos

- `animate-fade-in` žymai, po 120 ms antraštei, 240 ms aprašymui + CTA, 360 ms formai (Tailwind delay klasės).
- Jokio typewriter/zoom/parallax.
- `@media (prefers-reduced-motion: reduce)` — animacijos išjungiamos globaliai per esamą `index.css` konvenciją (patikrinsime; jei nėra, pridėsime).

## 7. Analitika

Į `src/lib/analytics.ts` pridedami helperiai ir kviečiami iš hero:

- `trackEvent('hero_view')` — `useEffect` mount metu.
- `trackEvent('click_hero_booking')` — paspaudus „Pradėti kelionę“.
- `trackEvent('hero_search_started')` — pakeitus bet kurį datos lauką pirmą kartą.
- `trackEvent('search_availability', {start, end, days})` — submitinus formą.

## 8. Techninė dalis

Failai, kurie bus keičiami:

- `src/components/sections/hero.tsx` — perrašomas su forma, nauju CTA elgesiu, analitika.
- `src/i18n/translations.ts` — atnaujinami `hero.*` raktai LT/EN + pridedami `hero.badge`, `hero.formCta`, `hero.trust`.
- `src/lib/analytics.ts` — pridedami hero event helperiai (arba kviečiama `trackEvent` tiesiai).
- `src/pages/Cars.tsx` — patikrinsime, ar priima `?start`/`?end` query params; jei ne, perskaitys iš `BookingContext`, į kurį hero forma įrašys datas prieš navigaciją.
- Naujas hero image asset iš esamų flotos studijinių nuotraukų (Hyundai Bayon). Jei tinkamos nuotraukos nėra `public/` — naudosime esamą flotos nuotrauką iš Supabase per `cars` lentelę arba įkelsime kaip statinį asset'ą.

Ne šiame plane (atskirai, kai bus medžiaga): realaus lauko foto/video Druskininkuose, AVIF srcset, LCP preload teg'as.

## Klausimas prieš startą

Kokį automobilio vaizdą naudoti pirmam žingsniui:
1. Esamą Hyundai Bayon studijinę nuotrauką (greita, be naujo turinio).
2. Sugeneruoti AI vaizdą su Hyundai Bayon prie Druskininkų viešbučio (rizika – „AI look“, kurio prašėte vengti).
3. Palaukti, kol atsiųsite realią lauko nuotrauką.

Jei nenurodysite kitaip, eisime su variantu **1**.
