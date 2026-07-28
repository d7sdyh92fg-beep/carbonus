# Carbonus premium redizainas — planas

Dirbame etapais. Šis planas apima **tik ETAPĄ 0** (auditą). Kiekvienas kitas etapas gaus atskirą planą po tavo peržiūros.

## ETAPAS 0 — Pilnas auditas (dabar)

**Rezultatas:** vienas failas `docs/AUDIT-2026.md` (~15–25 psl.). Jokių kodo, DB ar UI pakeitimų. Jokių migracijų.

### Ką padarysiu

1. **Inventorizacija** — sitemap iš `src/App.tsx`, visų 21 puslapių paskirtis, komponentai, hooks, edge funkcijos (17 vnt.), Supabase lentelės (11 vnt.) ir jų RLS politikos.
2. **Rezervacijos srauto schema** — nuo hero paieškos iki `payment-success`, su Stripe branch'ais (online / pay-at-counter / admin in-person), `create_reservation` RPC, `send-booking-email`, `verify-stripe-payment`, `send-status-email`.
3. **Kainodaros auditas** — kaip realiai skaičiuojama: `cars` lentelės pakopos (1–3 / 3–7 / 7+), Mercedes SLK specialus atvejis, `PRICING` fallback `src/config/pricing.ts` (kur dar hardcoded), 24h ciklas `rentalDuration.ts`, avanso logika (50/40/30 €).
4. **Užimtumo ir konflikto logika** — `reservations` statusai, `car_blocked_dates` (phone_reservation), naujausias serverinis DATE_CONFLICT patikras `create_reservation`, kur dar likę frontend-only tikrinimų.
5. **Puslapių lentelė** (kritinis / aukštas / vidutinis / žemas) — kiekvienam puslapiui: paskirtis, funkcinės rizikos, dizaino problemos, SEO problemos, siūlomas pakeitimas, prioritetas.
6. **SEO auditas** — canonical, hreflang, sitemap.xml, robots.txt, structured data, esami URL (numeric ID → slug 301), esami dubliai LT/EN, `SEOHead` naudojimas.
7. **Analitikos auditas** — GA4/GTM/Meta Pixel integracija (`src/lib/analytics.ts`, `GoogleAnalytics.tsx`, `PixelTester.tsx`), esamų eventų mapping į specifikacijos 16 eventų, dubliavimo rizikos.
8. **Techninių skolų sąrašas** — hardcoded kainos/tekstai, PII el. laiškuose, `service_role` naudojimas, RLS spragos (per `supabase--linter`), didžiuliai komponentai (Admin.tsx 1732 eil., CarDetail 715 eil., BookingForm 674, send-status-email 750).
9. **Verslo duomenų klausimynas** — vienas struktūruotas skyrius su ~30–40 laukų, kuriuos privalai užpildyti prieš etapus 2–6 (užstatas pagal automobilį, draudimas, atsakomybė, kilometražas, kuro politika, pristatymo zonos ir kaina, atsiėmimo vieta, darbo laikas, juridiniai rekvizitai, hero video šaltinis, papildomos paslaugos ir jų kainos, promo kodai, refund politika, atšaukimo terminai, gedimo procedūra ir t.t.).
10. **Ką BŪTINA išsaugoti** — sąrašas: `create_reservation` RPC serverinis konfliktų tikrinimas, Stripe dvigubas kelias (Carbonus + Sanlab), invoice CAR/CARW prefix logika, contract PDF c2 versija, `last_email_sent_status` apsauga nuo dublių, `car_blocked_dates` RLS grants, image protection (data-allow-save exception), draft juodraščiai `localStorage`.
11. **Etapų sekos rekomendacija** su rizikos atidėjimu:
    - **Anksti (žema rizika):** Etapas 1 (design system), Etapas 6 (About/FAQ/Contact/Guide redizainas), Etapas 8 (SEO be URL keitimo), Etapas 9 (analitika), Etapas 10 (privatumo/slapukų UI), Etapas 11 (greitis/a11y), Etapas 7 (admin patobulinimai).
    - **Vidury:** Etapas 2 (pagrindinis puslapis + hero), Etapas 3 (katalogas), Etapas 4 (automobilio puslapis) — dizainas keičiasi, bet rezervacijos motoras nepaliečiamas.
    - **Pabaigoje (aukšta rizika, atidedami):** Etapas 5 (rezervacijos proceso perkūrimas), Etapas 8-URL (marke-modelis-metai + 301), Etapas 13 (paleidimas).
12. **Techninės rizikos** — kurie pakeitimai gali paliesti pinigų srautą arba SEO reitingus, kokie rollback žingsniai reikalingi.

### Ko NEDARYSIU šiame etape

- Nekeisiu jokių failų, išskyrus `docs/AUDIT-2026.md` sukūrimą.
- Nevykdysiu Supabase migracijų.
- Nediegsiu jokių edge funkcijų.
- Nekurstyliuoju UI.
- Nesuteikiu galutinių verslo tekstų — tik pažymiu, kur reikia tavo įvesties.

### Įrankiai, kuriuos naudosiu tik SKAITYMUI

- `code--view` / `rg` — projekto failams.
- `supabase--read_query` — realioms lentelėms/politikoms/eilučių pavyzdžiams.
- `supabase--linter` — RLS ir konfigūracijos spragoms.
- `seo_chat--list_findings` — dabartinės SEO būklės.

### Po ETAPO 0

Grįžtu su:
- pilnu `docs/AUDIT-2026.md`,
- trumpu chat santraukos pranešimu (top-10 kritinių radinių),
- **ETAPO 1 planu** (design system tokenai, tipografija, komponentai) — patvirtinsi atskirai prieš pradedant.

Kiekvienas paskesnis etapas gaus savo `plan--create` su: apimtimi, failais, migracijų (jei būtinos) rollback SQL, testų sąrašu, rankinių patikrinimų sąrašu. Nepradedu kito etapo, kol dabartinis neaprobuotas.

---

**Patvirtink ir pradedu ETAPĄ 0 (tik audito failo rašymas).**
