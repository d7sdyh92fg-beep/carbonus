import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContractRequest {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  signatureData: string;
  pickupTime?: string;
  returnTime?: string;
  language?: string;
}

type Lang = 'lt' | 'en';

// ============================================================
// TRANSLATIONS (LT / EN)
// ============================================================
const T = {
  contractTitle:        { lt: 'Transporto priemonės nuomos sutartis',                    en: 'Vehicle Rental Agreement' },
  no:                   { lt: 'Nr.',                                                     en: 'No.' },
  city:                 { lt: 'Druskininkai',                                            en: 'Druskininkai' },

  sec1:                 { lt: 'I. Nuomos sutarties objektas.',                            en: 'I. Subject of the Rental Agreement.' },
  sec2:                 { lt: 'II. Automobilio priėmimas ir grąžinimas.',                 en: 'II. Vehicle Handover and Return.' },
  sec3:                 { lt: 'III. Automobilio naudojimas.',                             en: 'III. Use of the Vehicle.' },
  sec4:                 { lt: 'IV. Automobilio vagystė, avarijos ir kiti gedimai.',       en: 'IV. Vehicle Theft, Accidents and Other Damage.' },
  sec5:                 { lt: 'V. Automobilio draudimas ir kitos rinkliavos.',            en: 'V. Vehicle Insurance and Other Charges.' },
  sec6:                 { lt: 'VI. Apmokėjimo sąlygos.',                                  en: 'VI. Payment Terms.' },
  sec7:                 { lt: 'VII. Nuomininko atsakomybė.',                              en: 'VII. Lessee Liability.' },
  sec8:                 { lt: 'VIII. Nuomotojo atsakomybė.',                              en: 'VIII. Lessor Liability.' },
  sec9:                 { lt: 'IX. Baigiamosios nuostatos.',                              en: 'IX. Final Provisions.' },

  lessorLabel:          { lt: 'NUOMOTOJAS:',                                              en: 'LESSOR:' },
  lesseeLabel:          { lt: 'NUOMININKAS:',                                             en: 'LESSEE:' },
  vehicleLabel:         { lt: 'NUOMOJAMAS AUTOMOBILIS:',                                  en: 'RENTED VEHICLE:' },
  rentalStart:          { lt: 'NUOMOS PRADŽIA:',                                          en: 'RENTAL START:' },
  rentalEnd:            { lt: 'NUOMOS PABAIGA:',                                          en: 'RENTAL END:' },
  appendix:             { lt: 'Transporto priemonės nuomos sutarties Nr.',                en: 'Annex to Vehicle Rental Agreement No.' },
  appendix2:            { lt: 'PRIEDAS Nr.1',                                             en: 'ANNEX No. 1' },

  companyCode:          { lt: 'Įmonės kodas',                                             en: 'Company code' },
  director:             { lt: 'Direktorius Tomas Čepulis',                                en: 'Director Tomas Čepulis' },
  directorUpper:        { lt: 'TOMAS ČEPULIS',                                            en: 'TOMAS ČEPULIS' },
  address:              { lt: 'Adresas',                                                  en: 'Address' },
  phone:                { lt: 'Tel.',                                                     en: 'Tel.' },
  email:                { lt: 'El.p.',                                                    en: 'Email' },
  bankAccount:          { lt: 'A.S.',                                                     en: 'IBAN' },
  bankName:             { lt: 'AB Artea bankas',                                          en: 'AB Artea bank' },
  personOrCompCode:     { lt: 'Asmens (įmonės) kodas',                                    en: 'Personal/Company code' },
  vatCode:              { lt: 'PVM kodas',                                                en: 'VAT code' },
  representative:       { lt: 'Atstovas',                                                 en: 'Representative' },

  model:                { lt: 'Modelis',                                                  en: 'Model' },
  plate:                { lt: 'Valstybinis numeris',                                      en: 'Licence plate' },
  yearMade:             { lt: 'Pagaminimo metai',                                         en: 'Year of manufacture' },
  fuel:                 { lt: 'Kuro tipas',                                               en: 'Fuel type' },
  transmission:         { lt: 'Pavarų dėžė',                                              en: 'Transmission' },
  handoverNote:         { lt: 'Perduodamas techniškai tvarkingas automobilis, su pilnu kuro baku, švarus.', en: 'The vehicle is handed over in proper technical condition, with a full fuel tank and clean.' },

  rentalDays:           { lt: 'Nuomos laikotarpis (paromis):',                            en: 'Rental period (days):' },
  totalRent:            { lt: 'Nuomos kaina (iš viso) (EUR):',                            en: 'Total rental price (EUR):' },
  dailyRate:            { lt: 'Nuomos kaina (už 1 parą) (EUR):',                          en: 'Daily rental rate (EUR):' },
  depositSum:           { lt: 'Užstato suma:',                                            en: 'Deposit amount:' },
  hourSuffix:           { lt: 'val.',                                                     en: '' },
  weekendNote1:         { lt: 'Jei automobilis grąžinamas savaitgalį, šventinę dieną ar po darbo valandų, taikomas papildomas', en: 'If the vehicle is returned on a weekend, public holiday, or outside business hours, an additional' },
  weekendNote2:         { lt: '20 EUR mokestis (neįskaitant PVM).',                       en: '20 EUR fee applies (VAT excluded).' },

  // Email
  emailSubject:         { lt: 'Nuomos sutartis Nr.',                                      en: 'Rental Agreement No.' },
  emailHeading:         { lt: '✅ Nuomos sutartis patvirtinta',                            en: '✅ Rental agreement confirmed' },
  emailDear:            { lt: 'Gerb.',                                                    en: 'Dear' },
  emailThanks:          { lt: 'Dėkojame, kad pasirinkote CARBONUS automobilių nuomą!',    en: 'Thank you for choosing CARBONUS car rental!' },
  emailReservationInfo: { lt: 'Rezervacijos informacija:',                                en: 'Reservation details:' },
  emailCar:             { lt: 'Automobilis:',                                             en: 'Vehicle:' },
  emailPickup:          { lt: 'Paėmimo data:',                                            en: 'Pickup date:' },
  emailReturn:          { lt: 'Grąžinimo data:',                                          en: 'Return date:' },
  emailTotal:           { lt: 'Bendra suma:',                                             en: 'Total amount:' },
  emailContractNo:      { lt: 'Sutarties Nr.:',                                           en: 'Contract No.:' },
  emailAttached:        { lt: '📎 Nuomos sutartis',                                       en: '📎 Rental Agreement' },
  emailAttachedDesc:    { lt: 'Sutartis pridėta prie šio laiško kaip PDF failas.',        en: 'The agreement is attached to this email as a PDF file.' },
  emailQuestions:       { lt: 'Klausimai? Susisiekite:',                                  en: 'Questions? Contact us:' },
  emailFooter:          { lt: 'CARBONUS automobilių nuoma',                               en: 'CARBONUS car rental' },

  fileName:             { lt: 'nuomos_sutartis',                                          en: 'rental_agreement' },
};

