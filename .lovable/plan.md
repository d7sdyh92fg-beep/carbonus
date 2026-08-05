# Naujas puslapis: RentalX dizaino atkūrimas

Sukuriamas dar vienas visiškai atskiras puslapis (route `/home-v3`), nepriklausantis nuo esamų `home` komponentų, kuriame 1:1 atkuriamas dizainas iš 5 pateiktų ekrano nuotraukų. Oranžinė akcentinė spalva keičiama į Carbonus žalią, likusi kompozicija, tarpai, tipografija ir struktūra kartojami kuo tiksliau.

## Puslapio sekcijos (pagal screenshotus)

1. **Header** — kairėje logotipas, centre meniu (Rent / Share / Ride / Service, aktyvus su akcentiniu pabraukimu), dešinėje "Sign up" tekstinis linkas ir pilna spalva mygtukas.
2. **Hero** — šviesiai pilkas fonas, kairėje dviejų eilučių antraštė, trumpas aprašymas, du "App Store / Google Play" mygtukai; dešinėje žalia kortelė su padangos protektoriaus raštu ir automobiliu, išeinančiu už kortelės ribų. Apačioje kairėje – balta plaukiojanti paieškos juosta (lokacija / paėmimo data / grąžinimo data + akcentinis "Search" mygtukas), užeinanti ant kortelės.
3. **Partnerių logotipų juosta** — pilkų wordmark'ų eilutė.
4. **How it works** — mažas antraštės eyebrow, centre pavadinimas, 3 žingsniai su ikonomis (vidurinis – akcentinės spalvos su švytėjimu), tarp jų punktyrinės kreivės.
5. **Best services** — kairėje didelė automobilio nuotrauka su šešėliu, dešinėje antraštė, akcentinis brūkšnys ir 3 privalumai su ikonų kvadratais.
6. **Top deals** — centrinė antraštė, markių filtrų juosta (aktyvus – akcentinis), 4 automobilių kortelės (nuotrauka, metų žymė, pavadinimas, kaina + kaina/mėn., 3 specifikacijų eilutė, "Rent Now" mygtukas), apačioje karuselės rodyklės.
7. **Customer experience** — automobilis iš viršaus centre, aplink 6 privalumai su ikonomis, sujungti plonomis linijomis su taškais; apačioje 5 kategorijų "chip" eilutė. Mobiliajame – paprastas 2 stulpelių sąrašas be linijų.
8. **App CTA juosta** — akcentinė kortelė su tekstu, store mygtukais ir telefono makete dešinėje, išlendančiu virš kortelės.
9. **Footer** — 5 nuorodų stulpeliai, naujienlaiškio laukas su mygtuku, reitingas su žvaigždutėmis; apačioje atskirta juosta su logotipu, nuorodomis ir socialinių tinklų ikonomis.

## Turinys

Puslapis kuriamas kaip dizaino maketas: tekstai lietuviški, atitinkantys Carbonus veiklą, bet sekcijų struktūra ir elementų kiekis identiški originalui. Automobilių kortelėms naudojamos esamos parko nuotraukos iš `src/assets`. Trūkstamiems vizualams (hero automobilis, automobilis iš viršaus, telefono maketas) generuojami nauji paveikslėliai; store mygtukai ir partnerių logotipai atkuriami kaip inline SVG/tekstas, o ne svetimi prekės ženklai iš interneto.

## Techninė dalis

- Naujas `src/pages/HomeV3.tsx` + route `/home-v3` `src/App.tsx`.
- Nauji komponentai atskirame kataloge `src/components/homev3/` (Header, Hero, SearchBar, Partners, HowItWorks, BestServices, TopDeals, CustomerExperience, AppCta, Footer) — esami `home` komponentai nekeičiami.
- Spalvos per semantinius tokenus: akcentui naudojamas esamas Carbonus žalias tokenas; jei reikia, į `index.css` / `tailwind.config.ts` pridedami nauji `homev3` atspalvių tokenai (fonas, švelnus pilkas, akcento švytėjimas). Jokių hardcodintų spalvų klasių.
- Pilnai responsyvu: desktopo tinklelis nusileidžia į vieno stulpelio išdėstymą, karuselės tampa horizontaliai slenkamos.
- Statinis maketas be backend logikos — paieškos forma ir mygtukai kol kas be veiksmų (prijungsime vėliau, kai patvirtinsi dizainą).
