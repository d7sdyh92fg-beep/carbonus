# Paieškos rezultatų + pristatymo puslapis (Page 2)

Perdarome esamą `/laisvi-automobiliai` (`/available-cars`) puslapį pagal pateiktą mockupą, naudojant dabartinę Carbonus V3 dizaino sistemą (V3 header/footer, žali akcentai, balti korteliniai blokai, esami radius/shadow tokenai). Naujo dizaino nekuriame — tik perdėliojame layoutą ir pridedame pristatymo konfigūratorių.

## Ką vartotojas gaus

1. Homepage paieškoje pasirinkta vieta (Carbonus ofisas / Druskininkai / Kitas miestas) ir datos persiduoda į rezultatų puslapį per URL ir išlieka po refresh.
2. Viršuje: „Grįžti į pradžią“, antraštė „Raskite savo automobilį“, poantraštė, ir horizontali baltos paieškos santraukos kortelė su „Keisti paiešką“ (išsiskleidžia vietoje, negrąžina į pradžią).
3. Priklausomai nuo vietos režimo:
   - **Carbonus ofisas** — jokio žemėlapio; trumpas blokas „Paėmimas ir grąžinimas Carbonus ofise, M. K. Čiurlionio g. 51, Druskininkai — nemokamai“.
   - **Druskininkai** — pristatymo konfigūratorius: kairėje (45%) adreso paieška, dešinėje (55%) tikras Google žemėlapis su žymekliais.
   - **Kitas miestas** — tas pats konfigūratorius, bet paieška apima visą Lietuvą ir kaimynines kryptis.
4. Grąžinimo pasirinkimas: „Ta pati vieta“ (numatyta) / „Carbonus ofisas“ / „Kita vieta“ (antras adreso laukas).
5. Logistikos santrauka: Pristatymas / Atsiėmimas / Logistika iš viso — automatiškai perskaičiuojama.
6. Automobilių rezultatai su kainos išklotine: Automobilio nuoma, Pristatymas, Atsiėmimas, Iš viso + „Peržiūrėti automobilį“.
7. „Rodyti daugiau automobilių“ ir apatinė trijų punktų pasitikėjimo juosta.
8. Pilnai responsive: desktop 4 kortelės eilėje, planšetė 2, mobile viskas stackinama, žemėlapis ~280 px.

## Kainodara (laikina, be backend)

Vienas centralizuotas failas su zonų įkainiais už vieną operaciją:

- Druskininkai / Carbonus ofisas — 0 €
- Vilnius, Kaunas, Alytus — 50 €
- Panevėžys, Šiauliai, Klaipėda — 100 €
- Ryga — 150 €
- Varšuva — 200 €
- Nežinomas miestas — pagal atstumo zoną (≤150 km 50 €, 150–300 km 100 €, 300–450 km 150 €, toliau 200 € arba „Kaina derinama“)

`logisticsTotal = deliveryFee + collectionFee`; grąžinant į Carbonus ofisą collectionFee = 0. Klientui rodomos tik galutinės sumos, jokių formulių ar km.

## Žemėlapis ir adresų paieška

Naudosime Google Maps Platform konektorių:
- Žemėlapis su Carbonus ofiso žymekliu; pasirinkus adresą atsiranda žalias „Pristatymo vieta“ žymeklis (ir trečias, jei grąžinimas kitoje vietoje).
- Adresų/viešbučių autocomplete per Places API (New).
- Po žemėlapiu „Patikslinti vietą žemėlapyje“.

Prieš įgyvendinimą atidarysiu prijungimo langą — reikės patvirtinti Google Maps prijungimą. Jei prijungimas neįvyks, laukas veiks su realistiniu vietiniu sąrašu, o žemėlapio blokas liks tos pačios struktūros.

## Techninė dalis

- `src/pages/AvailableCars.tsx` perrašomas naudojant `V3Header` / `V3Footer` vietoje senos `Navigation`; esama laisvų automobilių logika (Supabase `cars`, rezervacijos, `car_blocked_dates`, kainų pakopos, `check_car_availability` prieš perėjimą į automobilio puslapį) išlaikoma nepakeista.
- Nauja bendra būsena `useSearchState` hook'e: `pickupMode`, `pickupLocation`, `returnMode`, `returnLocation`, `rentalPeriod`, `pricing` — sinchronizuojama su URL query params (`mode`, `pickup`, `return`, `pickupTime`, `returnTime`, `place`, `lat`, `lng`, `city`, `returnMode`...).
- `V3SearchBar.submit()` papildomas: perduoda `mode=office|druskininkai|other`.
- Nauji komponentai `src/components/search/`: `SearchSummaryCard`, `DeliveryConfigurator`, `LocationSearchInput` (reusable, su idle/loading/success/error būsenomis), `DeliveryMap`, `ReturnLocationSelector`, `LogisticsSummary`, `ResultCarCard`, `TrustStrip`.
- `src/lib/logisticsPricing.ts`: `calculateDeliveryFee`, `calculateCollectionFee`, `calculateLogisticsTotal` + zonų lentelė.
- Validacija inline prie laukų (be `alert`); jei vieta nepasirinkta — rezultatai vis tiek rodomi su „Pristatymas — pasirinkite vietą“ ir „Kaina nuo X €“ bei subtiliu įspėjimu virš rezultatų.
- Tekstai LT/EN/RU pagal esamą `use-language` modelį.
