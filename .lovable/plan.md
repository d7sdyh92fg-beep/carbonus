# ETAPAS 0 — Carbonus.lt pilna sistemos analizė

> Šis dokumentas yra tik audito rezultatas. Kodo pakeitimų dar nedaroma. Patvirtinus, pereisime prie ETAPO 1 (dizaino sistema).

---

## 1. Techninis stackas (patvirtinta)

- React 18 + TypeScript + Vite 5
- Tailwind CSS v3 + shadcn/ui
- Supabase (Auth, DB, Storage, Edge Functions)
- Stripe + Montonio (dvi mokėjimo integracijos)
- Resend (el. laiškai)
- i18n: LT/EN per `src/lib/translations.ts`
- Hostingas: Lovable (`carbonus.lovable.app` + custom domain `carbonus.lt`)

---

## 2. Esami puslapiai / maršrutai

Iš `src/App.tsx` (21 maršrutas):

| Route | Paskirtis | Būsena |
|---|---|---|
| `/` | Pagrindinis (Hero, Fleet, Trust) | Veikia, dizainas neatitinka „Dzūkijos premium" krypties |
| `/fleet` | Automobilių sąrašas | Statinis katalogas, nėra realaus prieinamumo filtro |
| `/car/:slug` | Automobilio detalė | Veikia, yra rezervacijos forma |
| `/booking-review` | Rezervacijos peržiūra | Veikia, sudėtingas komponentas |
| `/payment-success`, `/payment-cancel` | Stripe grįžimas | Veikia |
| `/montonio-success`, `/montonio-cancel` | Montonio grįžimas | Veikia |
| `/about`, `/contacts`, `/faq`, `/terms`, `/privacy`, `/cookies` | Statiniai | Turinys hardcoded |
| `/blog`, `/blog/:slug` | Kelionių gidas | Veikia, DB pagrindu |
| `/admin`, `/auth` | Administravimas | Veikia, plati funkcionalumo apimtis |
| `/in-person-booking` | Vietinė rezervacija | Neseniai atnaujinta (juodraščiai) |
| `*` | 404 | Yra |

**Trūksta iš siūlomos struktūros:** `/kaip-tai-veikia`, `/valdyti-rezervacija`, `/paslaugos/*`, LT slug URL (`/automobiliai`, `/rezervacija/...`).

---

## 3. Rezervacijos logika (patvirtinta iš kodo)

**Srautas:**
```
CarDetail → BookingForm → ReservationReview → create_reservation RPC
    → Stripe/Montonio checkout → webhook → send-status-email → PDF
```

**Kaina:** `src/config/pricing.ts` + DB `cars` lentelės 3 pakopos (1–3d, 3–7d, 7+d). Jokio hardcode. ✅
**Trukmė:** `ceil(valandos/24)`, 120 min grace period nekainuoja. ✅
**Dvigubos rezervacijos apsauga:** Serverio pusėje per `create_reservation` RPC — `DATE_CONFLICT` + `DATE_BLOCKED` (neseniai pridėta). ✅
**Užstatas:** Fizinis, atsiimant (200€ / 400€ Premium). Ne per Stripe. ✅
**El. laiškai:** `send-status-email` edge function, priklauso nuo `status` + `contract_signatures` lentelės. ✅
**Sutartis:** `generate-contract-pdf` (4 psl. c2 versija).

**Rastos silpnos vietos:**
- Frontend datų validacija ir serverio patikra vietomis dubliuojasi — reikia audito, ar visur naudojamas RPC.
- Nėra „hold" laikmačio neapmokėtoms rezervacijoms (`awaiting_payment` gali gulėti neribotai — matoma Rolandas Stungurys atveju).
- Stripe/Montonio webhook patvirtinimo mechanizmas neaudituotas šioje sesijoje.

---

## 4. Supabase struktūra (11 lentelių)