const tr = (key: keyof typeof T, lang: Lang) => T[key][lang] || T[key].lt;

// Section paragraphs (arrays) – LT/EN parallel
const PARAS = {
  p1: {
    lt: ['1. Šia Nuomos sutartimi (toliau – Sutartis) MB „Carbonus" (įmonės kodas – 307196558), atstovaujama direktoriaus Tomo Čepulio, (toliau – Nuomotojas) nuomoja automobilį Nuomininkui (toliau sutartyje – Šalys), Nuomininkas sutinka laikytis automobilio naudojimosi taisyklių, nustatytų šioje Sutartyje ir patvirtina tai savo parašu.'],
    en: ['1. By this Rental Agreement (hereinafter – the Agreement), MB "Carbonus" (company code – 307196558), represented by director Tomas Čepulis (hereinafter – the Lessor), rents the vehicle to the Lessee (hereinafter jointly – the Parties). The Lessee agrees to comply with the vehicle usage rules set out in this Agreement and confirms this by signature.'],
  },
  sectionII: {
    lt: [
      '2. Nuomininkas, priimdamas automobilį, savo parašu patvirtina, kad automobilį gavo tvarkingą ir geros (tinkamos saugiai eksploatacijai) techninės būklės, su visais papildomais priedais, įskaitant automobilio dokumentus.',
      '3. Grąžinimo metu automobilis privalo būti tokios techninės būklės ir komplektacijos, kokios buvo išnuomotas, t.y. jo priėmimo naudotis momentu, bet atsižvelgiant į natūralų nusidėvėjimą.',
      '4. Automobilis grąžinamas Nuomotojui sutartyje ar jos prieduose nustatytu laiku.',
      '5. Darbo valandomis nuomojamas automobilis paimamas ir pristatomas (grąžinamas) į Sutartyje nustatytą ar Šalių sutartą vietą. Jei automobilis grąžinamas po darbo valandų ar savaitgaliais (švenčių dienomis), jam taikomos papildomos grąžinimo sąlygos (kainos) Šalių suderintos ir patvirtintos abipusiu Šalių susitarimu arba nustatytos pasirašant Sutartį, šios Sutarties priede.',
      '6. Automobilis išnuomojas ir perduodamas Nuomininkui su pilnu degalų baku, švariu (nuplautu) kėbulu ir tvarkingu salonu. Grąžindamas automobilį Nuomininkas užtikrina jo grąžinimą taip pat su pilnu degalų baku, nuplautu kėbulu ir tvarkingu salonu.',
      '7. Tuo atveju, jei automobilis grąžinimas pažeidžiant Sutarties 6 punkto sąlygas, Nuomininkas Nuomotojui moka kompensaciją, kuri sudaro 1.5 EUR (su PVM) už 1 litrą degalų, padauginus iš trūkstamo iki pilno kuro bako litrų kiekio, o tais atvejais, jei automobilis grąžinamas nešvariu kėbulu ir (ar) netvarkingu salonu, Nuomininkas Nuomotojui atitinkamai moka – 20 EUR baudą už nenuplautą automobilį ir 20 EUR baudą už netvarkingą saloną.',
      '8. Jei Nuomininkas pažeidžia Sutarties sąlygas, vykdo jas netinkamai arba kai numatoma, jog Nuomininkas negalės tinkamai įvykdyti savo pareigų, kylančių iš šios Sutarties, Nuomotojas turi besąlygišką teisę atsiimti automobilį anksčiau sutarto (numatyto) laiko, esant poreikiui – kreiptis į teisėsaugos organus ar kitus subjektus dėl automobilio paieškos paskelbimo.',
      '9. Jei Nuomininkas negrąžina automobilio 24 valandų laikotarpyje, kurios pradedamos skaičiuoti po Sutartyje nustatyto grąžinimo termino pabaigos, o taip pat jokia Nuomotojui priimtina ar sutarta komunikavimo forma, apie vėlavimą grąžinti automobilį neinformuoja Nuomotojo, Nuomotojas turi teisę kreiptis į teisėsaugos organus dėl turto (automobilio) vagystės, jo sunaikinimo ar sugadinimo ir reikalauti iš Nuomotojo žalos atlyginimo, išskyrus atvejus, jeigu tą žalą Nuomotojui atlygina draudimo kompanija arba atlygina tą dalį žalos, kurios nepadengia draudimo kompanija.',
    ],
    en: [
      '2. Upon accepting the vehicle, the Lessee confirms by signature that the vehicle has been received in proper and good (suitable for safe operation) technical condition, with all additional accessories, including the vehicle documents.',
      '3. Upon return, the vehicle must be in the same technical condition and configuration as when it was rented, i.e. at the moment of handover, taking natural wear and tear into account.',
      '4. The vehicle shall be returned to the Lessor at the time set out in the Agreement or its annexes.',
      '5. During business hours, the rented vehicle is collected and delivered (returned) to the place specified in the Agreement or agreed by the Parties. If the vehicle is returned outside business hours or on weekends (public holidays), additional return conditions (charges) apply, agreed and confirmed by mutual agreement of the Parties or set out in an annex to this Agreement at the time of signing.',
      '6. The vehicle is rented and delivered to the Lessee with a full fuel tank, clean (washed) bodywork, and a tidy interior. When returning the vehicle, the Lessee shall return it likewise with a full fuel tank, washed bodywork, and tidy interior.',
      '7. If the vehicle is returned in breach of clause 6, the Lessee shall pay the Lessor compensation amounting to 1.5 EUR (incl. VAT) per litre of fuel, multiplied by the number of litres missing from a full tank. If the vehicle is returned with dirty bodywork and/or untidy interior, the Lessee shall pay the Lessor a 20 EUR penalty for an unwashed vehicle and a 20 EUR penalty for an untidy interior.',
      '8. If the Lessee breaches the Agreement, performs it improperly, or it becomes foreseeable that the Lessee will not be able to duly perform their obligations under this Agreement, the Lessor has the unconditional right to repossess the vehicle earlier than the agreed (scheduled) time and, if necessary, to contact law enforcement or other authorities to declare the vehicle searched for.',
      '9. If the Lessee fails to return the vehicle within 24 hours after the return deadline set in the Agreement, and does not inform the Lessor about the delay through any acceptable or agreed form of communication, the Lessor has the right to contact law enforcement regarding theft, destruction, or damage to the property (vehicle) and to demand compensation for damages from the Lessee, except where such damage is covered by the insurance company or the part of the damage not covered by it.',
    ],
  },
  sectionIIIpre: {
    lt: [
      '10. Nuomos laikotarpiu automobilį gali vairuoti tik Nuomininkas arba Nuomininko darbuotojas, jei nuomos sutartis sudaroma su įmone, turintis teisę vairuoti įmonės automobilius ir atitinkamą įgaliojimą vairuoti nuomojamą transporto priemonę. Už galimą kaltę ir žalą sukeliančius veiksmus bei pasekmes, atsiradusias ar kylančias dėl vairuotojos nuomojamos transporto priemonės, atsakingas nuomininkas/įmonė, išskyrus atvejus, jeigu ją pilna apimtimi Nuomotojui atlygina draudimo kompanija.',
      '11. Nuomininkas užtikrina saugų ir tinkamą automobilio eksploatavimą visą nuomos laikotarpį, užrakina visas automobilio dureles, palikdamas automobilį be priežiūros net ir trumpam laikui.',
      '12. Nuomininkas įsipareigoja saugoti nuomojamos transporto priemonės dokumentus ir raktelius bei užtikrinti jų nepatekimą tretiesiems asmenims.',
      '13. Pagal šią Sutartį Nuomininkui draudžiama:',
    ],
    en: [
      '10. During the rental period, the vehicle may be driven only by the Lessee or, where the rental agreement is concluded with a company, by an employee of the Lessee who is entitled to drive the company\'s vehicles and holds the relevant authorisation to drive the rented vehicle. The Lessee/company is liable for any actions and consequences causing fault and damage arising from the driver of the rented vehicle, except where such damage is fully compensated to the Lessor by the insurance company.',
      '11. The Lessee shall ensure the safe and proper operation of the vehicle throughout the rental period and shall lock all doors when leaving the vehicle unattended, even briefly.',
      '12. The Lessee undertakes to safeguard the documents and keys of the rented vehicle and to prevent their access by third parties.',
      '13. Under this Agreement, the Lessee is prohibited from:',
    ],
  },
  prohibitions: {
    lt: [
      '13.1. Naudoti nuomojamą automobilį keleivių vežimui už atlygį;',
      '13.2. Naudoti automobilį priekabų ir kitų automobilių vilkimui;',
      '13.3. Naudoti automobilį prekių pervežimui, pažeidžiant Lietuvos Respublikos teisės aktus, reglamentuojančius krovinių vežimą.',
      '13.4. Naudoti automobilį nusikalstamai veiklai;',
      '13.5. Vairuoti automobilį neblaiviam ar apsvaigusiam nuo psichotropinių medžiagų ir stipraus poveikio medikamentų, turinčių poveikį reakcijai ir atidumui;',
      '13.6. Naudoti automobilį sportiniuose renginiuose ar kitokio pobūdžio eisme, kuriuose nesilaikoma saugaus eismo ir vairavimo taisyklių;',
      '13.7. Vežti didelės vertės daiktus, neturint jų nuosavybę patvirtinančių dokumentų;',
      '13.8. Vežti degius skysčius bei medžiagas, ginklus, sprogmenis, narkotines ir psichotropines medžiagas ir kitus daiktus, kurių laikymą, disponavimą, naudojimą, gabenimą ir platinimą draudžia teisės aktai.',
      '13.9. Rūkyti automobilyje (bauda 50 EUR).',
    ],
    en: [
      '13.1. Using the rented vehicle for transporting passengers for hire;',
      '13.2. Using the vehicle to tow trailers or other vehicles;',
      '13.3. Using the vehicle to transport goods in breach of the laws of the Republic of Lithuania regulating cargo transportation.',
      '13.4. Using the vehicle for criminal activity;',
      '13.5. Driving the vehicle while intoxicated or under the influence of psychotropic substances or strong-acting medication affecting reaction or attention;',
      '13.6. Using the vehicle in sporting events or other traffic where safe driving rules are not observed;',
      '13.7. Transporting valuables without documents proving ownership;',
      '13.8. Transporting flammable liquids and substances, weapons, explosives, narcotic and psychotropic substances, or other items whose possession, handling, use, transport, or distribution is prohibited by law.',
      '13.9. Smoking in the vehicle (50 EUR penalty).',
    ],
  },
  sectionIIIpost: {
    lt: [
      '14. Nuomininkas/nuomojamos transporto priemonės vairuotojas privalo laikytis saugaus eismo taisyklių ir šios Sutarties sąlygų.',
      '15. Nuomininkas privalo užtikrinti savalaikę periodinę tepalo lygio ir kitų automobilio skysčių lygio patikrą ir imtis priemonių jų papildymui, taip pat sekti oro slėgį automobilio padangose ir, esant poreikiui, imtis priemonių savalaikiam jo padidinimui.',
      '16. Sugedus automobiliui, jo remontą atlikti tik suderinus (vietą, laiką, kaštus ir t.t.) su Nuomotoju ir gavus jo leidimą. Remonto išlaidas apmoka Nuomotojas, išskyrus atvejus, jei Šalys nesutaria kitaip.',
      '17. Nuomininkas privalo imtis priemonių ir užtikrinti, kad tamsiu paros metu automobilis būtų maksimaliai apsaugotas nuo vagysčių ir sunaikinimo/sugadinimo.',
    ],
    en: [
      '14. The Lessee/driver of the rented vehicle shall comply with traffic safety rules and the terms of this Agreement.',
      '15. The Lessee shall ensure timely periodic checks of oil and other fluid levels and take measures to top them up, and shall monitor tyre pressure and take timely measures to increase it where necessary.',
      '16. In the event of vehicle malfunction, repairs shall be carried out only after agreement with the Lessor (location, time, cost, etc.) and with the Lessor\'s consent. Repair costs are borne by the Lessor unless the Parties agree otherwise.',
      '17. The Lessee shall take measures to ensure that, at night, the vehicle is maximally protected against theft and destruction/damage.',
    ],
  },
  sectionIV: {
    lt: [
      '18. Įvykus autoįvykiui, avarijai, gaisrui, pastebėjus trečių asmenų padarytą žalą automobiliui ar jo vagystės atveju, Nuomininkas privalo nedelsdamas (ne vėliau kaip per 8 h.) kreiptis į atitinkamas institucijas ir apie tai informuoti Nuomotoją.',
      '19. Nuomininkas patvirtina, jog žino, kad teisėsaugos institucijų atstovų išduoti dokumentai, transportavimo įmonių pažymos yra svarbios ir gali būti pagrindu nustatant žalos lygį ir išmokant draudimo išmoką už automobilio praradimą, sugadinimą ar sunaikinimą, o taip pat pateikiant reikalavimus (ieškinius) tretiesiems asmenims (kaltininkams).',
      '20. Nuomininkas įsipareigoja saugoti įrodymų objektus (daiktus, pėdsakus, liudininkų parodymus, fotografijas ir pan.), įvykių dalyvių ir liudininkų kontaktinę informaciją. Taip pat Nuomininkas įspėtas ir žino, jog jam draudžiama pasirašyti bet kokius dokumentus, galinčius pakenkti Nuomotojo reputacijai, kaltinančiais Nuomotoją dėl žalos ar nuostolių atlyginimo ir pan.',
      '21. Nuomininkas ar nuomojamos transporto priemonės teisėtas naudotojas (įgaliotas vairuotojas) privalo imtis priemonių ir apsaugoti Nuomotojo ir automobilio draudimo kompanijos teisėtus interesus jei nuomos laikotarpiu įvyksta autoįvykis, avarija, automobilio apgadinimas, sunaikinimas ar vagystė, t.y.:',
    ],
    en: [
      '18. In the event of a road accident, collision, fire, third-party damage to the vehicle, or theft, the Lessee shall immediately (no later than within 8 hours) contact the relevant authorities and inform the Lessor.',
      '19. The Lessee acknowledges that documents issued by law enforcement authorities and certificates from towing companies are important and may serve as the basis for determining the amount of damage and for the payment of insurance compensation for the loss, damage, or destruction of the vehicle, as well as for filing claims against third parties (the at-fault persons).',
      '20. The Lessee undertakes to preserve evidentiary objects (items, traces, witness statements, photographs, etc.) and the contact details of participants and witnesses. The Lessee is also warned and aware that they are prohibited from signing any documents that could harm the Lessor\'s reputation, accusing the Lessor of being liable for damage or losses, etc.',
      '21. The Lessee or the lawful user of the rented vehicle (authorised driver) shall take measures to protect the legitimate interests of the Lessor and the vehicle\'s insurance company in the event of a road accident, collision, damage, destruction, or theft of the vehicle during the rental period, namely:',
    ],
  },
  sectionIVsub: {
    lt: [
      '21.1. Nedelsiant gelbėti transporto priemonę, apsaugant ją nuo tolimesnio gedimo ir pašalinti priežastis, galinčias pakenkti automobilio vertei ir padidinti patiriamą žalą (nuostolius);',
      '21.2. Pranešti teisėsaugos institucijoms ir draudimo kompanijai apie įvykį, gauti su pranešimo užregistravimu susijusius dokumentus;',
      '21.3. Nedelsiant informuoti apie įvykį Nuomotoją.',
    ],
    en: [
      '21.1. Immediately rescue the vehicle, protecting it from further damage and eliminating causes that could reduce the vehicle\'s value and increase the damage (losses) suffered;',
      '21.2. Report the event to law enforcement authorities and the insurance company and obtain documents related to the registration of the report;',
      '21.3. Immediately inform the Lessor of the event.',
    ],
  },
  p22: {
    lt: ['22. Nuomotojas neatsako už žalą ir nuostolius, kuriuos patiria Nuomininkas nuomos laikotarpiu, tame tarpe ir dėl nuomojame automobilyje paliktų (sugadintų ar dingusių) Nuomininko daiktų ar turto.'],
    en: ['22. The Lessor is not liable for damage or losses suffered by the Lessee during the rental period, including damage to or loss of the Lessee\'s property left in the rented vehicle.'],
  },
  sectionV: {
    lt: [
      '23. Už automobilio draudimą atsakingas Nuomotojas. Automobilio privalomojo transporto priemonės valdytojo civilinės atsakomybės draudimas turi galioti Europos Sąjungos valstybėse, o jame turi būti nurodyta, kad automobilį vairuos ir tretieji asmenys.',
      '24. Už kelių mokesčių ir kitų rinkliavų, o taip pat baudų už kelių eismo taisyklių pažeidimus, padarytus vairuojant nuomojamą automobilį, atsakingas Nuomininkas ar įgaliotas asmuo, vairavęs automobilį.',
    ],
    en: [
      '23. The Lessor is responsible for vehicle insurance. The compulsory third-party motor liability insurance must be valid in the European Union countries and must indicate that third parties may also drive the vehicle.',
      '24. Road tolls and other charges, as well as fines for traffic offences committed while driving the rented vehicle, are the responsibility of the Lessee or the authorised person who drove the vehicle.',
    ],
  },
  sectionVI: {
    lt: [
      '25. Automobilis perduodamas tik sumokėjus nuomos kainą ir užstatą, jei toks mokamas.',
      '26. Į nuomos kainą įskaičiuoti visi Nuomotojo mokami mokesčiai ir kitos išlaidos, o taip pat automobilio draudimai, techniniai aptarnavimai.',
      '27. Nuomos įkainiai, nustatyti Sutarties prieduose, yra fiksuoti ir nekeičiami visą Sutarties galiojimo laikotarpį.',
      '28. Nuomininkas, ne vėliau kaip per 10 darbo dienų po pretenzijų jam pateikimo, papildomai padengia šias išlaidas (jos gali būti padengtos panaudojant piniginį užstatą, jei toks buvo skiriamas), atsiradusias automobilio nuomos laikotarpiu:',
    ],
    en: [
      '25. The vehicle is handed over only after the rental price and deposit (if any) have been paid.',
      '26. The rental price includes all taxes and other expenses borne by the Lessor, as well as vehicle insurance and technical maintenance.',
      '27. The rental rates set out in the annexes to the Agreement are fixed and shall not change throughout the term of the Agreement.',
      '28. The Lessee, no later than 10 business days after the submission of claims, shall additionally cover the following costs (which may be covered using the cash deposit, if any was made) incurred during the rental period:',
    ],
  },
  sectionVIsub: {
    lt: [
      '28.1. Papildomą nuomos sumą, apskaičiuotą už papildomą nuomos laikotarpį ar vėlavimą automobilį grąžinti laiku;',
      '28.2. Kompensaciją dėl automobilio grąžinimo su nepilnu kuro baku (Sutarties 7 punktas);',
      '28.3. 50 EUR baudą – už rūkymą automobilyje;',
      '28.4. 100 EUR baudą, pametus automobilio dokumentus ar raktelius;',
      '28.5. Pilną žalos atlyginimą dėl automobilio apgadinimo, praradimo ar sunaikinimo, o taip pat frančizę (išskaitą), draudimo įvykio (KASKO) atveju (jei automobilis buvo apdraustas KASKO draudimu). Ši nuostata netaikoma tuo atveju, jei tokią žalą Nuomotojui padengia Draudimo kompanija. Nuomininkas neatsako už žalą, jeigu žala kilo ne dėl Nuomininko kaltės (tyčios ar dėl neatsargumo).',
    ],
    en: [
      '28.1. Additional rental amount calculated for the extended rental period or for late return of the vehicle;',
      '28.2. Compensation for returning the vehicle with an incomplete fuel tank (clause 7 of the Agreement);',
      '28.3. A 50 EUR penalty for smoking in the vehicle;',
      '28.4. A 100 EUR penalty for losing the vehicle\'s documents or keys;',
      '28.5. Full compensation for damage to, loss, or destruction of the vehicle, as well as the deductible (excess) in case of an insurance event (CASCO), if the vehicle was insured under CASCO. This clause does not apply if such damage is covered to the Lessor by the insurance company. The Lessee is not liable for damage that did not arise through the Lessee\'s fault (intent or negligence).',
    ],
  },
  p29: {
    lt: ['29. Už kiekvieną uždelstą kompensacijos ar žalos atlyginimo dieną Nuomininkas moka Nuomotojui 0.5% delspinigių nuo vėluojamos grąžinti (sumokėti) sumos.'],
    en: ['29. For each day of delay in paying compensation or damages, the Lessee shall pay the Lessor late interest of 0.5% of the overdue amount.'],
  },
  p30: {
    lt: ['30. Nuomininkas yra visiškai atsakingas už automobiliui tyčia ar dėl neatsargos ir neapdairumo padarytą žalą ar gedimus, o taip pat kitų nuostolių padengimą Nuomotojui, jei jis pažeidė transporto priemonės saugaus eksploatavimo taisykles ir šios Sutarties sąlygas, nustatytas jos III ir IV dalyse, net ir tuo atveju, jei draudimo kompanija atsisako atlyginti žalą ir nuostolius, atsiradusius automobilio nuomos laikotarpiu. Nuomininkas neatsako už žalos atlyginimą jeigu žala kilo ne dėl Nuomininko kaltės (tyčios ar dėl neatsargumo).'],
    en: ['30. The Lessee is fully liable for damage or malfunctions caused to the vehicle intentionally or due to negligence and carelessness, as well as for compensating the Lessor for other losses if the Lessee breached the vehicle\'s safe operation rules and the terms of this Agreement set out in Sections III and IV, even where the insurance company refuses to compensate damage and losses incurred during the rental period. The Lessee is not liable for damages that did not arise through the Lessee\'s fault (intent or negligence).'],
  },
  sectionVIII: {
    lt: [
      '31. Nuomotojas neatsako už Nuomininko nuostolius, atsiradusius dėl to, jog pastarasis negalėjo naudotis automobiliu dėl jo gedimo nuomos laikotarpiu ar įvykus nelaimingam atsitikimui, avarijai, automobilio sugadinimui ar praradimui. Esant galimybėms, kalbamuoju atveju, Nuomotojas, Šalims sutarus, imasi priemonių, kad savo sąskaita (jei Šalys nesutaria kitaip) suremontuoti išnuomotą automobilį arba, esant galimybei, pakeisti jį kitu. Automobilio keitimo atveju, jo pristatymo išlaidų ir sugedusio automobilio pargabenimo išlaidų dengimo klausimas sprendžiamas Šalių sutarimu.',
      '32. Nuomotojas neatsako už Nuomininko sveikatos būklę automobilio Nuomos laikotarpiu ir po jos pasibaigimo, o taip pat už keleiviams ar tretiesiems asmenims Nuomininko padarytą ar dėl kaltės atsiradusią žalą automobilio nuomos laikotarpiu.',
      '33. Nuomotojas neatsako už jokį Nuomininko turto praradimą ir netekimus automobilio nuomos laikotarpiu ir jam pasibaigus.',
    ],
    en: [
      '31. The Lessor is not liable for the Lessee\'s losses arising from the Lessee\'s inability to use the vehicle due to a malfunction during the rental period or due to an accident, collision, damage, or loss of the vehicle. Where possible, in such a case the Lessor, by agreement of the Parties, shall take measures to repair the rented vehicle at its own expense (unless the Parties agree otherwise) or, where possible, replace it with another. In the case of vehicle replacement, the question of covering delivery costs and the costs of returning the malfunctioning vehicle shall be settled by agreement of the Parties.',
      '32. The Lessor is not liable for the Lessee\'s health condition during or after the rental period, nor for damage caused by the Lessee or arising due to the Lessee\'s fault to passengers or third parties during the rental period.',
      '33. The Lessor is not liable for any loss or destruction of the Lessee\'s property during or after the rental period.',
    ],
  },
  sectionIX: {
    lt: [
      '34. Sutartis gali būti vienašališkai nutraukta bet kurios iš Šalių iniciatyva, įspėjus kitą šalį ne vėliau kaip prieš 10 darbo dienų.',
      '35. Nuomos sutartis, jos papildymai ir priedai galioja tik raštiška, abiejų Šalių suderinta ir pasirašyta, forma.',
      '36. Sutartis sudaryta lietuvių kalba. Po vieną egzempliorių kiekvienai šaliai. Abu egzemplioriai turi vienodą juridinę galią.',
      '37. Šiai Sutarčiai ir iš jos kylantiems santykiams taikomi Lietuvos Respublikos teisės aktai. Visi ginčai, kylantys iš šios Sutarties sprendžiami derybų būdu, o nepavykus jų išspręsti taikiai – ginčo sprendimas perduodamas teismui.',
    ],
    en: [
      '34. The Agreement may be unilaterally terminated by either Party by giving the other Party at least 10 business days\' notice.',
      '35. The Rental Agreement, its supplements and annexes are valid only in written form, agreed and signed by both Parties.',
      '36. The Agreement is concluded in the Lithuanian language; an English translation is provided for the Lessee\'s convenience. In the event of any discrepancy, the Lithuanian text shall prevail. One copy is issued to each Party. Both copies have equal legal force.',
      '37. This Agreement and the relations arising from it are governed by the laws of the Republic of Lithuania. All disputes arising from this Agreement shall be resolved through negotiation, and failing amicable resolution, shall be referred to court.',
    ],
  },
};

