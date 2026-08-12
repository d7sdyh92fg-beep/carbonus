# Paleidimo parengtis: saugumas + pilnas veikimo patikrinimas

Frontend baigtas. Siūlau tris etapus: saugumo užbaigimas, end-to-end funkcinis testavimas, ir paleidimo higiena (SEO/analitika/klaidų stebėjimas).

## 1. Saugumas

Nauja skenavimo būklė: kritinių priklausomybių spragų nėra, DB/RLS radinių taip pat. Liko trys platformos lygio įspėjimai:

- Įjungti „Leaked password protection" (Auth nustatymai).
- Sumažinti OTP galiojimo laiką iki rekomenduojamo (<= 1 val.).
- Suplanuoti Postgres versijos atnaujinimą (saugumo pataisos) — daroma Cloud nustatymuose, trumpas prastovos langas.

Papildomai peržiūrėsiu ranka:
- Visos 18 edge funkcijų: ar administracinės (`generate-invoice-pdf`, `manage-deposit`, `send-*`, `edit-car-image`) tikrina JWT + admin rolę; ar viešos (`create-stripe-payment`, `verify-stripe-payment`, `newsletter-subscribe`, `driving-distance`) turi input validaciją ir nepriima kainos iš kliento.
- `driver-licenses` bucket: tik signed URL, jokio viešo listing.
- Ar Stripe webhook/verify negali būti panaudotas rezervacijai patvirtinti be realaus mokėjimo.
- Ar admin maršrutai apsaugoti serveryje (ne tik UI slėpimu).

Radinius, kurie nepritaikomi, pažymėsiu ir atnaujinsiu saugumo atmintį.

## 2. Funkcinis QA (end-to-end)

Praeisiu realius scenarijus naršyklėje ir DB duomenimis:

- Rezervacijos srautas: pagrindinis puslapis -> paieška -> /laisvi-automobiliai -> paslaugos -> draudimas -> sąlygos -> peržiūra -> apmokėjimas (Stripe test) -> PaymentSuccess.
- Kainodara: 1-3 / 3-7 / 7+ d. pakopos, 24 val. ciklas (ceil), pristatymo logistika (1.60 €/km, min 40 €, Druskininkai 0 €), avansas, depozitas.
- Datos: 1 val. minimalus laikas, laiko juostos stabilumas, užimtų datų blokavimas, lygiagretaus dvigubo rezervavimo testas (advisory lock).
- Admin: vietinė rezervacija, juodraščiai, blokuotos datos, statusų keitimas, parašai, sutarties PDF, sąskaitos (numeris + data), istorijos trynimas.
- El. laiškai: klientui ir admin — turinys, priedai, dubliavimo apsauga.
- Kalbos LT/EN visuose naujuose V3 puslapiuose (ar nėra trūkstamų raktų).
- Responsyvumas: telefonas / planšetė / mažas nešiojamas — visi puslapiai.
- Konsolės ir tinklo klaidos kiekviename maršrute; 404 ir senų numerinių URL 301 nukreipimai.

Rezultatas: klaidų sąrašas su prioritetais, tada taisymai.

## 3. Paleidimo higiena

- SEO: title/description/canonical/JSON-LD kiekviename puslapyje, sitemap.xml + robots.txt atitinka naujus maršrutus, og-image.
- Greitis: paveikslėlių dydžiai, lazy-load, Lighthouse patikra.
- Analitika: GA4/GTM įvykiai pilname rezervacijos sraute (view -> select -> checkout -> purchase).
- Atsarginė kopija: DB eksportas prieš Postgres atnaujinimą.

## Techninės pastabos

- Naršyklės testai per Playwright prieš localhost:8080, su realiais duomenimis iš Supabase.
- Lygiagretus rezervavimas tikrinamas dviem vienalaikiais RPC iškvietimais į `create_reservation`.
- Auth/OTP/Postgres nustatymai keičiami Cloud sąsajoje — juos atliksiu arba pateiksiu tikslius žingsnius, jei reikės tavo patvirtinimo.

## Nuo ko pradedam

Siūlau eiliškumą: 1) saugumo užbaigimas, 2) rezervacijos srauto E2E + admin QA, 3) SEO/analitika prieš publikavimą.
