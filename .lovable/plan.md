## Cinematic Hero v2 integracija

Visi reikalingi failai gauti. Integruoju juos į esamą `CarbonusHero` neliesdamas teksto/rezervacijos formos.

### Failai (nauji)
- `src/components/CinematicHeroMedia.tsx` — kopija iš `user-uploads://CinematicHeroMedia.tsx`
- `src/components/cinematic-hero-media.css` — kopija iš `user-uploads://cinematic-hero-media.css`
- `src/components/heroMotionPresets.ts` — kopija iš `user-uploads://heroMotionPresets.ts`
- `public/images/carbonus-hero-clean.webp` — kopija iš `user-uploads://carbonus-hero-clean.webp` (švarus fonas be teksto/formos, tinka SVG `<image>` sluoksniui)

### Pakeitimai
- `src/components/CarbonusHero.tsx`:
  - Pridedu `useRef` į `<section>` ir `useReducedMotion`.
  - Pakeičiu dabartinį statinį `<img>` fono sluoksnį į `<CinematicHeroMedia targetRef={heroRef} src="/images/carbonus-hero-clean.webp" lightTrigger="hybrid" />`.
  - Tekstą ir booking bar apvyniojų `motion.div` su `heroContainer` / `heroItem` / `heroBooking` variantais (`data-hero-content`, `data-hero-booking`), kad turinys liktų `z-index: 2` virš media sluoksnio.
  - Palieku esamą `onSearch` prijungimą, CTA, kalbos tekstus.
- Section jau turi `relative isolate overflow-hidden` — tinka CSS'ui.

### Ką NEliečiu
- `hero.tsx` (renderina `CarbonusHero`).
- Rezervacijos logika, `onSearch`, translations, kiti puslapio komponentai.
- Dabartinis `carbonus-hero-druskininkai.webp` — lieka kaip fallback, bet nebenaudojamas hero (galima ištrinti vėliau, jei nori).

### Verifikacija
- Typecheck.
- Vizualiai patikrinsiu preview: golden-hour scena su kvėpuojančia saule, lapais, dulkėmis, road shimmer; tekstas ir booking bar matomi virš efektų; `prefers-reduced-motion` išjungia animacijas.

Patvirtink ir įgyvendinsiu.