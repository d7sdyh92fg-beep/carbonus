# Homepage redizainas 1:1 pagal mockupą

Perdarysiu `/` puslapį pagal pateiktą mockupą ir specifikaciją. Esama rezervacijų logika, Supabase užklausos, maršrutai ir edge funkcijos lieka nepaliestos — keičiu tik UI sluoksnį.

## Apimtis

**Keičiu tik pagrindinį puslapį** (`src/pages/Index.tsx` ir jo sekcijų komponentus). Kiti puslapiai (Cars, CarDetail, AvailableCars, Admin, rezervacijų srautas, checkout, sutartys, email'ai) — nepaliečiami.

## Ką padarysiu

### 1. Design system (globalūs pakeitimai)
- **`index.html`**: pridedu Google Font `Manrope` (400/500/600/700/800).
- **`tailwind.config.ts`**: `fontFamily.sans = ['Manrope', 'Inter', 'Arial', 'sans-serif']`.
- **`src/index.css`**: pridedu naujus CSS kintamuosius pagal spec (`--carbonus-green`, `--carbonus-dark`, `--text-primary`, `--page-soft`, `--rating-yellow` ir t.t.) HSL formatu, nekeičiant esamų shadcn tokenų (`--primary`, `--background`) — tik papildau. Papildomos radius, shadow, focus ring utilities.

### 2. Naujas homepage komponentų medis
Sukuriu `src/components/home/` katalogą su naujais komponentais, nekeisdamas esamo `src/components/sections/*` (jie lieka, jei kur nors kitur naudojami; jei ne — pašalinsiu iš `Index.tsx` importų):

- `Header.tsx` — permatomas hero viršuje, scroll → dark glass, centrinė navigacija (Pradžia / Automobiliai / Apie mus / Kontaktai / DUK / Patarimai ir gidas), LT dropdown pill + Admin pill. Mobile hamburger + full-screen tamsus meniu. Naudoja esamą `useLanguage` hook ir `AuthContext` (Admin matomas tik prisijungus, kaip dabar).
- `Hero.tsx` — background image (`user-uploads://carbonus-hero-image.png` → įkelsiu per `lovable-assets`), 3 gradientų overlay, kairėje eyebrow + H1 („Jūsų kelionė / prasideda su / **Carbonus.**") + aprašymas + 3 mini privalumai + „Rasti automobilį" CTA.
- `HeroBookingForm.tsx` — 4 stulpelių forma (Paėmimo vieta / Paėmimo data / Grąžinimo data / Ieškoti mygtukas). Naudoja esamą `Popover` + `Calendar` + `DateField` logiką iš dabartinio `hero.tsx` (auto-sync trukmės, `formatLt`, navigacija į `/laisvi-automobiliai?pickup=&return=&mode=cars`). Vieta = „Druskininkai" (statiška, kaip mockupe).
- `HeroTrustRow.tsx` — 3 elementai (Nemokamas atšaukimas / Be paslėptų mokesčių / 24/7 klientų pagalba) su vertikalias skirtukais.
- `PopularCars.tsx` + `CarCard.tsx` — sekcija su top 5 automobiliais iš Supabase `cars` lentelės (naudos esamą užklausą kaip `fleet.tsx`, tik apribos iki 5 ir naujas kortelės dizainas). Kortelėje: kategorijos badge, rating pill, automobilio nuotrauka (contain, gradient po ja), pavadinimas, meta grid (Users/Fuel/CalendarDays/Settings2), „nuo X € /d." + „Rinktis" mygtukas → `/automobiliai/{slug}`. Reali rating jei duomenų bazėje yra, kitu atveju stabilus pseudo-rating pagal `car.id`. „Peržiūrėti visus" → `/automobiliai`. Loading skeleton + error + empty state.
- `BenefitsSection.tsx` — 4 kortelės (ShieldCheck / CarFront / Tags / Headphones).
- `HowItWorks.tsx` — 4 žingsniai su dotted linija tarp icon circles desktop'e, mobile'e vertikali timeline.
- `BottomCTA.tsx` — 58/42 grid, kairėje SUV nuotrauka (sugeneruosiu per `imagegen`, tamsi, motion blur subtiliai), dešinėje dark gradient + H2 + aprašymas + „Užsakyti dabar" → `/automobiliai` + 3 badges.
- `Footer.tsx` — dark #07191C, 4 stulpeliai, socials, kontaktai, copyright. Nuorodos į esamus maršrutus (`/`, `/automobiliai`, `/apie-mus`, `/kontaktai`, `/duk`, `/patarimai-ir-gidas`, `/privatumo-politika`, `/nuomos-sutartis`).

### 3. `src/pages/Index.tsx`
Pilnai pakeičiu importus į naujus `home/*` komponentus. Palieku `LanguageLinks` SEO tag'ą. `Navigation` nebenaudojamas homepage'ui (naujas `Header` pakeičia), bet failas lieka — kiti puslapiai jį vis dar naudoja.

### 4. Assets
- `carbonus-hero-image.png` → įkelsiu per `lovable-assets create` į `src/assets/carbonus-hero.png.asset.json`.
- Apatinis CTA SUV → sugeneruosiu per `imagegen` (tamsus SUV, kalnų kelias, subtilus motion blur) → `src/assets/cta-suv.jpg`.

## Ko NEDARYSIU

- Nekeičiu jokių Supabase migracijų, RPC, RLS, edge funkcijų.
- Nekeičiu `AvailableCars`, `CarDetail`, `BookingForm`, `ReservationReview`, `Admin`, checkout, invoice/contract logikos.
- Neišmetu `data-allow-save`, image protection, analytics tracking.
- Nekeičiu i18n raktų reikšmių — mockupe visi tekstai LT, todėl homepage tekstus rašau statiškai LT (kaip ir dabartinis `hero.tsx`), atskirai EN nesiimsiu (galima pridėti vėliau, jei prašysi).
- Nekeičiu esamų `sections/*` failų — tik nustoju juos importuoti iš `Index.tsx`.

## Techninės detalės

- **Šriftai**: Manrope tik per Tailwind default sans, kad nereikėtų perrašyti visų komponentų.
- **Spalvos**: naujus tokenus laikau HSL formatu (`--carbonus-green: 149 62% 46%;`) kad veiktų su Tailwind arbitrary values `bg-[hsl(var(--carbonus-green))]`. Kortelėse, mygtukuose ir CTA naudoju šiuos tokenus, ne raw hex.
- **Header scroll**: `useEffect` + `window.scrollY > 40` → toggle klasę.
- **Mobile menu**: shadcn `Sheet` komponentas.
- **Kortelių rating**: jei `cars.rating` stulpelio nėra (patikrinsiu prieš rašydamas), naudosiu deterministinę reikšmę `4.6 + (hash(car.id) % 4) * 0.1`.
- **Automobilių limitas**: `.limit(5)` + `order('display_order')` (arba dabartinis fleet ordering).
- **Responsive**: Tailwind breakpoints `md` (768) ir `lg` (1024) pagal spec.

## Rizikos

- Jei `Navigation` komponentas turi kokį global side-effect (pvz., analytics), praradau jį homepage'e. **Rizikos mažinimas**: naujame `Header` iškviesiu tą patį hook, jei toks yra.
- Jei `cars` lentelės schema neturi `category`/`rating`/`year`/`transmission`/`fuel`/`seats` laukų tais pačiais pavadinimais kaip mockupe, mapinsiu iš esamų (`car_type`, `metai`, `pavaru_deze` ir t.t.) — patikrinsiu prieš rašydamas.
- Manrope šrifto pridėjimas gali paveikti kitus puslapius (visur bus Manrope vietoj dabartinio sans). Tai laikau **pageidautinu** efektu (bendra tipografija), bet paminiu.

## Eiga

1. Perskaityti `src/components/sections/fleet.tsx`, `src/components/ui/navigation.tsx`, `src/hooks/use-language.tsx`, `src/App.tsx` (maršrutai), `src/integrations/supabase/types.ts` (cars lentelės laukai) — patikrinti realius duomenis.
2. Įkelti hero asset, sugeneruoti CTA asset.
3. Atnaujinti `index.html`, `index.css`, `tailwind.config.ts`.
4. Sukurti `src/components/home/*` failus.
5. Perrašyti `src/pages/Index.tsx`.
6. Typecheck + vizualus patikrinimas Playwright'u (desktop 1280, tablet 900, mobile 390) side-by-side su mockupu.

Po patvirtinimo pradedu.
