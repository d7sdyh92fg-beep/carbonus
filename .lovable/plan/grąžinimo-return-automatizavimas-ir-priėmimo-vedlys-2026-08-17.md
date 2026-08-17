# Grąžinimo (return) automatizavimas ir priėmimo vedlys

Idėja gera ir logiška – tai natūralus kitas CRM etapas. Siūlau ją įgyvendinti be perteklinio sudėtingumo: viena nauja lentelė patikroms, keli laukai rezervacijoje, vienas cron jobas ir naujas blokas admin skydelio viršuje.

## Statusų srautas

```text
awaiting_payment -> paid -> picked_up -> (return_due) -> inspecting -> completed
                                                       \-> needs_resolution
```

Naujus etapus laikome ne kaip atskirus `status`, o kaip:
- `status`: paliekam esamą rinkinį + `needs_resolution`
- `return_stage`: `none | due_soon | overdue | inspecting | resolved` (išvestinis/atnaujinamas cron)

Taip nesugriaunam esamų filtrų, kalendoriaus ir el. laiškų logikos.

## 1. Duomenų bazė

Nauji laukai `reservations`:
- `return_stage` (text, default 'none')
- `return_reminder_sent_at`, `admin_return_alert_sent_at` (timestamptz) – apsauga nuo dublikatų
- `inspection_started_at`, `completed_at`
- `deposit_status` (text: `held | to_refund | refunded | partially_kept`)

Nauja lentelė `reservation_inspections`:
- `reservation_id`, `checklist` (jsonb: grąžintas, kuras, rida, salonas, kėbulas, padangos/stiklai, raktai/dokumentai)
- `mileage_end`, `fuel_level`, `photos` (text[] – storage keliai), `notes`
- `issues` (text[]: `damage | fuel | cleaning | mileage | late | documents`)
- `extra_charge` (numeric), `admin_id`, `created_at/updated_at`
- GRANT + RLS: tik admin rolės.

Nuotraukoms – naujas privatus bucket `inspections` su signed URL (kaip `driver-licenses`).

## 2. Cron (kas 5 min)

Nauja edge funkcija `return-watchdog` (service role, be JWT tik su cron secret):
- randa `picked_up` rezervacijas, kurių grąžinimas per <24 h – siunčia klientui `send-return-reminder` (jei dar nesiųsta) ir nustato `return_stage='due_soon'`
- likus <2 h arba praėjus terminui – `return_stage='overdue'`, siunčia adminui vidinį pranešimą + el. laišką (vienkartinis)
- niekada automatiškai neužbaigia rezervacijos

Įjungiam `pg_cron` + `pg_net`, jobas kas 5 min.

## 3. Admin skydelis

- Naujas blokas viršuje: **„Šiandien grąžinami automobiliai“** – ryškios kortelės („Automobilis grąžinamas 15:00“, vėluojantys – raudoni), rikiavimas pagal laiką, mygtukas **„Pradėti grąžinimo patikrą“**.
- Hero juostoje – akcentas, kai yra artėjančių/vėluojančių grąžinimų (skaičius + artimiausias laikas).
- Realtime prenumerata `reservations` lentelei, kad kortelė iškiltų be perkrovimo.

## 4. Priėmimo vedlys (modalas)

Naujas `src/components/admin/ReturnInspectionModal.tsx`:
- checklist su 7 punktais, ridos ir kuro įvedimas, pastabos, nuotraukų įkėlimas
- **„Užbaigti rezervaciją“** (aktyvus, kai checklist pilnas): `status='completed'`, `return_stage='resolved'`, `deposit_status='to_refund'`, automobilis vėl laisvas, rezervacija į istoriją; siunčiamas užbaigimo + atsiliepimo laiškas klientui (nuoroda į /atsiliepimas) ir suvestinė adminui
- **„Fiksuoti problemą“**: pasirenkamos problemos, mokestis, nuotraukos, komentaras -> `status='needs_resolution'`, automobilis lieka neprieinamas, laiškai nesiunčiami iki išsprendimo

## 5. El. laiškai

- Klientui: priminimas prieš 24 h (esama `send-return-reminder`, prijungiam prie cron), užbaigimo + atsiliepimo laiškas (nauja funkcija `send-completion-email`, LT/EN)
- Adminui: grąžinimo suvestinė (kuras, rida, problemos, mokestis)

## Techninės pastabos

- Migracija: laukai + `reservation_inspections` su GRANT/RLS; bucket + storage politika.
- `return-watchdog` autentifikuojasi per cron secret headerį; visi siuntimai idempotentiški per `*_sent_at`.
- Esamos funkcijos `send-return-reminder`, `send-feedback-request` naudojamos pakartotinai; nekuriam dublikatų.

## Eiliškumas

1. DB migracija + bucket
2. Cron funkcija + planavimas
3. Admin blokas „Šiandien grąžinami“ + hero akcentas
4. Priėmimo vedlys ir užbaigimo/problemos srautai
5. Užbaigimo laiškai
