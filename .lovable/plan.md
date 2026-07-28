## Homepage 1:1 redizainas pagal mockupą

Perdarysiu visą homepage taip, kad kuo tiksliau atitiktų atsiųstą dizainą. Automobilių sąrašas, kainos ir logika (rezervavimo forma, laisvų automobilių paieška) lieka tokia pati — keičiasi tik vizualas.

### 1. Navigation (`src/components/ui/navigation.tsx`)
- Baltas fonas, subtili apatinė linija, juodas tekstas
- Kairėje: logo su mažu žaliu automobiliuko akcentu (naudosiu esamą logo variantą)
- Centre: Pradžia · Automobiliai · Apie mus · Kontaktai · DUK · Patarimai ir gidas (aktyvi nuoroda — žalia + apatinis brūkšnys)
- Dešinėje: „LT ▾" mygtukas + žalia apvali „Admin" pill (rodoma tik prisijungus adminui)
- Scrollinant vis dar slepiasi/rodosi kaip dabar

### 2. Hero (`src/components/sections/hero.tsx`)
Tamsus (`#0E1512`) fonas visai sekcijai. Nauja įkelta žalio SUV nuotrauka bus įkelta per `lovable-assets` ir naudojama kaip hero vaizdas dešinėje pusėje (~55% pločio, be overlay maskavimo — masina turi būti ryški).

Kairėje:
- Mažas caps eyebrow: „KELIAUKITE PATOGIAI, MOKĖKITE PROTINGAI."
- H1 (didelis, baltas): „Jūsų kelionė prasideda su" + nauja eilutė žalios spalvos „Carbonus."
- Paragrafas su aprašymu
- 3 pilki chip badges su ikonomis: „Nauji automobiliai" · „Skaidrios kainos" · „Greitas rezervavimas"
- Žalias pill mygtukas „Rasti automobilį →"

Apačioje (per visą hero plotį): **tamsus rezervavimo bar'as** su 4 stulpeliais:
- Paėmimo vieta (dropdown „Druskininkai")
- Paėmimo data (kalendorius)
- Grąžinimo data (kalendorius)
- Žalias „Ieškoti automobilių 🔍" mygtukas

Dar žemiau: 3 privalumų juostą su ikonomis (Nemokamas atsiėmimas · Be paslėptų mokesčių · 24/7 klientų pagalba), atskirta plonais vertikaliais separatoriais.

### 3. Fleet (`src/components/sections/fleet.tsx`)
- Eyebrow „POPULIARIAUSI AUTOMOBILIAI", H2 „Rinkitės iš mūsų geriausių pasiūlymų", dešinėje „Peržiūrėti visus automobilius →" link
- **5 kortelės vienoje eilutėje** (dabar 4) — kompaktiškesnės
- Kiekvienoje kortelėje:
  - Viršuje: juodas pill su kategorija (kairėje) + geltona žvaigždė su ratingu (dešinėje)
  - Automobilio nuotrauka baltame fone
  - Pavadinimas
  - 4 mažos specs eilutės (2×2 grid): keleiviai · kuras · metai · pavarų dėžė
  - Apačioje: „nuo **XX €** /d." (kairėje) + žalias „Rinktis" mygtukas (dešinėje)
- Baltas „Žiūrėti daugiau automobilių →" ghost mygtukas su žalia riba, centre po grid'u

### 4. Features (`src/components/sections/features.tsx`)
- Šviesiai pilkas/off-white fonas (`bg-secondary/30`)
- Eyebrow „KODĖL VERTA RINKTIS CARBONUS?!", H2 „Patikima nuoma be rūpesčių"
- **4 stulpeliai** (dabar 3) su apvaliais šviesiai žaliais ikonų badge'ais: Lengvas užsakymas · Kokybė ir įvairovė · Skaidrios kainos · Klientų palaikymas

### 5. How It Works (`src/components/sections/how-it-works.tsx`)
Perdarau iš vertikalaus į **horizontalų 4 žingsnių flow**:
- Eyebrow „KAIP TAI VEIKIA", H2 „Nuoma paprasta kaip 1–2–3–4"
- 4 apvalūs šviesiai žali badge'ai su ikonom (kalendorius, automobilis, checkmark, raktas)
- Punktyrinės linijos jungia badge'us
- Po kiekvienu: mažas skaičius apskritime (1/2/3/4) + pavadinimas + aprašymas

### 6. CTA (`src/components/sections/cta.tsx`)
- Tamsi kortelė su suapvalintais kampais
- Kairėje pusėje: SUV nuotrauka (paliksiu esamą arba naudosiu Q3-style)
- Dešinėje: H2 „Pasiruošę **kelionei**?" (kelionei — žalias), aprašymas, žalias „Užsakyti dabar →" mygtukas
- Apačioje 3 chip'ai: Geriausios kainos · Nauji automobiliai · Lankstus atlaikimas

### 7. Footer (`src/components/sections/footer.tsx`)
- Baltas fonas
- 4 kolonos: Brand (logo + aprašymas + soc. ikonos) · Greita navigacija · Pagalba · MB Carbonus (telefonas, el. paštas, adresas)
- Apačioje centre: „© 2025 Carbonus. Visos teisės saugomos."
- Newsletter formos atsisakau (mockupe jos nėra), bet paliksiu funkciją prieinamą per kitą puslapį jei reikės

### Techninės detalės
- Nauja hero nuotrauka → `src/assets/hero-carbonus-suv.png.asset.json` per `lovable-assets create`
- Visa spalvinė paletė — semantiniai design tokens (`--primary` jau žalias, `--background`, tamsūs pritaikymai per `hsl(...)` variables jei reikia naujų tonų)
- Rezervavimo formos logika (state, navigacija į `/laisvi-automobiliai`, date sync) — nepakinta, tik vizualas
- Visos vertimo raktai (`t('...')`) išlieka, kur reikės naujų label'ų — pridėsiu į LT/EN žodynus
- Responsive: mobile pasirūpinsiu, kad hero tekstas eitų virš/po nuotraukos, rezervavimo forma sustabčiuota, fleet grid → 1-2 stulpeliai, features/how-it-works → stacked

### Ko NEDARAU
- Nekeičiu backend'o, RPC, rezervacijų logikos, kainų
- Nekeičiu kitų puslapių (`/automobiliai`, `/laisvi-automobiliai`, admin, blog)
- Neišimu esamų funkcijų (long/hotel tabs paliksiu prieinamus, jei paslėpti — patvirtinsi)

Patvirtinus — vykdau viską vienu ėjimu.