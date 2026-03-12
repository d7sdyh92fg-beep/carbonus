import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Generate the main contract page
function drawMainContract(pdfDoc: any, font: any, fontBold: any, data: {
  reservationId: string;
  date: string;
  customer: any;
  car: any;
  reservation: any;
  signatureBytes: Uint8Array | null;
}) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { reservationId, date, customer, car, reservation } = data;
  let y = 790;

  // Title - centered
  const pageWidth = 595.28;
  const title1 = 'AUTOMOBILIŲ NUOMOS SUTARTIS';
  const title1Width = fontBold.widthOfTextAtSize(title1, 16);
  page.drawText(title1, { x: (pageWidth - title1Width) / 2, y, size: 16, font: fontBold, color: rgb(0, 0, 0) });
  y -= 22;
  const nrText = `Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const nrWidth = font.widthOfTextAtSize(nrText, 11);
  page.drawText(nrText, { x: (pageWidth - nrWidth) / 2, y, size: 11, font });
  y -= 16;
  const dateWidth = font.widthOfTextAtSize(date, 10);
  page.drawText(date, { x: (pageWidth - dateWidth) / 2, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 28;

  drawLine(page, y);
  y -= 20;

  // ===== NUOMOTOJAS (Lessor) =====
  page.drawText('1. NUOMOTOJAS', { x: 40, y, size: 12, font: fontBold });
  y -= 18;

  const lessorRows = [
    ['Pavadinimas', 'MB "Carbonus"'],
    ['Įmonės kodas', '307196558'],
    ['Adresas', 'Neravų 2A-6, Druskininkai, Druskininkų sav.'],
    ['A/S', 'LT547189900059467578, AB Artea bankas'],
    ['Telefonas', '+37069818781'],
    ['El. paštas', 'info@carbonus.lt'],
  ];
  for (const [k, v] of lessorRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== NUOMININKAS (Tenant) =====
  page.drawText('2. NUOMININKAS', { x: 40, y, size: 12, font: fontBold });
  y -= 18;

  const isCorporate = customer.is_corporate;
  const tenantRows: [string, string][] = [];

  if (isCorporate && customer.company_name) {
    tenantRows.push(['Įmonės pavadinimas', customer.company_name]);
    if (customer.company_code) tenantRows.push(['Įmonės kodas', customer.company_code]);
    if (customer.vat_code) tenantRows.push(['PVM mokėtojo kodas', customer.vat_code]);
    tenantRows.push(['Atstovas', `${customer.first_name} ${customer.last_name}`]);
  } else {
    tenantRows.push(['Vardas, pavardė', `${customer.first_name} ${customer.last_name}`]);
  }
  if (customer.address) tenantRows.push(['Adresas', customer.address]);
  tenantRows.push(['Telefonas', customer.phone]);
  tenantRows.push(['El. paštas', customer.email]);
  if (customer.refund_account_number) tenantRows.push(['Banko sąskaita', customer.refund_account_number]);

  for (const [k, v] of tenantRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(String(v), { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== SUTARTIES SĄLYGOS =====
  page.drawText('3. PAGRINDINĖS SĄLYGOS', { x: 40, y, size: 12, font: fontBold });
  y -= 18;

  const terms = [
    '3.1. Nuomotojas įsipareigoja perduoti techniškai tvarkingą automobilį nuomininkui.',
    '3.2. Nuomininkas įsipareigoja naudoti automobilį pagal paskirtį ir laikytis KET.',
    '3.3. Automobilis turi būti grąžintas švarus ir tokiu pačiu degalų lygiu.',
    '3.4. Už pavėluotą grąžinimą taikomas 20 EUR/val. mokestis.',
    '3.5. Užstatas grąžinamas per 3-5 darbo dienas po automobilio apžiūros.',
    '3.6. Nuomotojas neatsako už asmeninius daiktus, paliktus automobilyje.',
    '3.7. Draudžiama rūkyti automobilyje. Pažeidus – 150 EUR bauda.',
    '3.8. Nuomininkas privalo nedelsiant pranešti apie bet kokį eismo įvykį ar gedimą.',
  ];

  for (const term of terms) {
    y = drawWrappedText(page, term, 50, y, font, 9, 490);
    y -= 4;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== PARAŠAI =====
  page.drawText('4. ŠALIŲ PARAŠAI', { x: 40, y, size: 12, font: fontBold });
  y -= 24;

  page.drawText('Nuomotojas:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('Nuomininkas:', { x: 320, y, size: 10, font: fontBold });
  y -= 16;
  page.drawText('MB "Carbonus"', { x: 50, y, size: 10, font });

  const signerName = isCorporate && customer.company_name
    ? `${customer.company_name} (${customer.first_name} ${customer.last_name})`
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 320, y, size: 10, font });
  y -= 50;

  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });

  return page;
}

// Generate the appendix page (Priedas Nr. 1)
async function drawAppendix(pdfDoc: any, font: any, fontBold: any, data: {
  reservationId: string;
  date: string;
  customer: any;
  car: any;
  reservation: any;
  signatureBytes: Uint8Array | null;
}) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { reservationId, date, customer, car, reservation } = data;
  let y = 790;

  // Title - centered
  const pageWidth = 595.28;
  const appTitle = 'PRIEDAS Nr. 1';
  const appTitleWidth = fontBold.widthOfTextAtSize(appTitle, 16);
  page.drawText(appTitle, { x: (pageWidth - appTitleWidth) / 2, y, size: 16, font: fontBold });
  y -= 20;
  const subTitle = `prie Automobilių nuomos sutarties Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const subTitleWidth = font.widthOfTextAtSize(subTitle, 10);
  page.drawText(subTitle, { x: (pageWidth - subTitleWidth) / 2, y, size: 10, font });
  y -= 16;
  const dateWidth = font.widthOfTextAtSize(date, 10);
  page.drawText(date, { x: (pageWidth - dateWidth) / 2, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 28;

  drawLine(page, y);
  y -= 20;

  // ===== 1. NUOMOTOJAS =====
  page.drawText('1. NUOMOTOJAS', { x: 40, y, size: 11, font: fontBold });
  y -= 18;

  const lessorRows = [
    ['Pavadinimas', 'MB "Carbonus"'],
    ['Įmonės kodas', '307196558'],
    ['Adresas', 'Neravų 2A-6, Druskininkai, Druskininkų sav.'],
    ['A/S', 'LT547189900059467578, AB Artea bankas'],
    ['Telefonas', '+37069818781'],
    ['El. paštas', 'info@carbonus.lt'],
  ];
  for (const [k, v] of lessorRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== 2. NUOMININKAS =====
  page.drawText('2. NUOMININKAS', { x: 40, y, size: 11, font: fontBold });
  y -= 18;

  const isCorporate = customer.is_corporate;
  const tenantRows: [string, string][] = [];

  if (isCorporate && customer.company_name) {
    tenantRows.push(['Įmonės pavadinimas', customer.company_name]);
    if (customer.company_code) tenantRows.push(['Įmonės kodas', customer.company_code]);
    if (customer.vat_code) tenantRows.push(['PVM mokėtojo kodas', customer.vat_code]);
    tenantRows.push(['Atstovas', `${customer.first_name} ${customer.last_name}`]);
  } else {
    tenantRows.push(['Vardas, pavardė', `${customer.first_name} ${customer.last_name}`]);
  }
  if (customer.address) tenantRows.push(['Adresas', customer.address]);
  tenantRows.push(['Telefonas', customer.phone]);
  tenantRows.push(['El. paštas', customer.email]);

  for (const [k, v] of tenantRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(String(v), { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== 3. AUTOMOBILIS =====
  page.drawText('3. AUTOMOBILIS', { x: 40, y, size: 11, font: fontBold });
  y -= 18;

  const carRows: [string, string][] = [
    ['Markė, modelis', car?.name || reservation.car_name || '—'],
    ['Metai', car?.year ? String(car.year) : '—'],
    ['Kategorija', car?.category || '—'],
    ['Kuro tipas', car?.fuel || '—'],
    ['Pavarų dėžė', car?.transmission || '—'],
    ['Keleivių skaičius', car?.passengers ? String(car.passengers) : '—'],
  ];
  if (car?.license_plate) carRows.push(['Valst. numeris', car.license_plate]);
  if (car?.current_mileage) carRows.push(['Rida', `${car.current_mileage} km`]);

  for (const [k, v] of carRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== 4. NUOMOS LAIKOTARPIS =====
  page.drawText('4. NUOMOS LAIKOTARPIS IR KAINA', { x: 40, y, size: 11, font: fontBold });
  y -= 18;

  const pickupTime = reservation.pickup_time || '10:00';
  const returnTime = reservation.return_time || '10:00';

  const rentalRows: [string, string][] = [
    ['Nuomos pradžia', `${reservation.start_date} ${pickupTime}`],
    ['Nuomos pabaiga', `${reservation.end_date} ${returnTime}`],
    ['Nuomos dienų skaičius', `${reservation.rental_days}`],
    ['Dienos kaina', `€${reservation.daily_rate}`],
    ['Nuomos kaina', `€${reservation.total_rental_cost}`],
    ['Užstatas', `€${reservation.deposit_amount}`],
    ['Bendra suma', `€${reservation.total_amount}`],
  ];

  for (const [k, v] of rentalRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font });
    y -= 15;
  }

  y -= 10;
  drawLine(page, y);
  y -= 20;

  // ===== SIGNATURE =====
  page.drawText('ŠALIŲ PARAŠAI', { x: 40, y, size: 11, font: fontBold });
  y -= 24;

  page.drawText('Nuomotojas:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('Nuomininkas:', { x: 320, y, size: 10, font: fontBold });
  y -= 16;
  page.drawText('MB "Carbonus"', { x: 50, y, size: 10, font });

  const signerName = isCorporate && customer.company_name
    ? `${customer.company_name}`
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 320, y, size: 10, font });
  y -= 14;

  // Embed digital signature if available
  if (data.signatureBytes) {
    try {
      const png = await pdfDoc.embedPng(data.signatureBytes);
      const scale = Math.min(150 / png.width, 50 / png.height);
      const w = png.width * scale;
      const h = png.height * scale;
      page.drawImage(png, { x: 320, y: y - h, width: w, height: h });
      y -= h + 10;
    } catch (_e) {
      // continue without signature image
    }
  }

  y -= 30;
  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });

  return page;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Generate PDF with 2 pages
    let contractPath: string | null = null;
    try {
      const pdfDoc = await PDFDocument.create();
      const { font, fontBold } = await loadFonts(pdfDoc);
      const todayStr = new Date().toLocaleDateString('lt-LT');

      const pdfData = {
        reservationId,
        date: todayStr,
        customer,
        car,
        reservation: resData,
        signatureBytes,
      };

      // Page 1: Main contract
      drawMainContract(pdfDoc, font, fontBold, pdfData);

      // Page 2: Appendix
      await drawAppendix(pdfDoc, font, fontBold, pdfData);

      const pdfBytes = await pdfDoc.save();
      const pdfFilePath = `${reservationId}/nuomos_sutartis_${reservationId}.pdf`;
      const { error: pdfUploadError } = await supabase.storage
        .from('contracts')
        .upload(pdfFilePath, pdfBytes, { contentType: 'application/pdf', upsert: true });
      if (!pdfUploadError) {
        contractPath = pdfFilePath;
      } else {
        console.error('PDF upload failed:', pdfUploadError);
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    // Download PDF for email attachment
    let pdfAttachment = null;
    if (contractPath) {
      try {
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('contracts')
          .download(contractPath);
        if (!downloadError && pdfData) {
          const arrayBuffer = await pdfData.arrayBuffer();
          const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          pdfAttachment = { filename: `nuomos_sutartis_${reservationId}.pdf`, content: base64Pdf };
        }
      } catch (pdfError) {
        console.error('Failed to download PDF for attachment:', pdfError);
      }
    }

    // Email summary
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

    // Send email to customer with contract PDF
    const customerEmail = customerEmailOverride || customer.email;
    if (customerEmail) {
      await resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: [customerEmail],
        subject: `Nuomos sutartis Nr. ${reservationId.substring(0, 8).toUpperCase()} – CARBONUS`,
        html: emailSummary,
        ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
      });
    }

    // Send email to admin
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
          <p style="color: #6b7280; font-size: 14px;">Sutartis pridėta kaip PDF. Klientui (${customerEmail}) taip pat išsiųsta.</p>
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