| Lentelė | Paskirtis | Pastaba |
|---|---|---|
| `cars` (27 col.) | Parkas + kainos + savybės | Verslo tiesa čia |
| `reservations` (45 col.) | Rezervacijos | Plati, gerai apgalvota |
| `customers` (15 col.) | Klientai | Adresas privalomas |
| `car_blocked_dates` (9 col.) | Rankiniai blokai + phone rezervacijos | Neseniai GRANT'ai sutvarkyti |
| `contract_signatures` (7 col.) | Skaitmeniniai parašai | |
| `invoices` (16 col.) | Sąskaitos faktūros (CAR/CARW) | |
| `car_service_records` (13 col.) | Techninis aptarnavimas | |
| `profiles`, `user_roles` | Auth + roles (admin per `has_role`) | Saugu ✅ |
| `newsletter_subscribers`, `rate_limits` | Pagalbinės | |

**RPC funkcijos:** `create_reservation`, `create_or_get_customer`, `has_role`, `is_current_user_admin`, `get_next_invoice_number`, `handle_new_user` (trigger), `calculate_cancellation_deadline`.

**Storage:** `contracts` (private), `driver-licenses` (public — **saugumo rizika, reikia peržiūrėti**).

**Edge functions:** 18 vnt. — mokėjimai, laiškai, PDF, adminas.

---

## 5. Kritinės problemos (prioritetų tvarka)

### 🔴 Kritinis
1. **`driver-licenses` bucket yra public** — asmens dokumentai neturi būti viešai pasiekiami. Reikia perkelti į private + signed URLs.
2. **Nėra „awaiting_payment" laukimo laiko** — neapmokėtos rezervacijos gali blokuoti datas neribotai.
3. **Stripe webhook idempotency ir signature verification neaudituota** šioje sesijoje.

### 🟠 Aukštas
4. **URL struktūra ne LT** — `/car/`, `/fleet`, `/booking-review` vietoj `/automobiliai/`, `/rezervacija/`. SEO nuostolis.
5. **Statiniai puslapiai (about/faq/terms/contacts) hardcoded** — verslas negali savarankiškai atnaujinti.
6. **Nėra `/valdyti-rezervacija`** — klientas negali savarankiškai matyti savo rezervacijos.
7. **Kainodara ir sąlygos vietomis pas Frontend** (`src/config/pricing.ts` konstanta) — reikia audito, ar viskas tikrai iš DB.

### 🟡 Vidutinis
8. Dizainas neatitinka „Dzūkijos premium" krypties — dabartinės spalvos ir tipografija generinės.
9. Nėra realaus prieinamumo filtro `/fleet` puslapyje pagal pasirinktas datas.
10. Nėra strukturinių duomenų (LocalBusiness, Product, Offer, BreadcrumbList).
11. `/in-person-booking` nėra apsaugotas nuo ne-admin (reikia patikrinti).

### 🟢 Žemas
12. `Carbonus-Augimo-Strategija-2026.pdf` ir kiti PDF — jau padaryta.
13. Blog naujesni pirmi — jau padaryta.

---

## 6. Ką BŪTINA išsaugoti (nekeičiama)

- `create_reservation` RPC logika ir `DATE_CONFLICT`/`DATE_BLOCKED` mechanizmas.
- Kainos modelis `cars` lentelėje (3 pakopos).
- 24h ceil trukmės formulė + 120 min grace period.
- Sutarties PDF generavimo mechanizmas (`generate-contract-pdf` c2 versija).
- El. laiškų srautas (`send-status-email` + parašų sąlygos, kaip tik ką sutvarkyta).
- Stripe routing: Citroën → Sanlab Stripe.
- Užstato politika (fizinis, ne per Stripe).
- Kalendoriaus statusai (`paid`, `pending`, `requested`, `picked_up`, `awaiting_payment`) — visi jie blokuoja datas.
- Invoice numeracija (CAR / CARW prefiksai).
- Draft juodraščiai `InPersonBooking` su composite keys.

---

## 7. Techninė skola

