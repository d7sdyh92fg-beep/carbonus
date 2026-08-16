# Nauji administratoriaus naudotojai ir teisės

## Ką kuriame

Trys naudotojai su skirtingomis teisėmis admin skydelyje:

| Naudotojas | Rolė | Ką mato |
|---|---|---|
| info@carbonus.lt | savininkas (owner) | Viską + naują „Naudotojai" skiltį |
| tomas@carbonus.lt | administratorius | Viską, išskyrus „El. paštas" skiltį |
| laimis@carbonus.lt | autoparko vadybininkas | Suvestinė, Kalendorius, Automobilių parkas (redagavimas), Nauja rezervacija |

Laimis nemato: Klientai, Istorija, Sąskaitos, Nuolaidos, Šiukšlinė, El. paštas.

## Kaip veiks

1. **Rolės duomenų bazėje** — prie esamo `app_role` tipo pridedamos reikšmės `owner` ir `fleet_manager`. Rolės saugomos jau esančioje `user_roles` lentelėje (atskirai nuo profilių — saugumo reikalavimas). Esamos `has_role(..., 'admin')` taisyklės lieka veikti: owner ir fleet_manager taip pat gaus `admin` įrašą, kad RLS politikos veiktų, o skiltims valdyti naudosime papildomą rolę.
2. **Naudotojų sukūrimas** — nauja Edge funkcija `admin-manage-users`, kuri su service role raktu sukuria naudotojus, keičia slaptažodžius ir grąžina naudotojų sąrašą. Funkcija leidžia veiksmus tik prisijungusiam `owner` (JWT patikra serverio pusėje).
3. **Slaptažodžiai** — info@carbonus.lt slaptažodis pakeičiamas į naują; kitos to naudotojo teisės nesikeičia.
4. **Admin skydelio filtras** — `Admin.tsx` skiltys (tabs) filtruojamos pagal rolę; taip pat blokuojamas tiesioginis turinys, ne tik meniu punktas.
5. **„Naudotojai" skiltis** (matoma tik owner) — sąrašas: el. paštas, rolė, paskutinis prisijungimas, sukūrimo data; veiksmai: pakeisti slaptažodį, pakeisti rolę, sukurti naują naudotoją.

## Dėl slaptažodžių matomumo (svarbu)

Slaptažodžių Supabase nesaugo atviru tekstu — jie yra vienkrypčiai užšifruoti, todėl techniškai neįmanoma jų parodyti sąraše, o saugoti kopiją atviru tekstu būtų rimta saugumo spraga (nutekėjus DB, nutekėtų ir visi slaptažodžiai).

Vietoje to „Naudotojai" skiltyje bus:
- mygtukas „Nustatyti naują slaptažodį" — owner įveda naują slaptažodį, jis iškart parodomas nukopijuoti ir perduoti darbuotojui;
- pradiniai slaptažodžiai, kuriuos dabar nurodėte, bus nustatyti kuriant paskyras.

## Techninės detalės

- Migracija: `ALTER TYPE app_role ADD VALUE 'owner'`, `'fleet_manager'`; pagalbinė funkcija `get_user_role(uuid)`; RLS lieka pagrįstos `has_role(..., 'admin')`.
- Edge funkcija `supabase/functions/admin-manage-users/index.ts`: veiksmai `list`, `create`, `set_password`, `set_role`; kiekvienas tikrina, ar kviečiantysis turi `owner` rolę.
- `src/hooks/useAdminRole.ts` (naujas) — grąžina dabartinę rolę ir leidžiamų skilčių sąrašą.
- `src/components/admin/UsersPanel.tsx` — naudotojų sąrašo ir valdymo UI.
- `src/pages/Admin.tsx` — skilčių filtravimas pagal rolę + nauja „Naudotojai" skiltis.
