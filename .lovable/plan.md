
## Nauja hero kompozicija

Visiškai atsisakome dabartinės „tekstas kairėje + iškirptas Hyundai PNG ant balto“ struktūros. Vietoje jos — pilno pločio kinematinė scena su viena horizontalia rezervacijos juosta apačioje (Variantas A: be dublikato „Pradėti kelionę“ mygtuko).

## Struktūra (desktop)

```
┌──────────────────────────────────────────────────────────┐
│ [ header lieka nepakitęs ]                               │
│                                                          │
│   ┌─ tekstas (max ~620px, vert. centre) ─┐               │
│   │ • žyma: „Jūsų kelionė prasideda...“   │   [ scena    │
│   │ • H1: Daugiau laisvės                 │    tęsiasi   │
│   │        kiekvienai kelionei.           │    per visą  │
│   │ • aprašymas                           │    plotį ]   │
│   │ • antrinis tekstinis link:            │               │
│   │   „Peržiūrėti automobilius →“         │               │
│   └───────────────────────────────────────┘              │
│                                                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [Atsiėmimo data] [Grąžinimo] [Vieta] [ Ieškoti ] │   │ ← glass juosta
│  └──────────────────────────────────────────────────┘   │
│  Realus laisvumas · Aiški kaina · Pristatymas D-uose     │
└──────────────────────────────────────────────────────────┘
```

Aukštis: `min-h-[100svh] lg:min-h-[760px]`. Vienas bendras hero fonas — jokių baltų blokų už automobilio.

## Vizualas

Naudosime **naują pilno hero dydžio atmosferinį placeholder vaizdą** (generuosime AI, aiškiai pažymėsime kaip laikiną, kol atsiras reali Carbonus fotosesija):

- scena: automobilis prie SPA / viešbučio arba Druskininkų miško kelio
- auksinė valanda / ankstyvas rytas
- automobilis — natūrali scenos dalis, ne PNG ant balto
- tamsus dviejų taškų gradient overlay: stipresnis kairėje (po tekstu), lengvas dešinėje

Formatas: WebP, `fetchpriority="high"`, preload, be lazy. Responsive: atskiras mobile crop (portretas, automobilis necroppinamas ties ratais).

Dabartinis `hyundai-bayon-side-clean.png` iš hero pašalinamas.

## Tekstas (LT)

- Žyma: „Jūsų kelionė prasideda Druskininkuose“
- H1: „Daugiau laisvės\nkiekvienai kelionei.“ (žalias akcentas tik „kiekvienai kelionei.“)
- Aprašymas: „Atraskite Druskininkus ir Lietuvą savo tempu. Pasirinkite tinkamą automobilį, o mes pristatysime jį ten, kur apsistojote.“
- Antrinis link (ne mygtukas): „Peržiūrėti automobilius →“ — scroll į #fleet
- EN vertimai atnaujinami analogiškai

## Rezervacijos juosta

Horizontali glass juosta (`backdrop-blur-md`, pusiau skaidrus tamsus fonas, rounded-2xl, subtili šviesos linija viršuje):

| Atsiėmimo data | Grąžinimo data | Atsiėmimo vieta | [Rodyti laisvus automobilius] |

- vietos select: Druskininkai (numatyta), + pristatymo pastaba
- Submit → `/masinos?pickup=...&return=...&location=...` (be pakeitimų back-end logikai)
- Po juosta smulki eilutė: „Realus laisvumas · Aiški kaina ir užstatas · Pristatymas Druskininkuose“

Mobile: forma tampa vertikali, mygtukas per visą plotį; scena kraunama iš mobile srcset.

## Pašalinama

- „Pradėti kelionę“ CTA mygtukas ir scroll-to-form focus logika
- Baltas dešinės pusės blokas / iškirpto automobilio kortelė
- Dabartinis `hyundai-bayon-side-clean.png` importas hero
- Trust markers grid, jei dubliuoja naują eilutę po forma

## Animacija

- Teksto fade + translateY (žyma → H1 → aprašymas → link, stagger 80ms)
- Formos fade-in po teksto (~400ms delay)
- Labai lėtas hero vaizdo scale (12s, nuo 1.00 iki 1.04)
- `prefers-reduced-motion`: viską išjungti

## Failai, kuriuos keisiu (build mode)

1. `src/components/sections/hero.tsx` — visiškas perrašymas pagal struktūrą aukščiau
2. `src/i18n/translations.ts` — hero raktai (žyma, H1 su akcentu, aprašymas, formos etiketės, trust juosta)
3. Naujas hero vaizdas: `src/assets/hero-druskininkai.webp` (AI placeholder, atmosferinė scena) + preload nuoroda `index.html`
4. Analytics: `hero_view`, `hero_search_started`, `search_availability` išlieka; `click_hero_booking` pašalinamas kartu su mygtuku

## Prieš įgyvendinant

Patvirtink:
- **Variantas A** (forma iš karto, be „Pradėti kelionę“) — ar sutinki?
- **Placeholder scena**: (a) automobilis prie modernaus SPA/viešbučio įvažiavimo, ar (b) miško kelias auksinės valandos šviesoje?
