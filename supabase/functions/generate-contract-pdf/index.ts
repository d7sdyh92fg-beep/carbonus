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
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.split(",")[1] ?? "";
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

// Helper to draw wrapped text and return new Y position
function drawWrappedText(page: any, text: string, x: number, y: number, font: any, size: number, maxWidth: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: currentY, size, font });
      currentY -= size + 3;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x, y: currentY, size, font });
    currentY -= size + 3;
  }
  return currentY;
}

async function loadFonts(pdfDoc: any) {
  pdfDoc.registerFontkit(fontkit);
  console.log('Fetching Noto Sans fonts...');
  const [fontRegularResponse, fontBoldResponse] = await Promise.all([
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'),
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf'),
  ]);
  const fontRegularBytes = new Uint8Array(await fontRegularResponse.arrayBuffer());
  const fontBoldBytes = new Uint8Array(await fontBoldResponse.arrayBuffer());
  const font = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);
  console.log('Fonts embedded successfully');
  return { font, fontBold };
}

function drawLine(page: any, y: number) {
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_TOP = 790;
const MARGIN_BOTTOM = 50;
const LEFT = 40;
const TEXT_LEFT = 50;
const MAX_TEXT_WIDTH = 490;

// Multi-page helper: checks if y is too low, adds a new page if needed
function ensureSpace(pdfDoc: any, currentPage: any, y: number, needed: number, font: any, fontBold: any): { page: any; y: number } {
  if (y - needed < MARGIN_BOTTOM) {
    const newPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page: newPage, y: MARGIN_TOP };
  }
  return { page: currentPage, y };
}

// Draw section heading (bold)
function drawSectionHeading(pdfDoc: any, page: any, y: number, text: string, font: any, fontBold: any, size: number = 11): { page: any; y: number } {
  const result = ensureSpace(pdfDoc, page, y, 20, font, fontBold);
  result.page.drawText(text, { x: LEFT, y: result.y, size, font: fontBold });
  result.y -= size + 6;
  return result;
}

// Draw a paragraph with auto page break (CPU-optimized wrapping)
function drawParagraph(pdfDoc: any, page: any, y: number, text: string, font: any, fontBold: any, size: number = 9, indent: number = TEXT_LEFT): { page: any; y: number } {
  const words = text.split(' ');
  const maxCharsPerLine = Math.max(45, Math.floor((MAX_TEXT_WIDTH - (indent - LEFT)) / 5.3));
  const lines: string[] = [];

  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharsPerLine && line) {
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

  currentY -= 3; // paragraph spacing
  return { page: currentPage, y: currentY };
}

// Fetch and embed the lessor signature image
async function loadLessorSignature(pdfDoc: any): Promise<any | null> {
  try {
    const sigUrl = 'https://carbonus.lovable.app/lessor-signature.png';
    const response = await fetch(sigUrl);
    if (!response.ok) {
      console.warn('Failed to fetch lessor signature:', response.status);
      return null;
    }
    const sigBytes = new Uint8Array(await response.arrayBuffer());
    const sigImage = await pdfDoc.embedPng(sigBytes);
    return sigImage;
  } catch (e) {
    console.warn('Failed to load lessor signature:', e);
    return null;
  }
}