// ============================================================
// PDF helpers
// ============================================================
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.split(",")[1] ?? "";
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function loadFonts(pdfDoc: any) {
  pdfDoc.registerFontkit(fontkit);
  const [fontRegularResponse, fontBoldResponse] = await Promise.all([
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'),
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf'),
  ]);
  const fontRegularBytes = new Uint8Array(await fontRegularResponse.arrayBuffer());
  const fontBoldBytes = new Uint8Array(await fontBoldResponse.arrayBuffer());
  const font = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);
  return { font, fontBold };
}

async function loadLessorSignature(pdfDoc: any): Promise<any | null> {
  try {
    const sigUrl = 'https://carbonus.lovable.app/lessor-signature-transparent.png';
    const response = await fetch(sigUrl);
    if (!response.ok) return null;
    const sigBytes = new Uint8Array(await response.arrayBuffer());
    return await pdfDoc.embedPng(sigBytes);
  } catch (e) {
    console.warn('Failed to load lessor signature:', e);
    return null;
  }
}

function drawLine(page: any, y: number) {
  page.drawLine({ start: { x: 72, y }, end: { x: 523, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_TOP = 769;
const MARGIN_BOTTOM = 72;
const LEFT = 72;
const TEXT_LEFT = 72;
const MAX_TEXT_WIDTH = 451;

function ensureSpace(pdfDoc: any, currentPage: any, y: number, needed: number, _font: any, _fontBold: any): { page: any; y: number } {
  if (y - needed < MARGIN_BOTTOM) {
    const newPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page: newPage, y: MARGIN_TOP };
  }
  return { page: currentPage, y };
}

function drawSectionHeading(pdfDoc: any, page: any, y: number, text: string, font: any, fontBold: any, size: number = 11): { page: any; y: number } {
  const result = ensureSpace(pdfDoc, page, y, 20, font, fontBold);
  result.page.drawText(text, { x: LEFT, y: result.y, size, font: fontBold });
  result.y -= size + 6;
  return result;
}

function drawParagraph(pdfDoc: any, page: any, y: number, text: string, font: any, fontBold: any, size: number = 9, indent: number = TEXT_LEFT): { page: any; y: number } {
  const words = text.split(' ');
  const maxWidth = MAX_TEXT_WIDTH - (indent - LEFT);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(next, size);
    if (textWidth > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  let currentPage = page;
  let currentY = y;
  for (const ln of lines) {
    const check = ensureSpace(pdfDoc, currentPage, currentY, size + 3, font, fontBold);
    currentPage = check.page;
    currentY = check.y;
    currentPage.drawText(ln, { x: indent, y: currentY, size, font });
    currentY -= size + 3;
  }
  currentY -= 3;
  return { page: currentPage, y: currentY };
}

// ============================================================
// MAIN CONTRACT
// ============================================================
async function drawFullContract(pdfDoc: any, font: any, fontBold: any, data: any) {
  const lang: Lang = data.lang;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { reservationId, date, customer } = data;
  let y = MARGIN_TOP;

  // TITLE
  const title = tr('contractTitle', lang);
  const titleWidth = fontBold.widthOfTextAtSize(title, 14);
  page.drawText(title, { x: (PAGE_WIDTH - titleWidth) / 2, y, size: 14, font: fontBold });
  y -= 20;
  const nrText = `${tr('no', lang)} ${reservationId.substring(0, 8).toUpperCase()}`;
  const nrWidth = font.widthOfTextAtSize(nrText, 10);
  page.drawText(nrText, { x: (PAGE_WIDTH - nrWidth) / 2, y, size: 10, font });
  y -= 16;
  const dateWidth = font.widthOfTextAtSize(date, 10);
  page.drawText(date, { x: (PAGE_WIDTH - dateWidth) / 2, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 8;
  const cityText = tr('city', lang);
  const cityWidth = font.widthOfTextAtSize(cityText, 10);
  page.drawText(cityText, { x: (PAGE_WIDTH - cityWidth) / 2, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 20;

  let r = drawSectionHeading(pdfDoc, page, y, tr('sec1', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.p1[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec2', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionII[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec3', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionIIIpre[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }
  for (const p of PARAS.prohibitions[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 85); page = r.page; y = r.y; }
  for (const p of PARAS.sectionIIIpost[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec4', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionIV[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }
  for (const p of PARAS.sectionIVsub[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 85); page = r.page; y = r.y; }
  for (const p of PARAS.p22[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec5', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionV[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec6', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionVI[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }
  for (const p of PARAS.sectionVIsub[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 85); page = r.page; y = r.y; }
  for (const p of PARAS.p29[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec7', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.p30[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec8', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionVIII[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  r = drawSectionHeading(pdfDoc, page, y, tr('sec9', lang), font, fontBold);
  page = r.page; y = r.y;
  for (const p of PARAS.sectionIX[lang]) { r = drawParagraph(pdfDoc, page, y, p, font, fontBold); page = r.page; y = r.y; }

  // ===== SIGNATURES =====
  y -= 10;
  r = ensureSpace(pdfDoc, page, y, 220, font, fontBold);
  page = r.page; y = r.y;

  drawLine(page, y);
  y -= 20;

  page.drawText(tr('lessorLabel', lang), { x: LEFT, y, size: 10, font: fontBold });
  page.drawText(tr('lesseeLabel', lang), { x: 340, y, size: 10, font: fontBold });
  y -= 16;

  page.drawText('MB "Carbonus"', { x: LEFT, y, size: 9, font });
  const isCorporate = customer.is_corporate;
  const signerName = isCorporate && customer.company_name
    ? customer.company_name
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 340, y, size: 9, font });
  y -= 12;
  page.drawText(`${tr('companyCode', lang)} 307196558`, { x: LEFT, y, size: 9, font });
  if (customer.address) {
    page.drawText(`${tr('address', lang)}: ${customer.address}`, { x: 340, y, size: 9, font });
  }
  y -= 12;
  page.drawText(`${tr('address', lang)}: Neravų 2A-6, Druskininkai,`, { x: LEFT, y, size: 9, font });
  page.drawText(`${tr('phone', lang)} ${customer.phone || ''}`, { x: 340, y, size: 9, font });
  y -= 12;
  page.drawText('Druskininkų sav.', { x: LEFT, y, size: 9, font });
  page.drawText(`${tr('email', lang)} ${customer.email || ''}`, { x: 340, y, size: 9, font });
  y -= 12;
  page.drawText(`${tr('bankAccount', lang)} LT547189900059467578`, { x: LEFT, y, size: 9, font });
  y -= 12;
  page.drawText(tr('bankName', lang), { x: LEFT, y, size: 9, font });
  y -= 12;
  page.drawText(`${tr('phone', lang)} +37069818781`, { x: LEFT, y, size: 9, font });
  y -= 12;
  page.drawText(`${tr('email', lang)} info@carbonus.lt`, { x: LEFT, y, size: 9, font });
  y -= 50;

  const lessorSig = data.lessorSignatureImage;
  if (lessorSig) {
    const scale = Math.min(120 / lessorSig.width, 40 / lessorSig.height);
    page.drawImage(lessorSig, { x: LEFT + 5, y: y + 5, width: lessorSig.width * scale, height: lessorSig.height * scale });
  }

  if (data.signatureBytes) {
    try {
      const custSig = await pdfDoc.embedPng(data.signatureBytes);
      const scale = Math.min(120 / custSig.width, 40 / custSig.height);
      page.drawImage(custSig, { x: 345, y: y + 5, width: custSig.width * scale, height: custSig.height * scale });
    } catch (_e) { /* continue */ }
  }

  page.drawText('______________', { x: LEFT, y, size: 10, font });
  page.drawText('______________', { x: 340, y, size: 10, font });
  y -= 14;

  page.drawText(tr('director', lang), { x: LEFT, y, size: 9, font });
  page.drawText(signerName, { x: 340, y, size: 9, font });

  return page;
}

// ============================================================
// APPENDIX Nr. 1
// ============================================================
async function drawAppendix(pdfDoc: any, font: any, fontBold: any, data: any) {
  const lang: Lang = data.lang;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { reservationId, customer, car, reservation } = data;
  let y = MARGIN_TOP;
  let r: any;

  const appTitle1 = tr('appendix', lang);
  const appTitle1Width = fontBold.widthOfTextAtSize(appTitle1, 10);
  page.drawText(appTitle1, { x: (PAGE_WIDTH - appTitle1Width) / 2, y, size: 10, font: fontBold });
  y -= 14;
  const appTitle2 = `${reservationId.substring(0, 8).toUpperCase()}    ${tr('appendix2', lang)}`;
  const appTitle2Width = fontBold.widthOfTextAtSize(appTitle2, 10);
  page.drawText(appTitle2, { x: (PAGE_WIDTH - appTitle2Width) / 2, y, size: 10, font: fontBold });
  y -= 24;

  // ===== LESSOR =====
  page.drawText(tr('lessorLabel', lang), { x: LEFT, y, size: 11, font: fontBold });
  y -= 16;
  const lessorInfo = [
    `MB „Carbonus", Neravų 2A-6, Druskininkai, Druskininkų sav.`,
    `${tr('companyCode', lang)}: 307196558`,
    tr('director', lang),
    `${tr('email', lang)} info@carbonus.lt`,
    `${tr('phone', lang)} +37069818781`,
  ];
  for (const line of lessorInfo) {
    page.drawText(line, { x: TEXT_LEFT, y, size: 9, font });
    y -= 13;
  }
  y -= 12;

  // ===== LESSEE =====
  page.drawText(tr('lesseeLabel', lang), { x: LEFT, y, size: 11, font: fontBold });
  y -= 16;

  const isCorporate = customer.is_corporate;
  const tenantLines: string[] = [];
  if (isCorporate && customer.company_name) {
    tenantLines.push(`${customer.company_name}`);
    if (customer.company_code) tenantLines.push(`${tr('personOrCompCode', lang)}: ${customer.company_code}`);
    if (customer.vat_code) tenantLines.push(`${tr('vatCode', lang)}: ${customer.vat_code}`);
    tenantLines.push(`${tr('representative', lang)}: ${customer.first_name} ${customer.last_name}`);
  } else {
    tenantLines.push(`${customer.first_name} ${customer.last_name}`);
  }
  if (customer.address) tenantLines.push(`${tr('address', lang)}: ${customer.address}`);
  tenantLines.push(`${tr('email', lang)} ${customer.email}`);
  tenantLines.push(`${tr('phone', lang)} ${customer.phone}`);

  for (const line of tenantLines) {
    page.drawText(line, { x: TEXT_LEFT, y, size: 9, font });
    y -= 13;
  }
  y -= 12;

  // ===== VEHICLE =====
  page.drawText(tr('vehicleLabel', lang), { x: LEFT, y, size: 11, font: fontBold });
  y -= 18;

  const carRows: [string, string][] = [
    [tr('model', lang), car?.name || reservation.car_name || '—'],
    [tr('plate', lang), car?.license_plate || '—'],
    [tr('yearMade', lang), car?.year ? String(car.year) : '—'],
    [tr('fuel', lang), car?.fuel || '—'],
    [tr('transmission', lang), car?.transmission || '—'],
  ];

  for (const [k, v] of carRows) {
    page.drawText(`${k}:`, { x: TEXT_LEFT, y, size: 10, font: fontBold });
    page.drawText(v, { x: 210, y, size: 10, font });
    y -= 15;
  }

  y -= 6;
  page.drawText(tr('handoverNote', lang), { x: TEXT_LEFT, y, size: 9, font });
  y -= 18;
  y -= 6;

  r = ensureSpace(pdfDoc, page, y, 280, font, fontBold);
  page = r.page; y = r.y;

  const pickupTime = reservation.pickup_time || '10:00';
  const returnTime = reservation.return_time || '10:00';
  const hSuf = lang === 'lt' ? ' val.' : '';

  page.drawText(tr('rentalStart', lang), { x: LEFT, y, size: 10, font: fontBold });
  page.drawText(tr('rentalEnd', lang), { x: 340, y, size: 10, font: fontBold });
  y -= 18;

  page.drawText(`${reservation.start_date}  ${pickupTime}${hSuf}`, { x: TEXT_LEFT, y, size: 10, font });
  page.drawText(`${reservation.end_date}  ${returnTime}${hSuf}`, { x: 340, y, size: 10, font });
  y -= 18;

  page.drawText(`${tr('rentalDays', lang)} ${reservation.rental_days}`, { x: TEXT_LEFT, y, size: 10, font });
  page.drawText(`${tr('totalRent', lang)} ${reservation.total_rental_cost}`, { x: 340, y, size: 10, font });
  y -= 18;

  page.drawText(`${tr('dailyRate', lang)} ${reservation.daily_rate}`, { x: TEXT_LEFT, y, size: 10, font });
  page.drawText(`${tr('depositSum', lang)} ${reservation.deposit_amount} (EUR).`, { x: 340, y, size: 10, font });
  y -= 24;

  page.drawText(tr('weekendNote1', lang), { x: LEFT, y, size: 8, font: fontBold });
  y -= 11;
  page.drawText(tr('weekendNote2', lang), { x: LEFT, y, size: 8, font: fontBold });
  y -= 20;

  // ===== SIGNATURES =====
  r = ensureSpace(pdfDoc, page, y, 120, font, fontBold);
  page = r.page; y = r.y;

  page.drawText(tr('lessorLabel', lang), { x: LEFT, y, size: 10, font: fontBold });
  page.drawText(tr('lesseeLabel', lang), { x: 340, y, size: 10, font: fontBold });
  y -= 50;

  page.drawText('______________', { x: LEFT, y, size: 10, font });
  page.drawText('______________', { x: 340, y, size: 10, font });
  y -= 14;

  page.drawText(tr('directorUpper', lang), { x: LEFT, y, size: 9, font });
  const tenantSigName = isCorporate && customer.company_name
    ? customer.company_name
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(tenantSigName, { x: 340, y, size: 9, font });

  const lessorSig = data.lessorSignatureImage;
  if (lessorSig) {
    const scaleL = Math.min(100 / lessorSig.width, 35 / lessorSig.height);
    page.drawImage(lessorSig, { x: LEFT + 5, y: y + 16, width: lessorSig.width * scaleL, height: lessorSig.height * scaleL });
  }

  if (data.signatureBytes) {
    try {
      const png = await pdfDoc.embedPng(data.signatureBytes);
      const scale = Math.min(100 / png.width, 35 / png.height);
      page.drawImage(png, { x: 345, y: y + 16, width: png.width * scale, height: png.height * scale });
    } catch (_e) { /* continue */ }
  }

  return page;
}

// ============================================================
// HTTP HANDLER
// ============================================================
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      reservationId, customerName, customerEmail, carName,
      startDate, endDate, totalAmount, signatureData, pickupTime, returnTime,
    }: ContractRequest = body;
    const skipEmail = body.skipEmail === true;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: reservation } = await supabase.from('reservations').select('*').eq('id', reservationId).single();

    // Resolve language: explicit body param > reservation.language > 'lt'
    const lang: Lang = ((body.language || (reservation as any)?.language || 'lt') === 'en') ? 'en' : 'lt';

    let customer: any = null;
    if (reservation?.customer_id) {
      const { data: c } = await supabase.from('customers').select('*').eq('id', reservation.customer_id).single();
      customer = c;
    }
    if (!customer) {
      customer = {
        first_name: customerName?.split(' ')[0] || '',
        last_name: customerName?.split(' ').slice(1).join(' ') || '',
        email: customerEmail, phone: '', address: '', is_corporate: false,
      };
    }

    let car: any = null;
    if (reservation?.car_id) {
      const { data: c } = await supabase.from('cars').select('*').eq('id', reservation.car_id).single();
      car = c;
    }

    const resData = reservation || {
      id: reservationId, car_name: carName, start_date: startDate, end_date: endDate,
      total_amount: totalAmount, pickup_time: pickupTime || '10:00', return_time: returnTime || '10:00',
      rental_days: 0, daily_rate: 0, total_rental_cost: 0, deposit_amount: 0,
    };

    let signatureBytes: Uint8Array | null = null;
    let signatureUrl: string | null = null;
    if (signatureData && signatureData.startsWith("data:image")) {
      try {
        signatureBytes = dataUrlToUint8Array(signatureData);
        const filePath = `signatures/${reservationId}.png`;
        await supabase.storage.from("contracts").upload(filePath, signatureBytes, { contentType: "image/png", upsert: true });
        const { data: signed } = await supabase.storage.from("contracts").createSignedUrl(filePath, 60 * 60 * 24 * 30);
        signatureUrl = signed?.signedUrl ?? null;
      } catch (e) { console.warn("Failed to store signature:", e); }
    }

    let contractPath: string | null = null;
    let generatedPdfBytes: Uint8Array | null = null;
    try {
      const pdfDoc = await PDFDocument.create();
      const { font, fontBold } = await loadFonts(pdfDoc);
      const todayStr = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'lt-LT');
      const lessorSignatureImage = await loadLessorSignature(pdfDoc);

      const pdfData = {
        reservationId, date: todayStr, customer, car, reservation: resData,
        signatureBytes, lessorSignatureImage, lang,
      };

      await drawFullContract(pdfDoc, font, fontBold, pdfData);
      await drawAppendix(pdfDoc, font, fontBold, pdfData);

      generatedPdfBytes = await pdfDoc.save();
      const baseName = tr('fileName', lang);
      const pdfFilePath = `${reservationId}/${baseName}_${reservationId}.pdf`;
      const { error: pdfUploadError } = await supabase.storage.from('contracts').upload(pdfFilePath, generatedPdfBytes, { contentType: 'application/pdf', upsert: true });
      if (!pdfUploadError) {
        contractPath = pdfFilePath;
        await supabase.from('reservations').update({ contract_pdf_url: pdfFilePath }).eq('id', reservationId);
      } else {
        console.error('PDF upload failed:', pdfUploadError);
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    let pdfAttachment = null;
    if (generatedPdfBytes) {
      try {
        const base64Pdf = encodeBase64(generatedPdfBytes);
        pdfAttachment = { filename: `${tr('fileName', lang)}_${reservationId}.pdf`, content: base64Pdf };
      } catch (e) { console.error('Failed to prepare PDF attachment:', e); }
    }

    if (!skipEmail) {
      const shortNo = reservationId.substring(0, 8).toUpperCase();
      const emailSummary = `
        <!DOCTYPE html><html><head><meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .info-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head><body>
          <div class="header"><h1 style="color: #22c55e; margin: 0;">${tr('emailHeading', lang)}</h1></div>
          <p>${tr('emailDear', lang)} <strong>${customer.first_name} ${customer.last_name}</strong>,</p>
          <p>${tr('emailThanks', lang)}</p>
          <div class="details">
            <h3 style="margin-top: 0;">${tr('emailReservationInfo', lang)}</h3>
            <p><strong>${tr('emailCar', lang)}</strong> ${car?.name || resData.car_name}</p>
            <p><strong>${tr('emailPickup', lang)}</strong> ${resData.start_date} ${resData.pickup_time || '10:00'}</p>
            <p><strong>${tr('emailReturn', lang)}</strong> ${resData.end_date} ${resData.return_time || '10:00'}</p>
            <p><strong>${tr('emailTotal', lang)}</strong> €${resData.total_amount}</p>
            <p><strong>${tr('emailContractNo', lang)}</strong> ${shortNo}</p>
          </div>
          <div class="info-box">
            <p><strong>${tr('emailAttached', lang)}</strong></p>
            <p>${tr('emailAttachedDesc', lang)}</p>
          </div>
          <p>${tr('emailQuestions', lang)}</p>
          <p>📧 <a href="mailto:info@carbonus.lt">info@carbonus.lt</a> | 📞 <a href="tel:+37069818781">+370 698 18 781</a></p>
          <div class="footer"><p><strong>${tr('emailFooter', lang)}</strong></p></div>
        </body></html>
      `;

      const recipientEmail = customerEmail || customer.email;
      if (recipientEmail) {
        await resend.emails.send({
          from: "CARBONUS <info@carbonus.lt>",
          to: [recipientEmail],
          subject: `${tr('emailSubject', lang)} ${shortNo} – CARBONUS`,
          html: emailSummary,
          ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
        });
      }

      // Admin email always in LT
      await resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: ["info@carbonus.lt"],
        subject: `Nuomos sutartis – ${customer.first_name} ${customer.last_name} (Nr. ${shortNo}) [${lang.toUpperCase()}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Nuomos sutartis sugeneruota (${lang.toUpperCase()})</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Klientas:</h3>
              <p><strong>Vardas, pavardė:</strong> ${customer.first_name} ${customer.last_name}</p>
              ${customer.is_corporate && customer.company_name ? `<p><strong>Įmonė:</strong> ${customer.company_name}</p>` : ''}
              <p><strong>El. paštas:</strong> ${customer.email}</p>
              <p><strong>Telefonas:</strong> ${customer.phone}</p>
              <p><strong>Sutarties kalba:</strong> ${lang === 'en' ? 'English' : 'Lietuvių'}</p>
            </div>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Rezervacija:</h3>
              <p><strong>Nr.:</strong> ${reservationId}</p>
              <p><strong>Automobilis:</strong> ${car?.name || resData.car_name}</p>
              <p><strong>Paėmimas:</strong> ${resData.start_date} ${resData.pickup_time || '10:00'}</p>
              <p><strong>Grąžinimas:</strong> ${resData.end_date} ${resData.return_time || '10:00'}</p>
              <p><strong>Bendra suma:</strong> €${resData.total_amount}</p>
            </div>
            ${signatureUrl ? `<div style="margin: 20px 0;"><p><strong>Parašas:</strong></p><img src="${signatureUrl}" alt="Parašas" style="max-width:280px;border:1px solid #ddd;padding:8px;"/></div>` : ''}
            <p style="color: #6b7280; font-size: 14px;">Sutartis pridėta kaip PDF.</p>
          </div>
        `,
        ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
      });

      console.log("Contract emails sent (lang:", lang, ")");
    } else {
      console.log("skipEmail=true, skipping contract emails");
    }

    return new Response(
      JSON.stringify({ success: true, contractUrl: contractPath, language: lang, message: "Contract generated and sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in generate-contract-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