- Dubliuota mokėjimų logika (Stripe + Montonio) — sunku palaikyti.
- `Admin.tsx` ir susiję komponentai išaugę į labai plačius failus.
- Nėra automatinių testų (kainų, prieinamumo, webhook).
- `translations.ts` failas didelis, nėra namespacing.
- Nėra sitemap generatoriaus (statiniai puslapiai).
- Video/nuotraukų optimizavimo pipeline nėra (AVIF/WebP).

---

## 8. Ko trūksta iš verslo pusės (reikia gauti prieš toliau)

Prieš pradedant realų redizainą, reikia patvirtinimo dėl:

1. **Ar keičiame URL struktūrą į LT slug** (`/automobiliai`, `/rezervacija`)? Tai reikalauja 301 redirect visų senų URL — didelis SEO žingsnis.
2. **Ar dabartinės spalvos (juoda/auksinė esamas premium akcentas) keičiamos į „Dzūkijos premium" žalią paletę** (#0B2E26 pušų žalia + #F4F0E8 kreminis)?
3. **Ar verslas turi realų video** hero sekcijai, ar reikia palikti placeholder?
4. **Ar `/paslaugos/*` skiltys realiai teikiamos** (pristatymas, ilgalaikė, verslui)? Nekursime, jei nebūna.
5. **Ar reikia `/valdyti-rezervacija` puslapio klientui** (savarankiška peržiūra per unikalią nuorodą)?
6. **Kokia `awaiting_payment` galiojimo trukmė** turi būti (30 min? 24h?), po kurios rezervacija automatiškai atlaisvina datas?
7. **Ar sutinkame perkelti `driver-licenses` bucket į private** (rekomenduojama saugumo sumetimais)?

---

## 9. Įgyvendinimo etapų planas (patikslintas)

| Etapas | Apimtis | Trukmė (santykinė) |
|---|---|---|
| **0. Auditas** ✅ | Šis dokumentas | Baigta |
| **1. Dizaino sistema** | Spalvos, tipografija, Nav, Footer, bendri komponentai | M |
| **2. Pagrindinis** | Hero + rezervacijos forma + 8 sekcijos | L |
| **3. Katalogas** | Realus prieinamumas + filtrai | M |
| **4. Auto puslapis** | Sticky booking card + galerija + SEO URL | M |
| **5. Rezervacijos srautas** | 6 žingsnių wizard + webhook auditas + hold laikmatis | L |
| **6. Statiniai puslapiai** | Apie, DUK, Kontaktai, Gidas | M |
| **7. Adminas** | Papildyti trūkstamas funkcijas (turinio valdymas) | M |
| **8. SEO** | Metadata, sitemap, structured data, redirects | S |
| **9. Analitika** | GA4/GTM event auditas | S |
| **10. Teisiniai/slapukai** | Consent Manager | S |
| **11. Greitis + a11y** | Vaizdai, code splitting, focus | M |
| **12. Testai** | Unit + E2E kritiniams srautams | M |
| **13. Paleidimas** | Checklist + rollback | S |

---

## 10. Pirmo realaus etapo (ETAPAS 1) apimtis

Kai patvirtinsi šį auditą + atsakysi į 8 skyriaus klausimus, pradedame ETAPĄ 1:

1. Perrašyti `src/index.css` spalvų tokenus į „Dzūkijos premium" paletę.
2. Prijungti Manrope + Inter šriftus (arba palikti esamus, jei tinka).
3. Atnaujinti `tailwind.config.ts` (spacing, radiuses, shadows).
4. Perdaryti `Navigation` + `Footer` komponentus.
5. Sukurti/atnaujinti bendrus komponentus: Button, Card, Input, Modal, Toast, Skeleton, Empty state.
6. Patikrinti, kad senoji rezervacija ir mokėjimai vis dar veikia (regresijos testas rankiniu būdu).

**Nebus liečiama:** `create_reservation` RPC, Stripe webhook, PDF generavimas, email srautas.

---

**Laukiu tavo patvirtinimo ir atsakymų į 8 skyriaus klausimus prieš pradedant ETAPĄ 1.**