// ============================================================
// MAIN CONTRACT (full text, sections I-IX, points 1-37)
// ============================================================
async function drawFullContract(pdfDoc: any, font: any, fontBold: any, data: {
  reservationId: string;
  date: string;
  customer: any;
  car: any;
  reservation: any;
  signatureBytes: Uint8Array | null;
  lessorSignatureImage: any | null;
}) {
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { reservationId, date, customer } = data;
  let y = MARGIN_TOP;

  // ===== TITLE =====
  const title = 'Transporto priemonės nuomos sutartis';
  const titleWidth = fontBold.widthOfTextAtSize(title, 14);
  page.drawText(title, { x: (PAGE_WIDTH - titleWidth) / 2, y, size: 14, font: fontBold });
  y -= 20;
  const nrText = `Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const nrWidth = font.widthOfTextAtSize(nrText, 10);
  page.drawText(nrText, { x: (PAGE_WIDTH - nrWidth) / 2, y, size: 10, font });
  y -= 16;
  const dateText = `${date}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 10);
  page.drawText(dateText, { x: (PAGE_WIDTH - dateWidth) / 2, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 8;
  const cityText = 'Druskininkai';
  const cityWidth = font.widthOfTextAtSize(cityText, 10);
  page.drawText(cityText, { x: (PAGE_WIDTH - cityWidth) / 2, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 20;

  // ===== I. NUOMOS SUTARTIES OBJEKTAS =====
  let r = drawSectionHeading(pdfDoc, page, y, 'I. Nuomos sutarties objektas.', font, fontBold);
  page = r.page; y = r.y;

  r = drawParagraph(pdfDoc, page, y, '1. Šia Nuomos sutartimi (toliau – Sutartis) MB „Carbonus" (įmonės kodas – 307196558), atstovaujama direktoriaus Tomo Čepulio, (toliau – Nuomotojas) nuomoja automobilį Nuomininkui (toliau sutartyje – Šalys), Nuomininkas sutinka laikytis automobilio naudojimosi taisyklių, nustatytų šioje Sutartyje ir patvirtina tai savo parašu.', font, fontBold);
  page = r.page; y = r.y;

  // ===== II. AUTOMOBILIO PRIĖMIMAS IR GRĄŽINIMAS =====
  r = drawSectionHeading(pdfDoc, page, y, 'II. Automobilio priėmimas ir grąžinimas.', font, fontBold);
  page = r.page; y = r.y;

  const sectionII = [
    '2. Nuomininkas, priimdamas automobilį, savo parašu patvirtina, kad automobilį gavo tvarkingą ir geros (tinkamos saugiai eksploatacijai) techninės būklės, su visais papildomais priedais, įskaitant automobilio dokumentus.',
    '3. Grąžinimo metu automobilis privalo būti tokios techninės būklės ir komplektacijos, kokios buvo išnuomotas, t.y. jo priėmimo naudotis momentu, bet atsižvelgiant į natūralų nusidėvėjimą.',
    '4. Automobilis grąžinamas Nuomotojui sutartyje ar jos prieduose nustatytu laiku.',
    '5. Darbo valandomis nuomojamas automobilis paimamas ir pristatomas (grąžinamas) į Sutartyje nustatytą ar Šalių sutartą vietą. Jei automobilis grąžinamas po darbo valandų ar savaitgaliais (švenčių dienomis), jam taikomos papildomos grąžinimo sąlygos (kainos) Šalių suderintos ir patvirtintos abipusiu Šalių susitarimu arba nustatytos pasirašant Sutartį, šios Sutarties priede.',
    '6. Automobilis išnuomojas ir perduodamas Nuomininkui su pilnu degalų baku, švariu (nuplautu) kėbulu ir tvarkingu salonu. Grąžindamas automobilį Nuomininkas užtikrina jo grąžinimą taip pat su pilnu degalų baku, nuplautu kėbulu ir tvarkingu salonu.',
    '7. Tuo atveju, jei automobilis grąžinimas pažeidžiant Sutarties 6 punkto sąlygas, Nuomininkas Nuomotojui moka kompensaciją, kuri sudaro 1.5 EUR (su PVM) už 1 litrą degalų, padauginus iš trūkstamo iki pilno kuro bako litrų kiekio, o tais atvejais, jei automobilis grąžinamas nešvariu kėbulu ir (ar) netvarkingu salonu, Nuomininkas Nuomotojui atitinkamai moka – 20 EUR baudą už nenuplautą automobilį ir 20 EUR baudą už netvarkingą saloną.',
    '8. Jei Nuomininkas pažeidžia Sutarties sąlygas, vykdo jas netinkamai arba kai numatoma, jog Nuomininkas negalės tinkamai įvykdyti savo pareigų, kylančių iš šios Sutarties, Nuomotojas turi besąlygišką teisę atsiimti automobilį anksčiau sutarto (numatyto) laiko, esant poreikiui – kreiptis į teisėsaugos organus ar kitus subjektus dėl automobilio paieškos paskelbimo.',
    '9. Jei Nuomininkas negrąžina automobilio 24 valandų laikotarpyje, kurios pradedamos skaičiuoti po Sutartyje nustatyto grąžinimo termino pabaigos, o taip pat jokia Nuomotojui priimtina ar sutarta komunikavimo forma, apie vėlavimą grąžinti automobilį neinformuoja Nuomotojo, Nuomotojas turi teisę kreiptis į teisėsaugos organus dėl turto (automobilio) vagystės, jo sunaikinimo ar sugadinimo ir reikalauti iš Nuomotojo žalos atlyginimo, išskyrus atvejus, jeigu tą žalą Nuomotojui atlygina draudimo kompanija arba atlygina tą dalį žalos, kurios nepadengia draudimo kompanija.',
  ];
  for (const p of sectionII) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  // ===== III. AUTOMOBILIO NAUDOJIMAS =====
  r = drawSectionHeading(pdfDoc, page, y, 'III. Automobilio naudojimas.', font, fontBold);
  page = r.page; y = r.y;

  const sectionIII_pre = [
    '10. Nuomos laikotarpiu automobilį gali vairuoti tik Nuomininkas arba Nuomininko darbuotojas, jei nuomos sutartis sudaroma su įmone, turintis teisę vairuoti įmonės automobilius ir atitinkamą įgaliojimą vairuoti nuomojamą transporto priemonę. Už galimą kaltę ir žalą sukeliančius veiksmus bei pasekmes, atsiradusias ar kylančias dėl vairuotojos nuomojamos transporto priemonės, atsakingas nuomininkas/įmonė, išskyrus atvejus, jeigu ją pilna apimtimi Nuomotojui atlygina draudimo kompanija.',
    '11. Nuomininkas užtikrina saugų ir tinkamą automobilio eksploatavimą visą nuomos laikotarpį, užrakina visas automobilio dureles, palikdamas automobilį be priežiūros net ir trumpam laikui.',
    '12. Nuomininkas įsipareigoja saugoti nuomojamos transporto priemonės dokumentus ir raktelius bei užtikrinti jų nepatekimą tretiesiems asmenims.',
    '13. Pagal šią Sutartį Nuomininkui draudžiama:',
  ];
  for (const p of sectionIII_pre) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  const prohibitions = [
    '13.1. Naudoti nuomojamą automobilį keleivių vežimui už atlygį;',
    '13.2. Naudoti automobilį priekabų ir kitų automobilių vilkimui;',
    '13.3. Naudoti automobilį prekių pervežimui, pažeidžiant Lietuvos Respublikos teisės aktus, reglamentuojančius krovinių vežimą.',
    '13.4. Naudoti automobilį nusikalstamai veiklai;',
    '13.5. Vairuoti automobilį neblaiviam ar apsvaigusiam nuo psichotropinių medžiagų ir stipraus poveikio medikamentų, turinčių poveikį reakcijai ir atidumui;',
    '13.6. Naudoti automobilį sportiniuose renginiuose ar kitokio pobūdžio eisme, kuriuose nesilaikoma saugaus eismo ir vairavimo taisyklių;',
    '13.7. Vežti didelės vertės daiktus, neturint jų nuosavybę patvirtinančių dokumentų;',
    '13.8. Vežti degius skysčius bei medžiagas, ginklus, sprogmenis, narkotines ir psichotropines medžiagas ir kitus daiktus, kurių laikymą, disponavimą, naudojimą, gabenimą ir platinimą draudžia teisės aktai.',
    '13.9. Rūkyti automobilyje (bauda 50 EUR).',
  ];
  for (const p of prohibitions) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 60);
    page = r.page; y = r.y;
  }

  const sectionIII_post = [
    '14. Nuomininkas/nuomojamos transporto priemonės vairuotojas privalo laikytis saugaus eismo taisyklių ir šios Sutarties sąlygų.',
    '15. Nuomininkas privalo užtikrinti savalaikę periodinę tepalo lygio ir kitų automobilio skysčių lygio patikrą ir imtis priemonių jų papildymui, taip pat sekti oro slėgį automobilio padangose ir, esant poreikiui, imtis priemonių savalaikiam jo padidinimui.',
    '16. Sugedus automobiliui, jo remontą atlikti tik suderinus (vietą, laiką, kaštus ir t.t.) su Nuomotoju ir gavus jo leidimą. Remonto išlaidas apmoka Nuomotojas, išskyrus atvejus, jei Šalys nesutaria kitaip.',
    '17. Nuomininkas privalo imtis priemonių ir užtikrinti, kad tamsiu paros metu automobilis būtų maksimaliai apsaugotas nuo vagysčių ir sunaikinimo/sugadinimo.',
  ];
  for (const p of sectionIII_post) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  // ===== IV. AUTOMOBILIO VAGYSTĖ, AVARIJOS IR KITI GEDIMAI =====
  r = drawSectionHeading(pdfDoc, page, y, 'IV. Automobilio vagystė, avarijos ir kiti gedimai.', font, fontBold);
  page = r.page; y = r.y;

  const sectionIV = [
    '18. Įvykus autoįvykiui, avarijai, gaisrui, pastebėjus trečių asmenų padarytą žalą automobiliui ar jo vagystės atveju, Nuomininkas privalo nedelsdamas (ne vėliau kaip per 8 h.) kreiptis į atitinkamas institucijas ir apie tai informuoti Nuomotoją.',
    '19. Nuomininkas patvirtina, jog žino, kad teisėsaugos institucijų atstovų išduoti dokumentai, transportavimo įmonių pažymos yra svarbios ir gali būti pagrindu nustatant žalos lygį ir išmokant draudimo išmoką už automobilio praradimą, sugadinimą ar sunaikinimą, o taip pat pateikiant reikalavimus (ieškinius) tretiesiems asmenims (kaltininkams).',
    '20. Nuomininkas įsipareigoja saugoti įrodymų objektus (daiktus, pėdsakus, liudininkų parodymus, fotografijas ir pan.), įvykių dalyvių ir liudininkų kontaktinę informaciją. Taip pat Nuomininkas įspėtas ir žino, jog jam draudžiama pasirašyti bet kokius dokumentus, galinčius pakenkti Nuomotojo reputacijai, kaltinančiais Nuomotoją dėl žalos ar nuostolių atlyginimo ir pan.',
    '21. Nuomininkas ar nuomojamos transporto priemonės teisėtas naudotojas (įgaliotas vairuotojas) privalo imtis priemonių ir apsaugoti Nuomotojo ir automobilio draudimo kompanijos teisėtus interesus jei nuomos laikotarpiu įvyksta autoįvykis, avarija, automobilio apgadinimas, sunaikinimas ar vagystė, t.y.:',
  ];
  for (const p of sectionIV) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  const sectionIV_sub = [
    '21.1. Nedelsiant gelbėti transporto priemonę, apsaugant ją nuo tolimesnio gedimo ir pašalinti priežastis, galinčias pakenkti automobilio vertei ir padidinti patiriamą žalą (nuostolius);',
    '21.2. Pranešti teisėsaugos institucijoms ir draudimo kompanijai apie įvykį, gauti su pranešimo užregistravimu susijusius dokumentus;',
    '21.3. Nedelsiant informuoti apie įvykį Nuomotoją.',
  ];
  for (const p of sectionIV_sub) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 60);
    page = r.page; y = r.y;
  }

  r = drawParagraph(pdfDoc, page, y, '22. Nuomotojas neatsako už žalą ir nuostolius, kuriuos patiria Nuomininkas nuomos laikotarpiu, tame tarpe ir dėl nuomojame automobilyje paliktų (sugadintų ar dingusių) Nuomininko daiktų ar turto.', font, fontBold);
  page = r.page; y = r.y;

  // ===== V. AUTOMOBILIO DRAUDIMAS IR KITOS RINKLIAVOS =====
  r = drawSectionHeading(pdfDoc, page, y, 'V. Automobilio draudimas ir kitos rinkliavos.', font, fontBold);
  page = r.page; y = r.y;

  const sectionV = [
    '23. Už automobilio draudimą atsakingas Nuomotojas. Automobilio privalomojo transporto priemonės valdytojo civilinės atsakomybės draudimas turi galioti Europos Sąjungos valstybėse, o jame turi būti nurodyta, kad automobilį vairuos ir tretieji asmenys.',
    '24. Už kelių mokesčių ir kitų rinkliavų, o taip pat baudų už kelių eismo taisyklių pažeidimus, padarytus vairuojant nuomojamą automobilį, atsakingas Nuomininkas ar įgaliotas asmuo, vairavęs automobilį.',
  ];
  for (const p of sectionV) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  // ===== VI. APMOKĖJIMO SĄLYGOS =====
  r = drawSectionHeading(pdfDoc, page, y, 'VI. Apmokėjimo sąlygos.', font, fontBold);
  page = r.page; y = r.y;

  const sectionVI = [
    '25. Automobilis perduodamas tik sumokėjus nuomos kainą ir užstatą, jei toks mokamas.',
    '26. Į nuomos kainą įskaičiuoti visi Nuomotojo mokami mokesčiai ir kitos išlaidos, o taip pat automobilio draudimai, techniniai aptarnavimai.',
    '27. Nuomos įkainiai, nustatyti Sutarties prieduose, yra fiksuoti ir nekeičiami visą Sutarties galiojimo laikotarpį.',
    '28. Nuomininkas, ne vėliau kaip per 10 darbo dienų po pretenzijų jam pateikimo, papildomai padengia šias išlaidas (jos gali būti padengtos panaudojant piniginį užstatą, jei toks buvo skiriamas), atsiradusias automobilio nuomos laikotarpiu:',
  ];
  for (const p of sectionVI) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  const sectionVI_sub = [
    '28.1. Papildomą nuomos sumą, apskaičiuotą už papildomą nuomos laikotarpį ar vėlavimą automobilį grąžinti laiku;',
    '28.2. Kompensaciją dėl automobilio grąžinimo su nepilnu kuro baku (Sutarties 7 punktas);',
    '28.3. 50 EUR baudą – už rūkymą automobilyje;',
    '28.4. 100 EUR baudą, pametus automobilio dokumentus ar raktelius;',
    '28.5. Pilną žalos atlyginimą dėl automobilio apgadinimo, praradimo ar sunaikinimo, o taip pat frančizę (išskaitą), draudimo įvykio (KASKO) atveju (jei automobilis buvo apdraustas KASKO draudimu). Ši nuostata netaikoma tuo atveju, jei tokią žalą Nuomotojui padengia Draudimo kompanija. Nuomininkas neatsako už žalą, jeigu žala kilo ne dėl Nuomininko kaltės (tyčios ar dėl neatsargumo).',
  ];
  for (const p of sectionVI_sub) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold, 9, 60);
    page = r.page; y = r.y;
  }

  r = drawParagraph(pdfDoc, page, y, '29. Už kiekvieną uždelstą kompensacijos ar žalos atlyginimo dieną Nuomininkas moka Nuomotojui 0.5% delspinigių nuo vėluojamos grąžinti (sumokėti) sumos.', font, fontBold);
  page = r.page; y = r.y;

  // ===== VII. NUOMININKO ATSAKOMYBĖ =====
  r = drawSectionHeading(pdfDoc, page, y, 'VII. Nuomininko atsakomybė.', font, fontBold);
  page = r.page; y = r.y;

  r = drawParagraph(pdfDoc, page, y, '30. Nuomininkas yra visiškai atsakingas už automobiliui tyčia ar dėl neatsargos ir neapdairumo padarytą žalą ar gedimus, o taip pat kitų nuostolių padengimą Nuomotojui, jei jis pažeidė transporto priemonės saugaus eksploatavimo taisykles ir šios Sutarties sąlygas, nustatytas jos III ir IV dalyse, net ir tuo atveju, jei draudimo kompanija atsisako atlyginti žalą ir nuostolius, atsiradusius automobilio nuomos laikotarpiu. Nuomininkas neatsako už žalos atlyginimą jeigu žala kilo ne dėl Nuomininko kaltės (tyčios ar dėl neatsargumo).', font, fontBold);
  page = r.page; y = r.y;

  // ===== VIII. NUOMOTOJO ATSAKOMYBĖ =====
  r = drawSectionHeading(pdfDoc, page, y, 'VIII. Nuomotojo atsakomybė.', font, fontBold);
  page = r.page; y = r.y;

  const sectionVIII = [
    '31. Nuomotojas neatsako už Nuomininko nuostolius, atsiradusius dėl to, jog pastarasis negalėjo naudotis automobiliu dėl jo gedimo nuomos laikotarpiu ar įvykus nelaimingam atsitikimui, avarijai, automobilio sugadinimui ar praradimui. Esant galimybėms, kalbamuoju atveju, Nuomotojas, Šalims sutarus, imasi priemonių, kad savo sąskaita (jei Šalys nesutaria kitaip) suremontuoti išnuomotą automobilį arba, esant galimybei, pakeisti jį kitu.',
    '32. Nuomotojas neatsako už Nuomininko sveikatos būklę automobilio Nuomos laikotarpiu ir po jos pasibaigimo, o taip pat už keleiviams ar tretiesiems asmenims Nuomininko padarytą ar dėl kaltės atsiradusią žalą automobilio nuomos laikotarpiu.',
    '33. Nuomotojas neatsako už jokį Nuomininko turto praradimą ir netekimus automobilio nuomos laikotarpiu ir jam pasibaigus.',
  ];
  for (const p of sectionVIII) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  // ===== IX. BAIGIAMOSIOS NUOSTATOS =====
  r = drawSectionHeading(pdfDoc, page, y, 'IX. Baigiamosios nuostatos.', font, fontBold);
  page = r.page; y = r.y;

  const sectionIX = [
    '34. Sutartis gali būti vienašališkai nutraukta bet kurios iš Šalių iniciatyva, įspėjus kitą šalį ne vėliau kaip prieš 10 darbo dienų.',
    '35. Nuomos sutartis, jos papildymai ir priedai galioja tik raštiška, abiejų Šalių suderinta ir pasirašyta, forma.',
    '36. Sutartis sudaryta lietuvių kalba. Po vieną egzempliorių kiekvienai šaliai. Abu egzemplioriai turi vienodą juridinę galią.',
    '37. Šiai Sutarčiai ir iš jos kylantiems santykiams taikomi Lietuvos Respublikos teisės aktai. Visi ginčai, kylantys iš šios Sutarties sprendžiami derybų būdu, o nepavykus jų išspręsti taikiai – ginčo sprendimas perduodamas teismui.',
  ];
  for (const p of sectionIX) {
    r = drawParagraph(pdfDoc, page, y, p, font, fontBold);
    page = r.page; y = r.y;
  }

  // ===== SIGNATURES =====
  y -= 10;
  r = ensureSpace(pdfDoc, page, y, 100, font, fontBold);
  page = r.page; y = r.y;

  drawLine(page, y);
  y -= 20;

  page.drawText('NUOMOTOJAS:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('NUOMININKAS:', { x: 320, y, size: 10, font: fontBold });
  y -= 16;

  page.drawText('MB "Carbonus"', { x: 50, y, size: 9, font });
  page.drawText('Įmonės kodas 307196558', { x: 50, y: y - 12, size: 9, font });
  page.drawText('Adresas: Neravų 2A-6, Druskininkai', { x: 50, y: y - 24, size: 9, font });
  page.drawText('Tel. +37069818781', { x: 50, y: y - 36, size: 9, font });
  page.drawText('El.p.: info@carbonus.lt', { x: 50, y: y - 48, size: 9, font });

  const isCorporate = customer.is_corporate;
  const signerName = isCorporate && customer.company_name
    ? `${customer.company_name}`
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 320, y, size: 9, font });
  if (customer.address) {
    page.drawText(`Adresas: ${customer.address}`, { x: 320, y: y - 12, size: 9, font });
  }
  page.drawText(`Tel. ${customer.phone}`, { x: 320, y: y - 24, size: 9, font });
  page.drawText(`El.p.: ${customer.email}`, { x: 320, y: y - 36, size: 9, font });

  y -= 60;

  page.drawText('Direktorius Tomas Čepulis', { x: 50, y, size: 9, font });
  y -= 6;

  // Embed lessor signature
  const lessorSig = data.lessorSignatureImage;
  if (lessorSig) {
    const scale = Math.min(140 / lessorSig.width, 45 / lessorSig.height);
    const w = lessorSig.width * scale;
    const h = lessorSig.height * scale;
    page.drawImage(lessorSig, { x: 50, y: y - h, width: w, height: h });
    y -= h + 4;
  } else {
    y -= 8;
  }
  }

  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });

  return page;
}

