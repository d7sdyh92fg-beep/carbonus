## Tikslas
Pridėti kinematinius efektus (šviesų kvėpavimas, galinės šviesos, road shimmer, krentantys lapai, dulkės, subtilus parallax) prie dabartinio hero — **neįvedant įkepto UI kaip vieno paveikslėlio**. Tekstas ir rezervacijos forma lieka realūs elementai.

## Failai iš paketo (užimti tiesiai)
- `src/components/CinematicHeroMedia.tsx` — kopija iš `user-uploads://`
- `src/components/cinematic-hero-media.css`
- `src/components/heroMotionPresets.ts`
- `public/images/carbonus-hero-clean.webp` → įkelti per `lovable-assets` (kad nebūtų binaras repo) ir naudoti CDN URL

## Pakeitimai `src/components/CarbonusHero.tsx`
1. Importuoti `CinematicHeroMedia`, `heroMotionPresets` ir `cinematic-hero-media.css`.
2. `heroRef` jau egzistuoja — perduoti kaip `targetRef`.
3. Pašalinti dabartinį `<motion.img>` + custom pointer/scroll parallax bei glow div (juos dabar tvarko `CinematicHeroMedia`). Palikti dviejų sluoksnių tekstinį gradient overlay virš media, žemiau turinio.
4. Media sluoksnis: `<CinematicHeroMedia targetRef={heroRef} src={heroCleanAsset.url} lightTrigger="hybrid" />` prie `absolute inset-0 z-0`.
5. Turinys ir booking forma – `relative z-20`, su `data-hero-content` / `data-hero-booking` atributais (kad presetai galėtų taikyti animacijas jei komponentas jas riša per selektorius; jei presetai eksportuojami kaip `variants`, taikome tiesiogiai per `motion` props).
6. Pakeisti dabartinius ad‑hoc `initial/animate` į `heroMotionPresets.badge / h1 / description / secondaryCta / bookingForm`. Booking formos atsiradimas ≤ 1.7 s.
7. Palikti `onSearch`, datų būsenas, validaciją, analytics — nepakeistus.

## Ko NEKEISTI
- `src/components/sections/hero.tsx` (Supabase/rezervacijos navigacija).
- Kitų puslapio sekcijų, logo, kontaktų, kainodaros, URL routing.
- `framer-motion` versijos — projekte jau įdiegta `framer-motion@11` (React 18 suderinama). Paketo `^12` reikalavimą ignoruojame; presetai naudoja standartinį FM API, kuris identiškas v11.

## Responsive / prieinamumas
- CSS iš `cinematic-hero-media.css` tvarko mobile mažinimą (≤3 lapai, be road shimmer, be pointer parallax).
- `prefers-reduced-motion` — jau palaikoma paketo komponente; papildomai `useReducedMotion` išjungia presetų judesius.

## Assetas
```
lovable-assets create --file /mnt/user-uploads/carbonus-hero-clean.webp \
  --filename carbonus-hero-clean.webp > src/assets/carbonus-hero-clean.webp.asset.json
```
Naudoti `import heroClean from "@/assets/carbonus-hero-clean.webp.asset.json"` ir `heroClean.url`.

## Patikra
- `tsgo` typecheck.
- Naršyklės konsolė be klaidų, be horizontal scroll.
- Booking forma matoma be scroll, funkcinė (data validacija + navigacija į `/automobiliai?start=&end=`).
- Reduced motion: efektai išjungti, forma vis tiek matoma.

## Pakeistų failų sąrašas (numatomas)
- naujas: `src/components/CinematicHeroMedia.tsx`
- naujas: `src/components/cinematic-hero-media.css`
- naujas: `src/components/heroMotionPresets.ts`
- naujas: `src/assets/carbonus-hero-clean.webp.asset.json`
- redaguotas: `src/components/CarbonusHero.tsx`
