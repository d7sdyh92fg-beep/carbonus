# Homepage polish pass (before freeze)

Frontend-only refinements to the current homepage (`/`, HomeV3). No backend or booking-logic changes.

## 1. Hero search bar
- CTA text: „Ieškoti“ -> „Ieškoti automobilių“ (EN "Search cars", RU "Найти автомобиль").
- Reduce visual weight: cut field vertical padding ~10–15%, smaller helper/description text, lower info band height, CTA height matched to the fields instead of taller.
- Nudge the whole bar slightly up so it sits between headline and car rather than hanging off the hero bottom.

## 2. Trust element under the hero
Small inline row right under the search bar (no new section): ★★★★★ 5.0 Google, linking to the Google reviews profile. Translated for LT/EN/RU.

## 3. „Kaip tai veikia“ copy
- Pasirinkite vietą — „Atsiimkite Druskininkuose arba rinkitės pristatymą.“
- Pasirinkite datas — „Nurodykite nuomos laikotarpį.“
- Rezervuokite — „Pasirinkite automobilį ir patvirtinkite rezervaciją.“
Plus EN/RU equivalents; second step title changes from „Paėmimo data“ to „Pasirinkite datas“.

## 4. „Kodėl rinktis Carbonus?“ benefits
Replace generic items (kainos garantija, 24/7 pagalba) with real advantages:
- Nemokamas pristatymas Druskininkuose
- Pristatymas į kitus miestus Lietuvoje
- Aiški kainodara be paslėptų mokesčių
Icons updated to match; all three languages.

## 5. Section spacing system
Standardise to three values instead of ad-hoc paddings:
- normal: `py-16 lg:py-20`
- large: `py-20 lg:py-24`
- mobile: `py-12`
Applied across HowItWorks, TopDeals, BestServices, CustomerExperience, SimpleCta. The big car-from-above benefit section gets reduced padding and benefits pulled closer to the image, keeping the premium feel with less scroll cost.

## 6. Bottom CTA
Buttons become: primary „Rasti automobilį“ (to the fleet/search), secondary „Susisiekite su mumis“ (phone). Same in EN/RU.

## 7. Copy consistency
One verb hierarchy across the page: „Ieškoti automobilių“ (hero), „Peržiūrėti automobilį“ (card), „Rasti automobilį“ (bottom CTA). Remove stray „Rezervuok dabar“ / bare „Ieškoti“.

## 8. Footer contrast
Darken footer links and fine print one tone so they pass readable contrast, keeping the same layout.

## 9. Mobile hero QA
Verified with real device-width screenshots at 375 / 390 / 430 px:
- location pills wrap cleanly, no broken rows;
- date fields have large tappable areas;
- CTA full width;
- car image never overlaps the headline;
- info text kept short so it doesn't eat half the screen.

## 10. Interaction + accessibility baseline
- Hover/active states for pills, cards, CTAs; input/field focus rings; navbar active state; transitions 150–250 ms.
- Visible keyboard focus everywhere, ~44 px minimum hit areas, active state not signalled by colour alone (weight/border too), real `<label>` elements on form controls, contrast checked.

## Out of scope
No new sections (no FAQ, reviews, cities, testimonials, partners). After this pass the homepage is frozen; next work goes to the results page.

## Technical notes
Files touched: `src/components/homev3/V3SearchBar.tsx`, `V3Hero.tsx`, `V3HowItWorks.tsx`, `V3BestServices.tsx`, `V3CustomerExperience.tsx`, `V3TopDeals.tsx`, `V3SimpleCta.tsx`, `V3Footer.tsx`, and `src/components/home/Header.tsx` (navbar active state). All copy stays in the existing per-component `COPY` objects with lt/en/ru keys; colours stay on existing semantic tokens.