// ============================================================
// APPENDIX Nr. 1 (without mileage)
// ============================================================
async function drawAppendix(pdfDoc: any, font: any, fontBold: any, data: {
  reservationId: string;
  date: string;
  customer: any;
  car: any;
  reservation: any;
  signatureBytes: Uint8Array | null;
  lessorSignatureImage: any | null;
}) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { reservationId, date, customer, car, reservation } = data;
  let y = MARGIN_TOP;

  // Title
  const appTitle = 'PRIEDAS Nr. 1';
  const appTitleWidth = fontBold.widthOfTextAtSize(appTitle, 14);
  page.drawText(appTitle, { x: (PAGE_WIDTH - appTitleWidth) / 2, y, size: 14, font: fontBold });
  y -= 20;
  const subTitle = `prie Transporto priemonės nuomos sutarties Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const subTitleWidth = font.widthOfTextAtSize(subTitle, 10);
  page.drawText(subTitle, { x: (PAGE_WIDTH - subTitleWidth) / 2, y, size: 10, font });
  y -= 28;

  drawLine(page, y);
  y -= 20;

  // ===== NUOMOTOJAS =====
  page.drawText('NUOMOTOJAS:', { x: LEFT, y, size: 11, font: fontBold });
  y -= 16;
  const lessorInfo = [
    'MB „Carbonus", Neravų 2A-6, Druskininkai, Druskininkų sav.',
    'Įmonės kodas: 307196558',
    'Direktorius Tomas Čepulis',
    'El.p. info@carbonus.lt',
    'Tel. Nr. +37069818781',
  ];
  for (const line of lessorInfo) {
    page.drawText(line, { x: TEXT_LEFT, y, size: 9, font });
    y -= 13;
  }

  y -= 8;
  drawLine(page, y);
  y -= 20;

  // ===== NUOMININKAS =====
  page.drawText('NUOMININKAS:', { x: LEFT, y, size: 11, font: fontBold });
  y -= 16;

  const isCorporate = customer.is_corporate;
  const tenantLines: string[] = [];
  if (isCorporate && customer.company_name) {
    tenantLines.push(`Įmonė: ${customer.company_name}`);
    if (customer.company_code) tenantLines.push(`Įmonės kodas: ${customer.company_code}`);
    if (customer.vat_code) tenantLines.push(`PVM kodas: ${customer.vat_code}`);
    tenantLines.push(`Atstovas: ${customer.first_name} ${customer.last_name}`);
  } else {
    tenantLines.push(`${customer.first_name} ${customer.last_name}`);
  }
  if (customer.address) tenantLines.push(`Adresas: ${customer.address}`);
  tenantLines.push(`El.p. ${customer.email}`);
  tenantLines.push(`Tel. Nr. ${customer.phone}`);

  for (const line of tenantLines) {
    page.drawText(line, { x: TEXT_LEFT, y, size: 9, font });
    y -= 13;
  }

  y -= 8;
  drawLine(page, y);
  y -= 20;

  // ===== NUOMOJAMAS AUTOMOBILIS =====
  page.drawText('NUOMOJAMAS AUTOMOBILIS:', { x: LEFT, y, size: 11, font: fontBold });
  y -= 18;

  const carRows: [string, string][] = [
    ['Modelis', car?.name || reservation.car_name || '—'],
    ['Pagaminimo metai', car?.year ? String(car.year) : '—'],
  ];
  if (car?.license_plate) carRows.push(['Valstybinis numeris', car.license_plate]);
  if (car?.fuel) carRows.push(['Kuro tipas', car.fuel]);
  if (car?.transmission) carRows.push(['Pavarų dėžė', car.transmission]);
  if (car?.passengers) carRows.push(['Keleivių skaičius', String(car.passengers)]);
  // NOTE: Mileage (Rida) intentionally NOT shown - it's variable

  for (const [k, v] of carRows) {
    page.drawText(`${k}:`, { x: TEXT_LEFT, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 6;
  page.drawText('Perduodamas techniškai tvarkingas automobilis, su pilnu kuro baku, švarus.', { x: TEXT_LEFT, y, size: 9, font });
  y -= 18;

  drawLine(page, y);
  y -= 20;

  // ===== NUOMOS LAIKOTARPIS IR KAINA =====
  page.drawText('NUOMOS LAIKOTARPIS IR KAINA:', { x: LEFT, y, size: 11, font: fontBold });
  y -= 18;

  const pickupTime = reservation.pickup_time || '10:00';
  const returnTime = reservation.return_time || '10:00';

  const rentalRows: [string, string][] = [
    ['Nuomos pradžia', `${reservation.start_date} ${pickupTime}`],
    ['Nuomos pabaiga', `${reservation.end_date} ${returnTime}`],
    ['Nuomos laikotarpis (paromis)', `${reservation.rental_days}`],
    ['Nuomos kaina (už 1 parą)', `€${reservation.daily_rate}`],
    ['Nuomos kaina (iš viso)', `€${reservation.total_rental_cost}`],
    ['Užstato suma', `€${reservation.deposit_amount}`],
    ['Bendra suma', `€${reservation.total_amount}`],
  ];

  for (const [k, v] of rentalRows) {
    page.drawText(`${k}:`, { x: TEXT_LEFT, y, size: 10, font: fontBold });
    page.drawText(v, { x: 250, y, size: 10, font });
    y -= 15;
  }

  y -= 8;
  page.drawText('Jei automobilis grąžinamas savaitgalį, šventinę dieną ar po darbo valandų,', { x: TEXT_LEFT, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 11;
  page.drawText('taikomas papildomas 20 EUR mokestis.', { x: TEXT_LEFT, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 16;

  drawLine(page, y);
  y -= 20;

  // ===== PASTABOS =====
  page.drawText('PASTABOS:', { x: LEFT, y, size: 11, font: fontBold });
  y -= 16;
  for (let i = 0; i < 3; i++) {
    page.drawText('________________________________________________________________________________', { x: TEXT_LEFT, y, size: 9, font, color: rgb(0.7, 0.7, 0.7) });
    y -= 16;
  }

  y -= 10;
  drawLine(page, y);
  y -= 24;

  // ===== SIGNATURES =====
  page.drawText('NUOMOTOJAS:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('NUOMININKAS:', { x: 320, y, size: 10, font: fontBold });
  y -= 16;
  page.drawText('TOMAS ČEPULIS', { x: 50, y, size: 9, font });

  const signerName = isCorporate && customer.company_name
    ? `${customer.company_name}`
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 320, y, size: 9, font });
  y -= 6;

  // Embed lessor signature
  const lessorSig = data.lessorSignatureImage;
  if (lessorSig) {
    const scaleL = Math.min(140 / lessorSig.width, 45 / lessorSig.height);
    const wL = lessorSig.width * scaleL;
    const hL = lessorSig.height * scaleL;
    page.drawImage(lessorSig, { x: 50, y: y - hL, width: wL, height: hL });
  }

  // Embed customer digital signature if available
  if (data.signatureBytes) {
    try {
      const png = await pdfDoc.embedPng(data.signatureBytes);
      const scale = Math.min(150 / png.width, 50 / png.height);
      const w = png.width * scale;
      const h = png.height * scale;
      page.drawImage(png, { x: 320, y: y - h, width: w, height: h });
    } catch (_e) {
      // continue without signature image
    }
  }

  y -= 50;
  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });

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
      reservationId,
      customerName,
      customerEmail,
      carName,
      startDate,
      endDate,
      totalAmount,
      signatureData,
      pickupTime,
      returnTime,
    }: ContractRequest = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch full reservation, customer, and car data from DB
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    let customer: any = null;
    if (reservation?.customer_id) {
      const { data: c } = await supabase
        .from('customers')
        .select('*')
        .eq('id', reservation.customer_id)
        .single();
      customer = c;
    }

    // Fallback customer from request params
    if (!customer) {
      customer = {
        first_name: customerName?.split(' ')[0] || '',
        last_name: customerName?.split(' ').slice(1).join(' ') || '',
        email: customerEmail,
        phone: '',
        address: '',
        is_corporate: false,
      };
    }

    let car: any = null;
    const carId = reservation?.car_id;
    if (carId) {
      const { data: c } = await supabase.from('cars').select('*').eq('id', carId).single();
      car = c;
    }

    // Use reservation data or fallback
    const resData = reservation || {
      id: reservationId,
      car_name: carName,
      start_date: startDate,
      end_date: endDate,
      total_amount: totalAmount,
      pickup_time: pickupTime || '10:00',
      return_time: returnTime || '10:00',
      rental_days: 0,
      daily_rate: 0,
      total_rental_cost: 0,
      deposit_amount: 0,
    };

    // Handle signature storage
    let signatureUrl: string | null = null;
    let signatureBytes: Uint8Array | null = null;
    if (signatureData && signatureData.startsWith("data:image")) {
      try {
        signatureBytes = dataUrlToUint8Array(signatureData);
        const filePath = `signatures/${reservationId}.png`;
        const { error: uploadError } = await supabase.storage
          .from("contracts")
          .upload(filePath, signatureBytes, { contentType: "image/png", upsert: true });
        if (uploadError) throw uploadError;
        const { data: signed, error: signedErr } = await supabase.storage
          .from("contracts")
          .createSignedUrl(filePath, 60 * 60 * 24 * 30);
        if (signedErr) throw signedErr;
        signatureUrl = signed?.signedUrl ?? null;
      } catch (e) {
        console.warn("Failed to store signature:", e);
      }
    }

    // Generate PDF
    let contractPath: string | null = null;
    let generatedPdfBytes: Uint8Array | null = null;
    try {
      const pdfDoc = await PDFDocument.create();
      const { font, fontBold } = await loadFonts(pdfDoc);
      const todayStr = new Date().toLocaleDateString('lt-LT');
      const lessorSignatureImage = await loadLessorSignature(pdfDoc);

      const pdfData = {
        reservationId,
        date: todayStr,
        customer,
        car,
        reservation: resData,
        signatureBytes,
        lessorSignatureImage,
      };

      // Pages 1-N: Full contract (I-IX)
      await drawFullContract(pdfDoc, font, fontBold, pdfData);

      // Last page: Appendix Nr. 1
      await drawAppendix(pdfDoc, font, fontBold, pdfData);

      generatedPdfBytes = await pdfDoc.save();
      const pdfFilePath = `${reservationId}/nuomos_sutartis_${reservationId}.pdf`;
      const { error: pdfUploadError } = await supabase.storage
        .from('contracts')
        .upload(pdfFilePath, generatedPdfBytes, { contentType: 'application/pdf', upsert: true });
      if (!pdfUploadError) {
        contractPath = pdfFilePath;
      } else {
        console.error('PDF upload failed:', pdfUploadError);
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    // Build PDF attachment directly from generated bytes (faster, avoids timeout)
    let pdfAttachment = null;
    if (generatedPdfBytes) {
      try {
        const base64Pdf = encodeBase64(generatedPdfBytes);
        pdfAttachment = { filename: `nuomos_sutartis_${reservationId}.pdf`, content: base64Pdf };
      } catch (pdfError) {
        console.error('Failed to prepare PDF attachment:', pdfError);
      }
    }

    // Email to customer
    const emailSummary = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
          .info-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head><body>
        <div class="header"><h1 style="color: #22c55e; margin: 0;">✅ Nuomos sutartis patvirtinta</h1></div>
        <p>Gerb. <strong>${customer.first_name} ${customer.last_name}</strong>,</p>
        <p>Dėkojame, kad pasirinkote CARBONUS automobilių nuomą!</p>
        <div class="details">
          <h3 style="margin-top: 0;">Rezervacijos informacija:</h3>
          <p><strong>Automobilis:</strong> ${car?.name || resData.car_name}</p>
          <p><strong>Paėmimo data:</strong> ${resData.start_date} ${resData.pickup_time || '10:00'}</p>
          <p><strong>Grąžinimo data:</strong> ${resData.end_date} ${resData.return_time || '10:00'}</p>
          <p><strong>Bendra suma:</strong> €${resData.total_amount}</p>
          <p><strong>Sutarties Nr.:</strong> ${reservationId.substring(0, 8).toUpperCase()}</p>
        </div>
        <div class="info-box">
          <p><strong>📎 Nuomos sutartis</strong></p>
          <p>Sutartis pridėta prie šio laiško kaip PDF failas.</p>
        </div>
        <p>Klausimai? Susisiekite:</p>
        <p>📧 <a href="mailto:info@carbonus.lt">info@carbonus.lt</a> | 📞 <a href="tel:+37069818781">+370 698 18 781</a></p>
        <div class="footer"><p><strong>CARBONUS automobilių nuoma</strong></p></div>
      </body></html>
    `;

    // Send to customer
    const recipientEmail = customerEmail || customer.email;
    if (recipientEmail) {
      await resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: [recipientEmail],
        subject: `Nuomos sutartis Nr. ${reservationId.substring(0, 8).toUpperCase()} – CARBONUS`,
        html: emailSummary,
        ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
      });
    }

    // Send to admin
    await resend.emails.send({
      from: "CARBONUS <info@carbonus.lt>",
      to: ["info@carbonus.lt"],
      subject: `Nuomos sutartis – ${customer.first_name} ${customer.last_name} (Nr. ${reservationId.substring(0, 8).toUpperCase()})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Nuomos sutartis sugeneruota</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Klientas:</h3>
            <p><strong>Vardas, pavardė:</strong> ${customer.first_name} ${customer.last_name}</p>
            ${customer.is_corporate && customer.company_name ? `<p><strong>Įmonė:</strong> ${customer.company_name}</p>` : ''}
            <p><strong>El. paštas:</strong> ${customer.email}</p>
            <p><strong>Telefonas:</strong> ${customer.phone}</p>
            ${customer.address ? `<p><strong>Adresas:</strong> ${customer.address}</p>` : ''}
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
          <p style="color: #6b7280; font-size: 14px;">Sutartis pridėta kaip PDF. Klientui (${recipientEmail}) taip pat išsiųsta.</p>
        </div>
      `,
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
    });

    console.log("Contract emails sent to customer and admin");

    return new Response(
      JSON.stringify({ success: true, contractUrl: contractPath, message: "Contract generated and sent successfully" }),
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
